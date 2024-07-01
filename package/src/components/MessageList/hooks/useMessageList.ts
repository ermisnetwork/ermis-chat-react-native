import type { ChannelState, MessageResponse } from 'ermis-chat-sdk-test';

import {
  ChannelContextValue,
  useChannelContext,
} from '../../../contexts/channelContext/ChannelContext';
import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import {
  DeletedMessagesVisibilityType,
  useMessagesContext,
} from '../../../contexts/messagesContext/MessagesContext';
import { usePaginatedMessageListContext } from '../../../contexts/paginatedMessageListContext/PaginatedMessageListContext';
import { useThreadContext } from '../../../contexts/threadContext/ThreadContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { getDateSeparators } from '../utils/getDateSeparators';
import { getGroupStyles } from '../utils/getGroupStyles';
import { getReadStates } from '../utils/getReadStates';

export type UseMessageListParams = {
  deletedMessagesVisibilityType?: DeletedMessagesVisibilityType;
  noGroupByUser?: boolean;
  threadList?: boolean;
};

export type GroupType = string;

export type MessagesWithStylesReadByAndDateSeparator<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = MessageResponse<ErmisChatGenerics> & {
  groupStyles: GroupType[];
  readBy: boolean | number;
  dateSeparator?: Date;
};

export type MessageType<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> =
  | ReturnType<ChannelState<ErmisChatGenerics>['formatMessage']>
  | MessagesWithStylesReadByAndDateSeparator<ErmisChatGenerics>;

// Type guards to check MessageType
export const isMessageWithStylesReadByAndDateSeparator = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  message: MessageType<ErmisChatGenerics>,
): message is MessagesWithStylesReadByAndDateSeparator<ErmisChatGenerics> =>
  (message as MessagesWithStylesReadByAndDateSeparator<ErmisChatGenerics>).readBy !== undefined;

export const useMessageList = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  params: UseMessageListParams,
) => {
  const { noGroupByUser, threadList } = params;
  const { client } = useChatContext<ErmisChatGenerics>();
  const { hideDateSeparators, maxTimeBetweenGroupedMessages, read } =
    useChannelContext<ErmisChatGenerics>();
  const { deletedMessagesVisibilityType, getMessagesGroupStyles = getGroupStyles } =
    useMessagesContext<ErmisChatGenerics>();
  const { messages } = usePaginatedMessageListContext<ErmisChatGenerics>();
  const { threadMessages } = useThreadContext<ErmisChatGenerics>();

  const messageList = threadList ? threadMessages : messages;
  const readList: ChannelContextValue<ErmisChatGenerics>['read'] | undefined = threadList
    ? undefined
    : read;

  const dateSeparators = getDateSeparators<ErmisChatGenerics>({
    deletedMessagesVisibilityType,
    hideDateSeparators,
    messages: messageList,
    userId: client.userID,
  });

  const messageGroupStyles = getMessagesGroupStyles<ErmisChatGenerics>({
    dateSeparators,
    hideDateSeparators,
    maxTimeBetweenGroupedMessages,
    messages: messageList,
    noGroupByUser,
    userId: client.userID,
  });

  const readData = getReadStates(client.userID, messageList, readList);

  const messagesWithStylesReadByAndDateSeparator = messageList
    .filter((msg) => {
      const isMessageTypeDeleted = msg.type === 'deleted';
      if (deletedMessagesVisibilityType === 'sender') {
        return !isMessageTypeDeleted || msg.user?.id === client.userID;
      } else if (deletedMessagesVisibilityType === 'receiver') {
        return !isMessageTypeDeleted || msg.user?.id !== client.userID;
      } else if (deletedMessagesVisibilityType === 'never') {
        return !isMessageTypeDeleted;
      } else {
        return msg;
      }
    })
    .map((msg) => ({
      ...msg,
      dateSeparator: dateSeparators[msg.id] || undefined,
      groupStyles: messageGroupStyles[msg.id] || ['single'],
      readBy: msg.id ? readData[msg.id] || false : false,
    }));

  const processedMessageList = [
    ...messagesWithStylesReadByAndDateSeparator,
  ].reverse() as MessageType<ErmisChatGenerics>[];

  return {
    /** Messages enriched with dates/readby/groups and also reversed in order */
    processedMessageList,
    /** Raw messages from the channel state */
    rawMessageList: messageList,
  };
};
