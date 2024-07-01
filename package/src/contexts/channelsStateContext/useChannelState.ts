import { useCallback, useEffect, useMemo } from 'react';

import type { Channel as ChannelType } from 'ermis-chat-sdk-test';

import { useChannelsStateContext } from './ChannelsStateContext';

import type { ChannelsStateContextValue, ChannelState, Keys } from './ChannelsStateContext';

import type { DefaultErmisChatGenerics } from '../../types/types';

type StateManagerParams<
  Key extends Keys,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Omit<
  ChannelsStateContextValue<ErmisChatGenerics>,
  'increaseSubscriberCount' | 'decreaseSubscriberCount'
> & {
  cid: string;
  key: Key;
};

/* 
  This hook takes care of creating a useState-like interface which can be used later to call
  updates to the ChannelsStateContext reducer. It receives the cid and key which it wants to update
  and perform the state updates. Also supports a initialState.
*/
function useStateManager<
  Key extends Keys,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  {
    cid,
    key,
    setState,
    state,
  }: Omit<
    StateManagerParams<Key, ErmisChatGenerics>,
    'increaseSubscriberCount' | 'decreaseSubscriberCount'
  >,
  initialValue?: ChannelState<ErmisChatGenerics>[Key],
) {
  const memoizedInitialValue = useMemo(() => initialValue, []);
  const value =
    state[cid]?.[key] || (memoizedInitialValue as ChannelState<ErmisChatGenerics>[Key]);

  const setValue = useCallback(
    (value: ChannelState<ErmisChatGenerics>[Key]) => setState({ cid, key, value }),
    [cid, key],
  );

  return [value, setValue] as const;
}

export type UseChannelStateValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  members: ChannelState<ErmisChatGenerics>['members'];
  messages: ChannelState<ErmisChatGenerics>['messages'];
  read: ChannelState<ErmisChatGenerics>['read'];
  setMembers: (value: ChannelState<ErmisChatGenerics>['members']) => void;
  setMessages: (value: ChannelState<ErmisChatGenerics>['messages']) => void;
  setRead: (value: ChannelState<ErmisChatGenerics>['read']) => void;
  setThreadMessages: (value: ChannelState<ErmisChatGenerics>['threadMessages']) => void;
  setTyping: (value: ChannelState<ErmisChatGenerics>['typing']) => void;
  setWatcherCount: (value: ChannelState<ErmisChatGenerics>['watcherCount']) => void;
  setWatchers: (value: ChannelState<ErmisChatGenerics>['watchers']) => void;
  threadMessages: ChannelState<ErmisChatGenerics>['threadMessages'];
  typing: ChannelState<ErmisChatGenerics>['typing'];
  watcherCount: ChannelState<ErmisChatGenerics>['watcherCount'];
  watchers: ChannelState<ErmisChatGenerics>['watchers'];
};

export function useChannelState<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: ChannelType<ErmisChatGenerics> | undefined,
  threadId?: string,
): UseChannelStateValue<ErmisChatGenerics> {
  const cid = channel?.id || 'id'; // in case channel is not initialized, use generic id string for indexing
  const { decreaseSubscriberCount, increaseSubscriberCount, setState, state } =
    useChannelsStateContext<ErmisChatGenerics>();

  // Keeps track of how many Channel components are subscribed to this Channel state (Channel vs Thread concurrency)
  useEffect(() => {
    increaseSubscriberCount({ cid });
    return () => {
      decreaseSubscriberCount({ cid });
    };
  }, []);

  const [members, setMembers] = useStateManager(
    {
      cid,
      key: 'members',
      setState,
      state,
    },
    channel?.state?.members || {},
  );

  const [messages, setMessages] = useStateManager(
    {
      cid,
      key: 'messages',
      setState,
      state,
    },
    channel?.state?.messages || [],
  );

  const [read, setRead] = useStateManager(
    {
      cid,
      key: 'read',
      setState,
      state,
    },
    channel?.state?.read || {},
  );

  const [typing, setTyping] = useStateManager(
    {
      cid,
      key: 'typing',
      setState,
      state,
    },
    {},
  );

  const [watcherCount, setWatcherCount] = useStateManager({
    cid,
    key: 'watcherCount',
    setState,
    state,
  });

  const [watchers, setWatchers] = useStateManager(
    {
      cid,
      key: 'watchers',
      setState,
      state,
    },
    {},
  );

  const [threadMessages, setThreadMessages] = useStateManager(
    {
      cid,
      key: 'threadMessages',
      setState,
      state,
    },
    (threadId && channel?.state?.threads?.[threadId]) || [],
  );

  return {
    members,
    messages,
    read,
    setMembers,
    setMessages,
    setRead,
    setThreadMessages,
    setTyping,
    setWatcherCount,
    setWatchers,
    threadMessages,
    typing,
    watcherCount,
    watchers,
  };
}
