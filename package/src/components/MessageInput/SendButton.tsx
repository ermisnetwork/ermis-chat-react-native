import React from 'react';

import { Pressable } from 'react-native';

import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { Search } from '../../icons/Search';
import { SendRight } from '../../icons/SendRight';
import { SendUp } from '../../icons/SendUp';

import type { DefaultErmisChatGenerics } from '../../types/types';

type SendButtonPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageInputContextValue<ErmisChatGenerics>, 'giphyActive' | 'sendMessage'> & {
  /** Disables the button */ disabled: boolean;
};

const SendButtonWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: SendButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled = false, giphyActive, sendMessage } = props;
  const {
    theme: {
      colors: { accent_blue, grey_gainsboro },
      messageInput: { searchIcon, sendButton, sendRightIcon, sendUpIcon },
    },
  } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={disabled ? () => null : () => sendMessage()}
      style={[sendButton]}
      testID='send-button'
    >
      {giphyActive ? (
        <Search pathFill={disabled ? grey_gainsboro : accent_blue} {...searchIcon} />
      ) : disabled ? (
        <SendRight fill={grey_gainsboro} size={32} {...sendRightIcon} />
      ) : (
        <SendUp fill={accent_blue} size={32} {...sendUpIcon} />
      )}
    </Pressable>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: SendButtonPropsWithContext<ErmisChatGenerics>,
  nextProps: SendButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    disabled: prevDisabled,
    giphyActive: prevGiphyActive,
    sendMessage: prevSendMessage,
  } = prevProps;
  const {
    disabled: nextDisabled,
    giphyActive: nextGiphyActive,
    sendMessage: nextSendMessage,
  } = nextProps;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  const giphyActiveEqual = prevGiphyActive === nextGiphyActive;
  if (!giphyActiveEqual) return false;

  const sendMessageEqual = prevSendMessage === nextSendMessage;
  if (!sendMessageEqual) return false;

  return true;
};

const MemoizedSendButton = React.memo(
  SendButtonWithContext,
  areEqual,
) as typeof SendButtonWithContext;

export type SendButtonProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<SendButtonPropsWithContext<ErmisChatGenerics>>;

/**
 * UI Component for send button in MessageInput component.
 */
export const SendButton = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: SendButtonProps<ErmisChatGenerics>,
) => {
  const { giphyActive, sendMessage } = useMessageInputContext<ErmisChatGenerics>();

  return (
    <MemoizedSendButton
      {...{ giphyActive, sendMessage }}
      {...props}
      {...{ disabled: props.disabled || false }}
    />
  );
};

SendButton.displayName = 'SendButton{messageInput}';
