import { useEffect, useState } from 'react';

import type { Event, Mute, ErmisChat } from 'ermis-chat-sdk';

import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useMutedUsers = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  client: ErmisChat<ErmisChatGenerics>,
) => {
  const [mutedUsers, setMutedUsers] = useState<Mute<ErmisChatGenerics>[]>(
    client?.mutedUsers || [],
  );

  useEffect(() => {
    const handleEvent = (_event: Event<ErmisChatGenerics>) => {
      setMutedUsers((mutes) => mutes || []);
    };

    const listener = client?.on('notification.mutes_updated', handleEvent);
    return () => listener?.unsubscribe();
  }, [setMutedUsers]);

  return mutedUsers;
};
