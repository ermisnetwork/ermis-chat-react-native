import { useEffect, useState } from 'react';

import { TFunction } from 'i18next';
import type { Channel, ChannelState, MessageResponse, ErmisChat, UserResponse } from 'ermis-chat-sdk';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';

import { useTranslatedMessage } from '../../../hooks/useTranslatedMessage';
import type { DefaultErmisChatGenerics } from '../../../types/types';

type LatestMessage<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> =
  | ReturnType<ChannelState<ErmisChatGenerics>['formatMessage']>
  | MessageResponse<ErmisChatGenerics>;

export type LatestMessagePreview<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  messageObject: LatestMessage<ErmisChatGenerics> | undefined;
  previews: {
    bold: boolean;
    text: string;
  }[];
  status: number;
  created_at?: string | Date;
};

const getMessageSenderName = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  message: LatestMessage<ErmisChatGenerics> | undefined,
  currentUserId: string | undefined,
  t: (key: string) => string,
  membersLength: number,
) => {
  if (message?.user?.id === currentUserId) {
    return t('You');
  }

  if (membersLength > 2) {
    return message?.user?.name || message?.user?.username || message?.user?.id || '';
  }

  return '';
};

const getMentionUsers = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  mentionedUser: UserResponse<ErmisChatGenerics>[] | undefined,
) => {
  if (Array.isArray(mentionedUser)) {
    const mentionUserString = mentionedUser.reduce((acc, cur) => {
      const userName = cur.name || cur.id || '';
      if (userName) {
        acc += `${acc.length ? '|' : ''}@${userName}`;
      }
      return acc;
    }, '');

    // escape special characters
    return mentionUserString.replace(/[.*+?^${}()|[\]\\]/g, function (match) {
      return '\\' + match;
    });
  }

  return '';
};

const getLatestMessageDisplayText = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
  client: ErmisChat<ErmisChatGenerics>,
  message: LatestMessage<ErmisChatGenerics> | undefined,
  t: (key: string) => string,
) => {
  if (!message) return [{ bold: false, text: t('Nothing yet...') }];
  const isMessageTypeDeleted = message.type === 'deleted';
  if (isMessageTypeDeleted) return [{ bold: false, text: t('Message deleted') }];
  const currentUserId = client?.userID;
  const members = Object.keys(channel.state.members);

  const messageSender = getMessageSenderName(message, currentUserId, t, members.length);
  const messageSenderText = messageSender
    ? `${messageSender === t('You') ? '' : '@'}${messageSender}: `
    : '';
  const boldOwner = messageSenderText.includes('@');
  if (message.text) {
    // rough guess optimization to limit string preview to max 100 characters
    const shortenedText = message.text.substring(0, 100).replace(/\n/g, ' ');
    const mentionedUsers = getMentionUsers(message.mentioned_users);
    const regEx = new RegExp(`^(${mentionedUsers})`);
    return [
      { bold: boldOwner, text: messageSenderText },
      ...shortenedText.split('').reduce(
        (acc, cur, index) => {
          if (cur === '@' && mentionedUsers && regEx.test(shortenedText.substring(index))) {
            acc.push({ bold: true, text: cur });
          } else if (mentionedUsers && regEx.test(acc[acc.length - 1].text)) {
            acc.push({ bold: false, text: cur });
          } else {
            acc[acc.length - 1].text += cur;
          }
          return acc;
        },
        [{ bold: false, text: '' }],
      ),
    ];
  }
  if (message.command) {
    return [
      { bold: boldOwner, text: messageSenderText },
      { bold: false, text: `/${message.command}` },
    ];
  }
  if (message.attachments?.length) {
    return [
      { bold: boldOwner, text: messageSenderText },
      { bold: false, text: t('🏙 Attachment...') },
    ];
  }
  return [
    { bold: boldOwner, text: messageSenderText },
    { bold: false, text: t('Empty message...') },
  ];
};

export enum MessageReadStatus {
  NOT_SENT_BY_CURRENT_USER = 0,
  UNREAD = 1,
  READ = 2,
}

const getLatestMessageReadStatus = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
  client: ErmisChat<ErmisChatGenerics>,
  message: LatestMessage<ErmisChatGenerics> | undefined,
  readEvents: boolean,
): MessageReadStatus => {
  const currentUserId = client.userID;
  if (!message || currentUserId !== message.user?.id || readEvents === false) {
    return MessageReadStatus.NOT_SENT_BY_CURRENT_USER;
  }

  const readList = { ...channel.state.read };
  if (currentUserId) {
    delete readList[currentUserId];
  }

  const messageUpdatedAt = message.updated_at
    ? typeof message.updated_at === 'string'
      ? new Date(message.updated_at)
      : message.updated_at
    : undefined;

  return Object.values(readList).some(
    ({ last_read }) => messageUpdatedAt && messageUpdatedAt < last_read,
  )
    ? MessageReadStatus.READ
    : MessageReadStatus.UNREAD;
};

const getLatestMessagePreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(params: {
  channel: Channel<ErmisChatGenerics>;
  client: ErmisChat<ErmisChatGenerics>;
  readEvents: boolean;
  t: TFunction;
  lastMessage?:
  | ReturnType<ChannelState<ErmisChatGenerics>['formatMessage']>
  | MessageResponse<ErmisChatGenerics>;
}) => {
  const { channel, client, lastMessage, readEvents, t } = params;

  const messages = channel.state.messages;

  if (!messages.length && !lastMessage) {
    return {
      created_at: '',
      messageObject: undefined,
      previews: [
        {
          bold: false,
          text: t('Nothing yet...'),
        },
      ],
      status: MessageReadStatus.NOT_SENT_BY_CURRENT_USER,
    };
  }

  const channelStateLastMessage = messages.length ? messages[messages.length - 1] : undefined;

  const message = lastMessage !== undefined ? lastMessage : channelStateLastMessage;

  return {
    created_at: message?.created_at,
    messageObject: message,
    previews: getLatestMessageDisplayText(channel, client, message, t),
    status: getLatestMessageReadStatus(channel, client, message, readEvents),
  };
};

/**
 * Hook to set the display preview for latest message on channel.
 *
 * @param {*} channel Channel object
 *
 * @returns {object} latest message preview e.g.. { text: 'this was last message ...', created_at: '11/12/2020', messageObject: { originalMessageObject } }
 */
export const useLatestMessagePreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel: Channel<ErmisChatGenerics>,
  forceUpdate: number,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();
  const { t } = useTranslationContext();

  const channelConfigExists = typeof channel?.getConfig === 'function';

  const messages = channel.state.messages;
  const message = messages.length ? messages[messages.length - 1] : undefined;

  const translatedLastMessage = useTranslatedMessage<ErmisChatGenerics>(message);

  const channelLastMessageString = `${message?.id}${message?.updated_at}`;

  const [readEvents, setReadEvents] = useState(true);
  const [latestMessagePreview, setLatestMessagePreview] = useState<
    LatestMessagePreview<ErmisChatGenerics>
  >({
    created_at: '',
    messageObject: undefined,
    previews: [
      {
        bold: false,
        text: '',
      },
    ],
    status: MessageReadStatus.NOT_SENT_BY_CURRENT_USER,
  });

  const readStatus = getLatestMessageReadStatus(channel, client, translatedLastMessage, readEvents);

  useEffect(() => {
    if (channelConfigExists) {
      const read_events = channel.getConfig()?.read_events;
      if (typeof read_events === 'boolean') {
        setReadEvents(read_events);
      }
    }
  }, [channelConfigExists]);

  useEffect(
    () =>
      setLatestMessagePreview(
        getLatestMessagePreview({
          channel,
          client,
          lastMessage: translatedLastMessage,
          readEvents,
          t,
        }),
      ),
    [channelLastMessageString, forceUpdate, readEvents, readStatus],
  );

  return latestMessagePreview;
};
