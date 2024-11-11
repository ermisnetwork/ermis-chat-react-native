import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  MessageContextValue,
  useMessageContext,
} from '../../../contexts/messageContext/MessageContext';
import { MessagesContextValue } from '../../../contexts/messagesContext/MessagesContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';
import { DefaultErmisChatGenerics } from '../../../types/types';
import { isEditedMessage } from '../../../utils/utils';

export type MessageEditedTimestampProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<Pick<MessageContextValue<ErmisChatGenerics>, 'message'>> &
  Partial<Pick<MessagesContextValue<ErmisChatGenerics>, 'MessageTimestamp'>>;

export const MessageEditedTimestamp = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageEditedTimestampProps<ErmisChatGenerics>,
) => {
  const { message: propMessage, MessageTimestamp } = props;
  const {
    theme: {
      colors: { grey },
      messageSimple: {
        content: { editedLabel, editedTimestampContainer },
      },
    },
  } = useTheme();
  const { t } = useTranslationContext();
  const { message: contextMessage } = useMessageContext<ErmisChatGenerics>();
  const message = propMessage || contextMessage;

  if (!isEditedMessage(message)) {
    return null;
  }

  return (
    <View style={[styles.container, editedTimestampContainer]}>
      <Text style={[styles.text, { color: grey }, editedLabel]}>{t<string>('Edited') + ' '}</Text>
      {MessageTimestamp && (
        <MessageTimestamp
          timestamp={message.message_text_updated_at}
          timestampTranslationKey='timestamp/MessageEditedTimestamp'
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 12,
  },
});
