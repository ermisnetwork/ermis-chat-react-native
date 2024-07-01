import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import {
  MessageContextValue,
  useMessageContext,
} from '../../../contexts/messageContext/MessageContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';
import { PinHeader } from '../../../icons';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  label: {},
});

import type { DefaultErmisChatGenerics } from '../../../types/types';

export type MessagePinnedHeaderPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageContextValue<ErmisChatGenerics>, 'alignment' | 'message'>;

const MessagePinnedHeaderWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessagePinnedHeaderPropsWithContext<ErmisChatGenerics>,
) => {
  const { alignment, message } = props;
  const {
    theme: {
      colors: { grey },
      messageSimple: { pinnedHeader },
    },
  } = useTheme();
  const { container, label } = pinnedHeader;
  const { t } = useTranslationContext();
  const { client } = useChatContext();
  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: alignment === 'left' ? 'flex-start' : 'flex-end',
        },
        container,
      ]}
      testID='message-pinned'
    >
      <PinHeader pathFill={grey} />
      <Text style={[{ color: grey }, styles.label, label]}>
        {t<string>('Pinned by')}{' '}
        {message?.pinned_by?.id === client?.user?.id ? t<string>('You') : message?.pinned_by?.name}
      </Text>
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: MessagePinnedHeaderPropsWithContext<ErmisChatGenerics>,
  nextProps: MessagePinnedHeaderPropsWithContext<ErmisChatGenerics>,
) => {
  const { message: prevMessage } = prevProps;
  const { message: nextMessage } = nextProps;
  const messageEqual =
    prevMessage.deleted_at === nextMessage.deleted_at &&
    prevMessage.status === nextMessage.status &&
    prevMessage.type === nextMessage.type &&
    prevMessage.text === nextMessage.text &&
    prevMessage.pinned === nextMessage.pinned;
  if (!messageEqual) return false;
  return true;
};

const MemoizedMessagePinnedHeader = React.memo(
  MessagePinnedHeaderWithContext,
  areEqual,
) as typeof MessagePinnedHeaderWithContext;

export type MessagePinnedHeaderProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<MessagePinnedHeaderPropsWithContext<ErmisChatGenerics>>;

export const MessagePinnedHeader = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessagePinnedHeaderProps<ErmisChatGenerics>,
) => {
  const { alignment, lastGroupMessage, message } = useMessageContext<ErmisChatGenerics>();

  return (
    <MemoizedMessagePinnedHeader
      {...{
        alignment,
        lastGroupMessage,
        message,
      }}
      {...props}
    />
  );
};

MessagePinnedHeader.displayName = 'MessagePinnedHeader{messageSimple{pinned}}';
