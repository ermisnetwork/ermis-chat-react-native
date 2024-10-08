import { useEffect } from 'react';

import type { Channel, Event } from 'ermis-chat-sdk';

import { useChatContext } from '../../../../contexts/chatContext/ChatContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';
import { moveChannelUp } from '../../utils';

type Parameters<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  {
    lockChannelOrder: boolean;
    setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>;
    onNewMessage?: (
      lockChannelOrder: boolean,
      setChannels: React.Dispatch<React.SetStateAction<Channel<ErmisChatGenerics>[] | null>>,
      event: Event<ErmisChatGenerics>,
    ) => void;
    channelListType?: 'messenger' | 'invite';
  };

export const useNewMessage = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  lockChannelOrder,
  onNewMessage,
  setChannels,
  channelListType
}: Parameters<ErmisChatGenerics>) => {
  const { client } = useChatContext<ErmisChatGenerics>();

  useEffect(() => {
    const handleEvent = (event: Event<ErmisChatGenerics>) => {
      if (typeof onNewMessage === 'function') {
        onNewMessage(lockChannelOrder, setChannels, event);
      } else {
        // If channel is not in messenger list, don't add it.
        if (channelListType === 'invite') {
          return;
        }
        setChannels((channels) => {
          if (!channels) return channels;
          const channelInList = channels.filter((channel) => channel.cid === event.cid).length > 0;

          if (!channelInList && event.channel_type && event.channel_id) {
            // If channel doesn't exist in existing list, check in activeChannels as well.
            // It may happen that channel was hidden using channel.hide(). In that case
            // We remove it from `channels` state, but its still being watched and exists in client.activeChannels.
            const channel = client.channel(event.channel_type, event.channel_id);
            //TODO: Somehow, membership is not available in channel state. We need to check why.
            if ((channel.state.membership.channel_role === "pending" || client.userID && channel.state.members[client.userID]?.channel_role === 'pending') && channelListType === 'messenger') return [...channels];

            //TODO: add hide channel api to sdk
            return [channel, ...channels];
          }

          if (!lockChannelOrder && event.cid)
            return moveChannelUp<ErmisChatGenerics>({
              channels,
              cid: event.cid,
            });

          return [...channels];
        });
      }
    };

    const listener = client?.on('message.new', handleEvent);
    return () => listener?.unsubscribe();
  }, []);
};
