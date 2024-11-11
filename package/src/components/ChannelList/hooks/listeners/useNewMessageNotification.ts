import { useEffect } from 'react';

import uniqBy from 'lodash/uniqBy';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';
import { getChannel } from '../../utils';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onMessageNew?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
    onNewMessageNotification?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
  };

export const useNewMessageNotification = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onMessageNew,
  onNewMessageNotification,
  setChannels,
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = async (event: Event<ErmisChatGenerics>) => {
      if (typeof onMessageNew === 'function') {
        onMessageNew(setChannels, event);
        console.warn(
          'onMessageNew is deprecated and will be removed in future release. Please use onNewMessageNotification to establish the same behaviour',
        );
      } else if (typeof onNewMessageNotification === 'function') {
        onNewMessageNotification(setChannels, event);
      } else {
        if (event.channel?.id && event.channel?.type) {
          const channel = await getChannel({
            client,
            id: event.channel.id,
            type: event.channel.type,
          });
          setChannels((channels) => (channels ? uniqBy([channel, ...channels], 'cid') : channels));
        }
      }
    };

    const listener = client?.on('notification.message_new', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
