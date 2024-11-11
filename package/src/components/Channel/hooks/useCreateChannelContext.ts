import { useMemo } from 'react';

import type { ChannelContextValue } from '../../../contexts/channelContext/ChannelContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useCreateChannelContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channel,
  disabled,
  EmptyStateIndicator,
  enableMessageGroupingByUser,
  enforceUniqueReaction,
  error,
  giphyEnabled,
  hideDateSeparators,
  hideStickyDateHeader,
  isAdmin,
  isChannelActive,
  isModerator,
  isOwner,
  lastRead,
  loadChannelAroundMessage,
  loadChannelAtMessage,
  loading,
  LoadingIndicator,
  markRead,
  maxTimeBetweenGroupedMessages,
  members,
  NetworkDownIndicator,
  read,
  reloadChannel,
  scrollToFirstUnreadThreshold,
  setLastRead,
  setTargetedMessage,
  StickyHeader,
  targetedMessage,
  threadList,
  uploadAbortControllerRef,
  watcherCount,
  watchers,
}: ChannelContextValue<ErmisChatGenerics>) => {
  const channelId = channel?.id;
  const lastReadTime = lastRead?.getTime();
  const membersLength = Object.keys(members).length;

  const readUsers = Object.values(read);
  const readUsersLength = readUsers.length;
  const readUsersLastReads = readUsers.map(({ last_read }) => last_read.toISOString()).join();

  const channelContext: ChannelContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      channel,
      disabled,
      EmptyStateIndicator,
      enableMessageGroupingByUser,
      enforceUniqueReaction,
      error,
      giphyEnabled,
      hideDateSeparators,
      hideStickyDateHeader,
      isAdmin,
      isChannelActive,
      isModerator,
      isOwner,
      lastRead,
      loadChannelAroundMessage,
      loadChannelAtMessage,
      loading,
      LoadingIndicator,
      markRead,
      maxTimeBetweenGroupedMessages,
      members,
      NetworkDownIndicator,
      read,
      reloadChannel,
      scrollToFirstUnreadThreshold,
      setLastRead,
      setTargetedMessage,
      StickyHeader,
      targetedMessage,
      threadList,
      uploadAbortControllerRef,
      watcherCount,
      watchers,
    }),
    [
      channelId,
      disabled,
      error,
      isChannelActive,
      lastReadTime,
      loading,
      membersLength,
      readUsersLength,
      readUsersLastReads,
      targetedMessage,
      threadList,
      watcherCount,
    ],
  );

  return channelContext;
};
