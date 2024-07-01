import { useEffect, useState } from 'react';

import type { Channel, ErmisChat } from 'ermis-chat-sdk-test';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../types/types';

const getChannelPreviewDisplayPresence = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
  client: ErmisChat<ErmisChatGenerics>,
) => {
  const currentUserId = client.userID;

  if (currentUserId) {
    const members = Object.values(channel.state.members);
    const otherMembers = members.filter((member) => member.user?.id !== currentUserId);

    if (otherMembers.length === 1) {
      return !!otherMembers[0].user?.online;
    }
  }
  return false;
};

/**
 * Hook to set the display avatar presence for channel preview
 * @param {*} channel
 *
 * @returns {boolean} e.g., true
 */
export const useChannelPreviewDisplayPresence = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  const currentUserId = client.userID;
  const members = Object.values(channel.state.members).filter(
    (member) => !!member.user?.id && !!currentUserId && member.user?.id !== currentUserId,
  );
  const channelMemberOnline = members.some((member) => member.user?.online);

  const [displayPresence, setDisplayPresence] = useState(false);

  useEffect(() => {
    setDisplayPresence(getChannelPreviewDisplayPresence(channel, client));
  }, [channelMemberOnline]);

  return displayPresence;
};
