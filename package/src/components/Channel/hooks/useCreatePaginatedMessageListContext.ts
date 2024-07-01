import { useMemo } from 'react';

import type { PaginatedMessageListContextValue } from '../../../contexts/paginatedMessageListContext/PaginatedMessageListContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { reduceMessagesToString } from '../../../utils/utils';

export const useCreatePaginatedMessageListContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channelId,
  hasMore,
  hasNoMoreRecentMessagesToLoad,
  loadingMore,
  loadingMoreRecent,
  loadMore,
  loadMoreRecent,
  messages,
  setLoadingMore,
  setLoadingMoreRecent,
}: PaginatedMessageListContextValue<ErmisChatGenerics> & {
  channelId?: string;
}) => {
  const messagesStr = reduceMessagesToString(messages);

  const paginatedMessagesContext: PaginatedMessageListContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      hasMore,
      hasNoMoreRecentMessagesToLoad,
      loadingMore,
      loadingMoreRecent,
      loadMore,
      loadMoreRecent,
      messages,
      setLoadingMore,
      setLoadingMoreRecent,
    }),
    [
      channelId,
      hasMore,
      loadingMoreRecent,
      loadingMore,
      hasNoMoreRecentMessagesToLoad,
      messagesStr,
    ],
  );

  return paginatedMessagesContext;
};
