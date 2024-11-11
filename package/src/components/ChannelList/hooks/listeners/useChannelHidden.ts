import { useEffect } from 'react';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onChannelHidden?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
  };

export const useChannelHidden = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onChannelHidden,
  setChannels,
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = (event: Event<ErmisChatGenerics>) => {
      if (typeof onChannelHidden === 'function') {
        onChannelHidden(setChannels, event);
      } else {
        setChannels((channels) => {
          if (!channels) return channels;

          const index = channels.findIndex(
            (channel) => channel.cid === (event.cid || event.channel?.cid),
          );
          if (index >= 0) {
            channels.splice(index, 1);
          }
          return [...channels];
        });
      }
    };

    const listener = client?.on('channel.hidden', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
