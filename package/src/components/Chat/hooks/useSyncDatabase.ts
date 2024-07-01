import { useEffect } from 'react';

import type { ErmisChat } from 'ermis-chat-sdk-test';

import { handleEventToSyncDB } from './handleEventToSyncDB';

import type { DefaultErmisChatGenerics } from '../../../types/types';

type Params<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> = {
  client: ErmisChat<ErmisChatGenerics>;
  enableOfflineSupport: boolean;
  initialisedDatabase: boolean;
};
export const useSyncDatabase = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  client,
  enableOfflineSupport,
  initialisedDatabase,
}: Params<ErmisChatGenerics>) => {
  useEffect(() => {
    let listener: ReturnType<ErmisChat['on']> | undefined;

    if (enableOfflineSupport && initialisedDatabase) {
      listener = client?.on((event) => handleEventToSyncDB(event, client));
    }

    return () => {
      listener?.unsubscribe();
    };
  }, [client, initialisedDatabase]);
};
