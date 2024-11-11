import React from 'react';
import { Alert } from 'react-native';

import {
  MessageContextValue,
  useMessageContext,
} from '../../../contexts/messageContext/MessageContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../../contexts/messagesContext/MessagesContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';

import type { DefaultErmisChatGenerics } from '../../../types/types';

export type MessageBouncePropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessagesContextValue<ErmisChatGenerics>,
  'setEditingState' | 'removeMessage' | 'retrySendMessage'
> &
  Pick<MessageContextValue<ErmisChatGenerics>, 'message'> & {
    setIsBounceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };

export const MessageBounceWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageBouncePropsWithContext<ErmisChatGenerics>,
) => {
  const { t } = useTranslationContext();
  const { message, removeMessage, retrySendMessage, setEditingState, setIsBounceDialogOpen } =
    props;

  const handleEditMessage = () => {
    setEditingState(message);
    if (setIsBounceDialogOpen) {
      setIsBounceDialogOpen(false);
    }
  };

  const handleResend = () => {
    retrySendMessage(message);
    if (setIsBounceDialogOpen) {
      setIsBounceDialogOpen(false);
    }
  };

  const handleRemoveMessage = () => {
    removeMessage(message);
    if (setIsBounceDialogOpen) {
      setIsBounceDialogOpen(false);
    }
  };

  return (
    <>
      {Alert.alert(
        t('Are you sure?'),
        t(
          'Consider how your comment might make others feel and be sure to follow our Community Guidelines',
        ),
        [
          { onPress: handleResend, text: t('Send Anyway') },
          { onPress: handleEditMessage, text: t('Edit Message') },
          { onPress: handleRemoveMessage, text: t('Delete Message') },
        ],
        { cancelable: true },
      )}
    </>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: MessageBouncePropsWithContext<ErmisChatGenerics>,
  nextProps: MessageBouncePropsWithContext<ErmisChatGenerics>,
) => {
  const { message: prevMessage } = prevProps;
  const { message: nextMessage } = nextProps;
  const messageEqual =
    prevMessage.cid === nextMessage.cid &&
    prevMessage.type === nextMessage.type &&
    prevMessage.text === nextMessage.text;
  if (!messageEqual) return false;

  return true;
};

const MemoizedMessageBounce = React.memo(
  MessageBounceWithContext,
  areEqual,
) as typeof MessageBounceWithContext;

export type MessageBounceProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<MessageBouncePropsWithContext<ErmisChatGenerics>> & {
  setIsBounceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const MessageBounce = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageBounceProps<ErmisChatGenerics>,
) => {
  const { message } = useMessageContext<ErmisChatGenerics>();
  const { removeMessage, retrySendMessage, setEditingState } =
    useMessagesContext<ErmisChatGenerics>();
  return (
    <MemoizedMessageBounce<ErmisChatGenerics>
      {...{
        message,
        removeMessage,
        retrySendMessage,
        setEditingState,
      }}
      {...props}
    />
  );
};
