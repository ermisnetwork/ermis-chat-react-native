import React, { useEffect, useState } from 'react';

import type { Channel, ChannelState, Event, MessageResponse } from 'ermis-chat-sdk-test';

import { useLatestMessagePreview } from './hooks/useLatestMessagePreview';

import {
  ChannelsContextValue,
  useChannelsContext,
} from '../../contexts/channelsContext/ChannelsContext';
import { ChatContextValue, useChatContext } from '../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../types/types';

export type ChannelPreviewPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChatContextValue<ErmisChatGenerics>, 'client'> &
  Pick<ChannelsContextValue<ErmisChatGenerics>, 'Preview' | 'forceUpdate'> & {
    /**
     * Instance of Channel from stream-chat package.
     */
    channel: Channel<ErmisChatGenerics>;
  };

/**
 * This component manages state for the ChannelPreviewMessenger UI component and receives
 * all props from the ChannelListMessenger component.
 */
const ChannelPreviewWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelPreviewPropsWithContext<ErmisChatGenerics>,
) => {
  const { channel, client, forceUpdate: channelListForceUpdate, Preview } = props;

  const [lastMessage, setLastMessage] = useState<
    | ReturnType<ChannelState<ErmisChatGenerics>['formatMessage']>
    | MessageResponse<ErmisChatGenerics>
    | undefined
  >(channel.state.messages[channel.state.messages.length - 1]);

  const [forceUpdate, setForceUpdate] = useState(0);
  const [unread, setUnread] = useState(channel.countUnread());

  const latestMessagePreview = useLatestMessagePreview(channel, forceUpdate);

  const channelLastMessage = channel.lastMessage();
  const channelLastMessageString = `${channelLastMessage?.id}${channelLastMessage?.updated_at}`;

  useEffect(() => {
    const { unsubscribe } = client.on('notification.mark_read', () => {
      setUnread(channel.countUnread());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      channelLastMessage &&
      (channelLastMessage.id !== lastMessage?.id ||
        channelLastMessage.updated_at !== lastMessage?.updated_at)
    ) {
      setLastMessage(channelLastMessage);
    }

    const newUnreadCount = channel.countUnread();
    setUnread(newUnreadCount);
  }, [channelLastMessageString, channelListForceUpdate]);

  useEffect(() => {
    const handleNewMessageEvent = (event: Event<ErmisChatGenerics>) => {
      const message = event.message;
      if (message && (!message.parent_id || message.show_in_channel)) {
        setLastMessage(event.message);
        setUnread(channel.countUnread());
      }
    };

    const handleUpdatedOrDeletedMessage = (event: Event<ErmisChatGenerics>) => {
      setLastMessage((prevLastMessage) => {
        if (prevLastMessage?.id === event.message?.id) {
          return event.message;
        }
        return prevLastMessage;
      });
    };

    const listeners = [
      channel.on('message.new', handleNewMessageEvent),
      channel.on('message.updated', handleUpdatedOrDeletedMessage),
      channel.on('message.deleted', handleUpdatedOrDeletedMessage),
    ];

    return () => listeners.forEach((l) => l.unsubscribe());
  }, []);

  useEffect(() => {
    const handleReadEvent = (event: Event<ErmisChatGenerics>) => {
      if (event.user?.id === client.userID) {
        setUnread(0);
      } else if (event.user?.id) {
        setForceUpdate((prev) => prev + 1);
      }
    };

    const listener = channel.on('message.read', handleReadEvent);
    return () => listener.unsubscribe();
  }, []);

  return <Preview channel={channel} latestMessagePreview={latestMessagePreview} unread={unread} />;
};

export type ChannelPreviewProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<Omit<ChannelPreviewPropsWithContext<ErmisChatGenerics>, 'channel'>> &
  Pick<ChannelPreviewPropsWithContext<ErmisChatGenerics>, 'channel'>;

export const ChannelPreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelPreviewProps<ErmisChatGenerics>,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();
  const { forceUpdate, Preview } = useChannelsContext<ErmisChatGenerics>();

  return <ChannelPreviewWithContext {...{ client, forceUpdate, Preview }} {...props} />;
};
