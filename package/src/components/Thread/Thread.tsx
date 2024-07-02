import React, { useEffect } from 'react';

import { ThreadFooterComponent } from './components/ThreadFooterComponent';

import { useChannelContext } from '../../contexts/channelContext/ChannelContext';
import { ChatContextValue, useChatContext } from '../../contexts/chatContext/ChatContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import { ThreadContextValue, useThreadContext } from '../../contexts/threadContext/ThreadContext';

import type { DefaultErmisChatGenerics } from '../../types/types';
import {
  MessageInput as DefaultMessageInput,
  MessageInputProps,
} from '../MessageInput/MessageInput';
import type { MessageListProps } from '../MessageList/MessageList';

type ThreadPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChatContextValue<ErmisChatGenerics>, 'client'> &
  Pick<MessagesContextValue<ErmisChatGenerics>, 'MessageList'> &
  Pick<
    ThreadContextValue<ErmisChatGenerics>,
    'closeThread' | 'loadMoreThread' | 'reloadThread' | 'thread'
  > & {
    /**
     * Additional props for underlying MessageInput component.
     * */
    additionalMessageInputProps?: Partial<MessageInputProps<ErmisChatGenerics>>;
    /**
     * Additional props for underlying MessageList component.
     * */
    additionalMessageListProps?: Partial<MessageListProps<ErmisChatGenerics>>;
    /** Make input focus on mounting thread */
    autoFocus?: boolean;
    /** Closes thread on dismount, defaults to true */
    closeThreadOnDismount?: boolean;
    /** Disables the thread UI. So MessageInput and MessageList will be disabled. */
    disabled?: boolean;
    /**
     * **Customized MessageInput component to used within Thread instead of default MessageInput
     */
    MessageInput?: React.ComponentType<MessageInputProps<ErmisChatGenerics>>;
    /**
     * Call custom function on closing thread if handling thread state elsewhere
     */
    onThreadDismount?: () => void;
  };

const ThreadWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ThreadPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    additionalMessageInputProps,
    additionalMessageListProps,
    autoFocus = true,
    closeThread,
    closeThreadOnDismount = true,
    disabled,
    loadMoreThread,
    MessageInput = DefaultMessageInput,
    MessageList,
    onThreadDismount,
    thread,
  } = props;

  useEffect(() => {
    const loadMoreThreadAsync = async () => {
      await loadMoreThread();
    };

    if (thread?.id && thread.reply_count) {
      loadMoreThreadAsync();
    }
  }, []);

  useEffect(
    () => () => {
      if (closeThreadOnDismount) {
        closeThread();
      }
      if (onThreadDismount) {
        onThreadDismount();
      }
    },
    [],
  );

  if (!thread) return null;

  return (
    <React.Fragment key={`thread-${thread.id}`}>
      <MessageList
        FooterComponent={ThreadFooterComponent}
        threadList
        {...additionalMessageListProps}
      />
      <MessageInput<ErmisChatGenerics>
        additionalTextInputProps={{ autoFocus, editable: !disabled }}
        threadList
        {...additionalMessageInputProps}
      />
    </React.Fragment>
  );
};

export type ThreadProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<ThreadPropsWithContext<ErmisChatGenerics>>;

/**
 * Thread - The Thread renders a parent message with a list of replies. Use the standard message list of the main channel's messages.
 * The thread is only used for the list of replies to a message.
 *
 * Underlying MessageList, MessageInput and Message components can be customized using props:
 * - additionalMessageListProps
 * - additionalMessageInputProps
 */
export const Thread = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ThreadProps<ErmisChatGenerics>,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();
  const { threadList } = useChannelContext<ErmisChatGenerics>();
  const { MessageList } = useMessagesContext<ErmisChatGenerics>();
  const { closeThread, loadMoreThread, reloadThread, thread } =
    useThreadContext<ErmisChatGenerics>();

  if (thread?.id && !threadList) {
    throw new Error(
      'Please add a threadList prop to your Channel component when rendering a thread list.',
    );
  }

  return (
    <ThreadWithContext<ErmisChatGenerics>
      {...{
        client,
        closeThread,
        loadMoreThread,
        MessageList,
        reloadThread,
        thread,
      }}
      {...props}
    />
  );
};
