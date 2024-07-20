import React from 'react';

import type { ChannelPreviewProps } from './ChannelPreview';
import { useChannelPreviewDisplayAvatar } from './hooks/useChannelPreviewDisplayAvatar';
import { useChannelPreviewDisplayPresence } from './hooks/useChannelPreviewDisplayPresence';

import { ChatContextValue, useChatContext } from '../../contexts/chatContext/ChatContext';
import type { DefaultErmisChatGenerics } from '../../types/types';
import { Avatar } from '../Avatar/Avatar';
import { GroupAvatar } from '../Avatar/GroupAvatar';

export type ChannelAvatarProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelPreviewProps<ErmisChatGenerics>, 'channel'>;

/**
 * This UI component displays an avatar for a particular channel.
 */
export const ChannelAvatarWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelAvatarProps<ErmisChatGenerics> & Pick<ChatContextValue, 'ImageComponent'>,
) => {
  const { channel, ImageComponent } = props;

  const displayAvatar = useChannelPreviewDisplayAvatar(channel);
  const displayPresence = useChannelPreviewDisplayPresence(channel);

  if (displayAvatar.images) {
    return (
      <GroupAvatar
        ImageComponent={ImageComponent}
        images={displayAvatar.images}
        names={displayAvatar.names}
        size={40}
      />
    );
  }

  return (
    <Avatar
      image={displayAvatar.image}
      ImageComponent={ImageComponent}
      name={displayAvatar.name}
      online={displayPresence}
      size={40}
    />
  );
};

export const ChannelAvatar = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelAvatarProps<ErmisChatGenerics>,
) => {
  const { ImageComponent } = useChatContext<ErmisChatGenerics>();

  return <ChannelAvatarWithContext {...props} ImageComponent={ImageComponent} />;
};
