import { useMemo } from 'react';

import type { ThreadContextValue } from '../../../contexts/threadContext/ThreadContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { reduceMessagesToString } from '../../../utils/utils';

export const useCreateThreadContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  allowThreadMessagesInChannel,
  closeThread,
  loadMoreThread,
  openThread,
  reloadThread,
  setThreadLoadingMore,
  thread,
  threadHasMore,
  threadLoadingMore,
  threadMessages,
}: ThreadContextValue<ErmisChatGenerics>) => {
  const threadId = thread?.id;
  const threadReplyCount = thread?.reply_count;
  const threadMessagesStr = reduceMessagesToString(threadMessages);

  const threadContext: ThreadContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      allowThreadMessagesInChannel,
      closeThread,
      loadMoreThread,
      openThread,
      reloadThread,
      setThreadLoadingMore,
      thread,
      threadHasMore,
      threadLoadingMore,
      threadMessages,
    }),
    [
      allowThreadMessagesInChannel,
      threadHasMore,
      threadId,
      threadLoadingMore,
      threadMessagesStr,
      threadReplyCount,
    ],
  );

  return threadContext;
};
