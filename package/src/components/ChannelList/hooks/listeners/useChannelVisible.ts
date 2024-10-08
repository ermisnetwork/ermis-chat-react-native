import { useEffect } from 'react';

import uniqBy from 'lodash/uniqBy';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';
import { getChannel } from '../../utils';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onChannelVisible?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
  };

export const useChannelVisible = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onChannelVisible,
  setChannels,
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = async (event: Event<ErmisChatGenerics>) => {
      if (typeof onChannelVisible === 'function') {
        onChannelVisible(setChannels, event);
      } else {
        console.log("useChannelVisible -> event", event);

        if (event.channel_id && event.channel_type) {
          const channel = await getChannel<ErmisChatGenerics>({
            client,
            id: event.channel_id,
            type: event.channel_type,
          });
          setChannels((channels) => (channels ? uniqBy([channel, ...channels], 'cid') : channels));
        }
      }
    };

    const listener = client?.on('channel.visible', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
