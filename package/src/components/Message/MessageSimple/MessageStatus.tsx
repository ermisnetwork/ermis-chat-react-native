import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  MessageContextValue,
  useMessageContext,
} from '../../../contexts/messageContext/MessageContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { Check } from '../../../icons/Check';
import { CheckAll } from '../../../icons/CheckAll';
import { Time } from '../../../icons/Time';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { MessageStatusTypes } from '../../../utils/utils';

import { isMessageWithStylesReadByAndDateSeparator } from '../../MessageList/hooks/useMessageList';

const styles = StyleSheet.create({
  readByCount: {
    fontSize: 11,
    fontWeight: '700',
    paddingRight: 3,
  },
  statusContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingRight: 3,
  },
});

export type MessageStatusPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageContextValue<ErmisChatGenerics>, 'message' | 'threadList'>;

const MessageStatusWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageStatusPropsWithContext<ErmisChatGenerics>,
) => {
  const { message, threadList } = props;

  const {
    theme: {
      colors: { accent_blue, grey_dark },
      messageSimple: {
        status: { checkAllIcon, checkIcon, readByCount, statusContainer, timeIcon },
      },
    },
  } = useTheme();

  if (message.status === MessageStatusTypes.SENDING) {
    return (
      <View style={[styles.statusContainer, statusContainer]} testID='sending-container'>
        <Time {...timeIcon} />
      </View>
    );
  }

  if (threadList || message.status === MessageStatusTypes.FAILED) return null;

  if (isMessageWithStylesReadByAndDateSeparator(message)) {
    return (
      <View style={[styles.statusContainer, statusContainer]}>
        {typeof message.readBy === 'number' ? (
          <Text
            style={[styles.readByCount, { color: accent_blue }, readByCount]}
            testID='read-by-container'
          >
            {message.readBy}
          </Text>
        ) : null}
        {message.type !== 'error' ? (
          typeof message.readBy === 'number' || message.readBy === true ? (
            <CheckAll pathFill={accent_blue} {...checkAllIcon} />
          ) : (
            <Check pathFill={grey_dark} {...checkIcon} />
          )
        ) : null}
      </View>
    );
  }

  if (message.status === MessageStatusTypes.RECEIVED && message.type !== 'ephemeral') {
    return (
      <View style={[styles.statusContainer, statusContainer]} testID='delivered-container'>
        <Check pathFill={grey_dark} {...checkIcon} />
      </View>
    );
  }

  return null;
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: MessageStatusPropsWithContext<ErmisChatGenerics>,
  nextProps: MessageStatusPropsWithContext<ErmisChatGenerics>,
) => {
  const { message: prevMessage, threadList: prevThreadList } = prevProps;
  const { message: nextMessage, threadList: nextThreadList } = nextProps;

  const threadListEqual = prevThreadList === nextThreadList;
  if (!threadListEqual) return false;

  const messageEqual =
    prevMessage.status === nextMessage.status &&
    prevMessage.type === nextMessage.type &&
    (isMessageWithStylesReadByAndDateSeparator(prevMessage) && prevMessage.readBy) ===
    (isMessageWithStylesReadByAndDateSeparator(nextMessage) && nextMessage.readBy);
  if (!messageEqual) return false;

  return true;
};

const MemoizedMessageStatus = React.memo(
  MessageStatusWithContext,
  areEqual,
) as typeof MessageStatusWithContext;

export type MessageStatusProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<MessageStatusPropsWithContext<ErmisChatGenerics>>;

export const MessageStatus = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageStatusProps<ErmisChatGenerics>,
) => {
  const { message, threadList } = useMessageContext<ErmisChatGenerics>();

  return <MemoizedMessageStatus {...{ message, threadList }} {...props} />;
};

MessageStatus.displayName = 'MessageStatus{messageSimple{status}}';
