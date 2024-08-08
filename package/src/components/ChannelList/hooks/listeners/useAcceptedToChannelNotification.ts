import { useEffect } from 'react';

// import uniqBy from 'lodash/uniqBy';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';
// import { getChannel } from '../../utils';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onAcceptedToChannel?: (
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
    channelListType?: 'messenger' | 'invite';
  };

export const useAcceptedToChannelNotification = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  onAcceptedToChannel,
  setChannels,
  channelListType
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = async (event: Event<ErmisChatGenerics>) => {
      if (typeof onAcceptedToChannel === 'function') {
        onAcceptedToChannel(setChannels, event);
      } else {
        console.log('event on invite case', channelListType, event.channel?.cid);
        setChannels((channels) => {
          if (!channels) return channels;
          const newChannels = channels.filter((channel) => channel.cid !== event.channel?.cid);
          return [...newChannels];
        });
        // if (channelListType === 'invite') {
        // } else {
        //   console.log('event on messenger case: ', channelListType, event.channel?.cid);
        //   // if (event.channel?.id && event.channel?.type) {
        //   //   const channel = await getChannel<ErmisChatGenerics>({
        //   //     client,
        //   //     id: event.channel.id,
        //   //     type: event.channel.type,
        //   //   });
        //   //   setChannels((channels) => (channels ? uniqBy([channel, ...channels], 'cid') : channels));
        //   // }
        // }
      }
    };

    const listener = client?.on('notification.invite_accepted', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
