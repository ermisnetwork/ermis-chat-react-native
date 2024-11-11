import { useEffect } from 'react';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onRemovedFromChannel?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
  };

export const useRemovedFromChannelNotification = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onRemovedFromChannel,
  setChannels,
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = (event: Event<ErmisChatGenerics>) => {
      if (typeof onRemovedFromChannel === 'function') {
        onRemovedFromChannel(setChannels, event);
      } else {
        setChannels((channels) => {
          if (!channels) return channels;

          const newChannels = channels.filter((channel) => channel.cid !== event.channel?.cid);
          return [...newChannels];
        });
      }
    };

    const listener = client?.on('notification.removed_from_channel', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
