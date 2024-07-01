import { useMemo } from 'react';

import type { ChannelsContextValue } from '../../../contexts/channelsContext/ChannelsContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useCreateChannelsContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  additionalFlatListProps,
  channels,
  EmptyStateIndicator,
  error,
  FooterLoadingIndicator,
  forceUpdate,
  hasNextPage,
  HeaderErrorIndicator,
  HeaderNetworkDownIndicator,
  ListHeaderComponent,
  loadingChannels,
  LoadingErrorIndicator,
  LoadingIndicator,
  loadingNextPage,
  loadMoreThreshold,
  loadNextPage,
  maxUnreadCount,
  numberOfSkeletons,
  onSelect,
  Preview,
  PreviewAvatar,
  PreviewMessage,
  PreviewMutedStatus,
  PreviewStatus,
  PreviewTitle,
  PreviewUnreadCount,
  refreshing,
  refreshList,
  reloadList,
  setFlatListRef,
  Skeleton,
}: ChannelsContextValue<ErmisChatGenerics>) => {
  const channelValueString = channels
    ?.map(
      (channel) =>
        `${channel.data?.name ?? ''}${channel.id ?? ''}${Object.values(channel.state.members)
          .map((member) => member.user?.online)
          .join()}`,
    )
    .join();
  const channelsContext: ChannelsContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      additionalFlatListProps,
      channels,
      EmptyStateIndicator,
      error,
      FooterLoadingIndicator,
      forceUpdate,
      hasNextPage,
      HeaderErrorIndicator,
      HeaderNetworkDownIndicator,
      ListHeaderComponent,
      loadingChannels,
      LoadingErrorIndicator,
      LoadingIndicator,
      loadingNextPage,
      loadMoreThreshold,
      loadNextPage,
      maxUnreadCount,
      numberOfSkeletons,
      onSelect,
      Preview,
      PreviewAvatar,
      PreviewMessage,
      PreviewMutedStatus,
      PreviewStatus,
      PreviewTitle,
      PreviewUnreadCount,
      refreshing,
      refreshList,
      reloadList,
      setFlatListRef,
      Skeleton,
    }),
    [
      channelValueString,
      error,
      forceUpdate,
      hasNextPage,
      loadingChannels,
      loadingNextPage,
      refreshing,
    ],
  );

  return channelsContext;
};
