import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import { ActiveChannelsProvider } from '../activeChannelsRefContext/ActiveChannelsRefContext';

import type { ChannelContextValue } from '../channelContext/ChannelContext';
import type { PaginatedMessageListContextValue } from '../paginatedMessageListContext/PaginatedMessageListContext';
import type { ThreadContextValue } from '../threadContext/ThreadContext';
import type { TypingContextValue } from '../typingContext/TypingContext';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type ChannelState<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  members: ChannelContextValue<ErmisChatGenerics>['members'];
  messages: PaginatedMessageListContextValue<ErmisChatGenerics>['messages'];
  read: ChannelContextValue<ErmisChatGenerics>['read'];
  subscriberCount: number;
  threadMessages: ThreadContextValue<ErmisChatGenerics>['threadMessages'];
  typing: TypingContextValue<ErmisChatGenerics>['typing'];
  watcherCount: ChannelContextValue<ErmisChatGenerics>['watcherCount'];
  watchers: ChannelContextValue<ErmisChatGenerics>['watchers'];
};

type ChannelsState<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  [cid: string]: ChannelState<ErmisChatGenerics>;
};

export type Keys = keyof ChannelState;

export type Payload<
  Key extends Keys = Keys,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  cid: string;
  key: Key;
  value: ChannelState<ErmisChatGenerics>[Key];
};

type SetStateAction<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  payload: Payload<Keys, ErmisChatGenerics>;
  type: 'SET_STATE';
};

type IncreaseSubscriberCountAction = {
  payload: { cid: string };
  type: 'INCREASE_SUBSCRIBER_COUNT';
};
type DecreaseSubscriberCountAction = {
  payload: { cid: string };
  type: 'DECREASE_SUBSCRIBER_COUNT';
};

type Action<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  | SetStateAction<ErmisChatGenerics>
  | IncreaseSubscriberCountAction
  | DecreaseSubscriberCountAction;

export type ChannelsStateContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  decreaseSubscriberCount: (value: { cid: string }) => void;
  increaseSubscriberCount: (value: { cid: string }) => void;
  setState: (value: Payload<Keys, ErmisChatGenerics>) => void;
  state: ChannelsState<ErmisChatGenerics>;
};

type Reducer<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> = (
  state: ChannelsState<ErmisChatGenerics>,
  action: Action<ErmisChatGenerics>,
) => ChannelsState<ErmisChatGenerics>;

function reducer(state: ChannelsState, action: Action) {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        [action.payload.cid]: {
          ...(state[action.payload.cid] || {}),
          [action.payload.key]: action.payload.value,
        },
      };

    case 'INCREASE_SUBSCRIBER_COUNT': {
      const currentCount = state[action.payload.cid]?.subscriberCount ?? 0;
      return {
        ...state,
        [action.payload.cid]: {
          ...(state[action.payload.cid] || {}),
          subscriberCount: currentCount + 1,
        },
      };
    }

    case 'DECREASE_SUBSCRIBER_COUNT': {
      const currentCount = state[action.payload.cid]?.subscriberCount ?? 0;

      // If there last subscribed Channel component unsubscribes, we clear the channel state.
      if (currentCount <= 1) {
        const stateShallowCopy = {
          ...state,
        };

        delete stateShallowCopy[action.payload.cid];

        return stateShallowCopy;
      }

      return {
        ...state,
        [action.payload.cid]: {
          ...(state[action.payload.cid] || {}),
          subscriberCount: currentCount - 1,
        },
      };
    }
    default:
      throw new Error();
  }
}

const ChannelsStateContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as ChannelsStateContextValue,
);

export const ChannelsStateProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer as unknown as Reducer<ErmisChatGenerics>, {});

  const setState = useCallback((payload: Payload<Keys, ErmisChatGenerics>) => {
    dispatch({ payload, type: 'SET_STATE' });
  }, []);

  const increaseSubscriberCount = useCallback((payload: { cid: string }) => {
    dispatch({ payload, type: 'INCREASE_SUBSCRIBER_COUNT' });
  }, []);

  const decreaseSubscriberCount = useCallback((payload: { cid: string }) => {
    dispatch({ payload, type: 'DECREASE_SUBSCRIBER_COUNT' });
  }, []);

  const value = useMemo(
    () => ({
      decreaseSubscriberCount,
      increaseSubscriberCount,
      setState,
      state,
    }),
    [state],
  );

  const activeChannelsRef = useRef(Object.keys(state));

  useEffect(() => {
    activeChannelsRef.current = Object.keys(state);
  }, [state]);

  return (
    <ChannelsStateContext.Provider value={value as unknown as ChannelsStateContextValue}>
      <ActiveChannelsProvider value={activeChannelsRef}>{children}</ActiveChannelsProvider>
    </ChannelsStateContext.Provider>
  );
};

export const useChannelsStateContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    ChannelsStateContext,
  ) as unknown as ChannelsStateContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useChannelsStateContext hook was called outside the ChannelStateContext Provider. Make sure you have configured OverlayProvider component correctly - https://getstream.io/chat/docs/sdk/reactnative/basics/hello_stream_chat/#overlay-provider`,
    );
  }

  return contextValue;
};

/**
 * @deprecated
 *
 * This will be removed in the next major version.
 *
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withChannelsStateContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChannelsStateContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof ChannelsStateContextValue<ErmisChatGenerics>>> => {
  const WithChannelsStateContextComponent = (
    props: Omit<P, keyof ChannelsStateContextValue<ErmisChatGenerics>>,
  ) => {
    const channelsStateContext = useChannelsStateContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...channelsStateContext} />;
  };
  WithChannelsStateContextComponent.displayName = `WithChannelsStateContext${getDisplayName(
    Component,
  )}`;
  return WithChannelsStateContextComponent;
};
