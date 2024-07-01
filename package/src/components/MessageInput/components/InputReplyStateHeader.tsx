import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ChannelContextValue } from '../../../contexts/channelContext/ChannelContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';

import { CircleClose, CurveLineLeftUp } from '../../../icons';
import type { DefaultErmisChatGenerics } from '../../../types/types';

const styles = StyleSheet.create({
  replyBoxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  replyBoxHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export type InputReplyStateHeaderPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageInputContextValue<ErmisChatGenerics>, 'clearQuotedMessageState' | 'resetInput'> &
  Pick<ChannelContextValue<ErmisChatGenerics>, 'disabled'>;

export const InputReplyStateHeaderWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  clearQuotedMessageState,
  disabled,
  resetInput,
}: InputReplyStateHeaderPropsWithContext<ErmisChatGenerics>) => {
  const { t } = useTranslationContext();
  const {
    theme: {
      colors: { black, grey, grey_gainsboro },
      messageInput: {
        editingStateHeader: { editingBoxHeader, editingBoxHeaderTitle },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.replyBoxHeader, editingBoxHeader]}>
      <CurveLineLeftUp pathFill={grey_gainsboro} />
      <Text style={[styles.replyBoxHeaderTitle, { color: black }, editingBoxHeaderTitle]}>
        {t<string>('Reply to Message')}
      </Text>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          resetInput();
          clearQuotedMessageState();
        }}
        testID='close-button'
      >
        <CircleClose pathFill={grey} />
      </TouchableOpacity>
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: InputReplyStateHeaderPropsWithContext<ErmisChatGenerics>,
  nextProps: InputReplyStateHeaderPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled: prevDisabled } = prevProps;
  const { disabled: nextDisabled } = nextProps;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  return true;
};

const MemoizedInputReplyStateHeader = React.memo(
  InputReplyStateHeaderWithContext,
  areEqual,
) as typeof InputReplyStateHeaderWithContext;

export type InputReplyStateHeaderProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<InputReplyStateHeaderPropsWithContext<ErmisChatGenerics>>;

export const InputReplyStateHeader = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InputReplyStateHeaderProps<ErmisChatGenerics>,
) => {
  const { clearQuotedMessageState, resetInput } = useMessageInputContext<ErmisChatGenerics>();

  return <MemoizedInputReplyStateHeader {...{ clearQuotedMessageState, resetInput }} {...props} />;
};

InputReplyStateHeader.displayName = 'ReplyStateHeader{messageInput}';
