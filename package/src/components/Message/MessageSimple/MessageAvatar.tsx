import React from 'react';
import { View } from 'react-native';

import { ChatContextValue, useChatContext } from '../../../contexts/chatContext/ChatContext';
import {
  MessageContextValue,
  useMessageContext,
} from '../../../contexts/messageContext/MessageContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';

import type { DefaultErmisChatGenerics } from '../../../types/types';
import { Avatar, AvatarProps } from '../../Avatar/Avatar';
import { ChannelContextValue, useChannelContext } from '../../../contexts';

export type MessageAvatarPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessageContextValue<ErmisChatGenerics>,
  'alignment' | 'lastGroupMessage' | 'message' | 'showAvatar'
> &
  Pick<ChatContextValue<ErmisChatGenerics>, 'ImageComponent'> &
  Partial<Pick<AvatarProps, 'size'>>
  & Pick<ChannelContextValue<ErmisChatGenerics>, 'channel'>
  ;

const MessageAvatarWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageAvatarPropsWithContext<ErmisChatGenerics>,
) => {
  const { alignment, ImageComponent, lastGroupMessage, message, showAvatar, size, channel } = props;
  const {
    theme: {
      avatar: { BASE_AVATAR_SIZE },
      messageSimple: {
        avatarWrapper: { container, leftAlign, rightAlign, spacer },
      },
    },
  } = useTheme();

  const visible = typeof showAvatar === 'boolean' ? showAvatar : lastGroupMessage;
  let avatar = "";
  if (message.user && message.user.id) {
    const user = channel._client.state.users[message.user.id];
    if (user && user.avatar) {
      avatar = user.avatar;
    }
  }

  return (
    <View
      style={[alignment === 'left' ? leftAlign : rightAlign, container]}
      testID='message-avatar'
    >
      {visible ? (
        <Avatar
          image={avatar}
          ImageComponent={ImageComponent}
          name={message.user?.name || message.user?.id}
          size={size || BASE_AVATAR_SIZE}
        />
      ) : (
        <View style={spacer} testID='spacer' />
      )}
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: MessageAvatarPropsWithContext<ErmisChatGenerics>,
  nextProps: MessageAvatarPropsWithContext<ErmisChatGenerics>,
) => {
  const { lastGroupMessage: prevLastGroupMessage, message: prevMessage } = prevProps;
  const { lastGroupMessage: nextLastGroupMessage, message: nextMessage } = nextProps;

  const lastGroupMessageEqual = prevLastGroupMessage === nextLastGroupMessage;
  if (!lastGroupMessageEqual) return false;

  const userEqual =
    prevMessage.user?.avatar === nextMessage.user?.avatar &&
    prevMessage.user?.name === nextMessage.user?.name &&
    prevMessage.user?.id === nextMessage.user?.id;
  if (!userEqual) return false;

  return true;
};

const MemoizedMessageAvatar = React.memo(
  MessageAvatarWithContext,
  areEqual,
) as typeof MessageAvatarWithContext;

export type MessageAvatarProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<MessageAvatarPropsWithContext<ErmisChatGenerics>>;

export const MessageAvatar = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageAvatarProps<ErmisChatGenerics>,
) => {
  const { alignment, lastGroupMessage, message, showAvatar } =
    useMessageContext<ErmisChatGenerics>();
  const { ImageComponent } = useChatContext<ErmisChatGenerics>();
  const { channel } = useChannelContext<ErmisChatGenerics>();

  return (
    <MemoizedMessageAvatar
      {...{
        alignment,
        ImageComponent,
        lastGroupMessage,
        message,
        showAvatar,
        channel
      }}
      {...props}
    />
  );
};

MessageAvatar.displayName = 'MessageAvatar{messageSimple{avatarWrapper}}';
