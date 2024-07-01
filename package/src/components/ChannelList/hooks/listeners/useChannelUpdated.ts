import { useEffect } from 'react';

import type { Channel, Event } from 'ermis-chat-sdk-test';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onChannelUpdated?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
  };

export const useChannelUpdated = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onChannelUpdated,
  setChannels,
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = (event: Event<ErmisChatGenerics>) => {
      if (typeof onChannelUpdated === 'function') {
        onChannelUpdated(setChannels, event);
      } else {
        setChannels((channels) => {
          if (!channels) return channels;

          const index = channels.findIndex(
            (channel) => channel.cid === (event.cid || event.channel?.cid),
          );
          if (index >= 0 && event.channel) {
            channels[index].data = {
              ...event.channel,
              hidden: event.channel?.hidden ?? channels[index].data?.hidden,
              own_capabilities:
                event.channel?.own_capabilities ?? channels[index].data?.own_capabilities,
            };
          }

          return [...channels];
        });
      }
    };

    const listener = client?.on('channel.updated', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
