import { useEffect, useState } from 'react';

import type { Channel, ErmisChat, UserResponse } from 'ermis-chat-sdk';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../types/types';

export const getChannelPreviewDisplayAvatar = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
  client: ErmisChat<ErmisChatGenerics>,
) => {
  const currentUserId = client?.user?.id;
  const channelId = channel?.id;
  const channelData = channel?.data;
  const channelName = channelData?.name;
  const channelImage = channelData?.image;
  if (channelImage) {
    return {
      id: channelId,
      image: channelImage,
      name: channelName,
    };
  } else if (currentUserId) {
    const channelMembers = Object.values(channel?.state?.members || {});

    const members = channelMembers.map((member) => {
      if (member.user?.id) {
        const user = client.state?.users[member.user?.id];
        if (user) {
          return user
        }
      }
      return member.user || { id: member.user_id } as UserResponse<ErmisChatGenerics>;
    });
    const otherMembers = members.filter((member) => member.id !== currentUserId);

    if (otherMembers.length === 1 && channel.type === 'messaging') {
      return {
        id: otherMembers[0].id,
        image: otherMembers[0].avatar,
        name: channelName || otherMembers[0].name,
      };
    }

    return {
      ids: otherMembers.slice(0, 4).map((member) => member.id || ''),
      images: otherMembers.slice(0, 4).map((member) => member.avatar || ''),
      names: otherMembers.slice(0, 4).map((member) => member.name || ''),
    };
  }
  return {
    id: channelId,
    name: channelName,
  };
};

/**
 * Hook to set the display avatar for channel preview
 * @param {*} channel
 *
 * @returns {object} e.g., { image: 'http://dummyurl.com/test.png', name: 'Uhtred Bebbanburg' }
 */
export const useChannelPreviewDisplayAvatar = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  const channelData = channel?.data;
  const image = channelData?.image;
  const name = channelData?.name;
  const id = client?.user?.id;
  const members = channelData?.members;

  const [displayAvatar, setDisplayAvatar] = useState(
    getChannelPreviewDisplayAvatar(channel, client),
  );

  useEffect(() => {
    setDisplayAvatar(getChannelPreviewDisplayAvatar(channel, client));
  }, [id, image, name, members]);

  return displayAvatar;
};
