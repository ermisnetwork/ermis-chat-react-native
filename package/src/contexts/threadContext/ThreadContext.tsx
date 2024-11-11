import React, { PropsWithChildren, useContext } from 'react';

import type { ChannelState } from 'ermis-chat-sdk';

import type { MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type ThreadContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  allowThreadMessagesInChannel: boolean;
  closeThread: () => void;
  loadMoreThread: () => Promise<void>;
  openThread: (message: MessageType<ErmisChatGenerics>) => void;
  reloadThread: () => void;
  setThreadLoadingMore: React.Dispatch<React.SetStateAction<boolean>>;
  thread: MessageType<ErmisChatGenerics> | null;
  threadHasMore: boolean;
  threadLoadingMore: boolean;
  threadMessages: ChannelState<ErmisChatGenerics>['threads'][string];
};

export const ThreadContext = React.createContext(DEFAULT_BASE_CONTEXT_VALUE as ThreadContextValue);

export const ThreadProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  value,
}: PropsWithChildren<{
  value: ThreadContextValue<ErmisChatGenerics>;
}>) => (
  <ThreadContext.Provider value={value as unknown as ThreadContextValue}>
    {children}
  </ThreadContext.Provider>
);

export const useThreadContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    ThreadContext,
  ) as unknown as ThreadContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useThreadContext hook was called outside of the ThreadContext provider. Make sure you have configured Channel component correctly`,
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
 * typing is desired while using the HOC withThreadContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withThreadContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof ThreadContextValue<ErmisChatGenerics>>> => {
  const WithThreadContextComponent = (
    props: Omit<P, keyof ThreadContextValue<ErmisChatGenerics>>,
  ) => {
    const threadContext = useThreadContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...threadContext} />;
  };
  WithThreadContextComponent.displayName = `WithThreadContext${getDisplayName(Component)}`;
  return WithThreadContextComponent;
};
