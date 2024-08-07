import { useEffect, useState } from 'react';

import type { AppSettingsAPIResponse, ErmisChat } from 'ermis-chat-sdk';

// import { useIsMountedRef } from '../../../hooks/useIsMountedRef';
import * as dbApi from '../../../store/apis';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useAppSettings = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  client: ErmisChat<ErmisChatGenerics>,
  isOnline: boolean | null,
  enableOfflineSupport: boolean,
  initialisedDatabase: boolean,
): AppSettingsAPIResponse | null => {
  const [appSettings, setAppSettings] = useState<AppSettingsAPIResponse | null>(null);
  // const isMounted = useIsMountedRef();

  useEffect(() => {
    async function enforeAppSettings() {
      if (!client.userID) return;

      if (enableOfflineSupport && !initialisedDatabase) return;

      if (!isOnline && enableOfflineSupport) {
        const appSettings = dbApi.getAppSettings({ currentUserId: client.userID });
        setAppSettings(appSettings);
        return;
      }
      console.log('Fetching app settings');
      // try {
      //   const appSettings = await client.getAppSettings();
      //   if (isMounted.current) {
      //     setAppSettings(appSettings);
      //     enableOfflineSupport &&
      //       dbApi.upsertAppSettings({
      //         appSettings,
      //         currentUserId: client.userID as string,
      //       });
      //   }
      // } catch (error: unknown) {
      //   if (error instanceof Error) {
      //     console.error(`An error occurred while getting app settings from node module core: ${error}`);
      //   }
      // }
    }

    enforeAppSettings();
  }, [client, isOnline, initialisedDatabase]);

  return appSettings;
};
