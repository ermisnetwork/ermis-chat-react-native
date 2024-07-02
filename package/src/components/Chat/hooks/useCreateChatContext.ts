import { useMemo } from 'react';

import type { ChatContextValue } from '../../../contexts/chatContext/ChatContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useCreateChatContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  appSettings,
  channel,
  client,
  connectionRecovering,
  enableOfflineSupport,
  ImageComponent,
  isOnline,
  mutedUsers,
  resizableCDNHosts,
  setActiveChannel,
}: ChatContextValue<ErmisChatGenerics>) => {
  const channelId = channel?.id;
  const clientValues = client
    ? `${client.clientID}${Object.keys(client.activeChannels).length}${Object.keys(client.listeners).length
    }${0}`//change 0 to client.mutedChannels.length
    : 'Offline';
  const mutedUsersLength = mutedUsers.length;

  const chatContext: ChatContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      appSettings,
      channel,
      client,
      connectionRecovering,
      enableOfflineSupport,
      ImageComponent,
      isOnline,
      mutedUsers,
      resizableCDNHosts,
      setActiveChannel,
    }),
    [channelId, clientValues, connectionRecovering, isOnline, mutedUsersLength],
  );

  return chatContext;
};
