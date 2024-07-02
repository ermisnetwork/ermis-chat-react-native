import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Image, Platform } from 'react-native';

import type { Channel, ErmisChat } from 'ermis-chat-sdk';

import { useAppSettings } from './hooks/useAppSettings';
import { useCreateChatContext } from './hooks/useCreateChatContext';
import { useIsOnline } from './hooks/useIsOnline';
import { useMutedUsers } from './hooks/useMutedUsers';

import { useSyncDatabase } from './hooks/useSyncDatabase';

import { ChannelsStateProvider } from '../../contexts/channelsStateContext/ChannelsStateContext';
import { ChatContextValue, ChatProvider } from '../../contexts/chatContext/ChatContext';
import { useDebugContext } from '../../contexts/debugContext/DebugContext';
import { useOverlayContext } from '../../contexts/overlayContext/OverlayContext';
import { DeepPartial, ThemeProvider } from '../../contexts/themeContext/ThemeContext';
import type { Theme } from '../../contexts/themeContext/utils/theme';
import {
  DEFAULT_USER_LANGUAGE,
  TranslationProvider,
} from '../../contexts/translationContext/TranslationContext';
import { useErmisi18n } from '../../hooks/useErmisi18n';
import init from '../../init';

import { SDK } from '../../native';
import { QuickSqliteClient } from '../../store/QuickSqliteClient';
import type { DefaultErmisChatGenerics } from '../../types/types';
import { DBSyncManager } from '../../utils/DBSyncManager';
import type { Ermisi18n } from '../../utils/i18n/Ermisi18n';
import { ErmisChatRN } from '../../utils/ErmisChatRN';
import { version } from '../../version.json';

init();

export type ChatProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChatContextValue<ErmisChatGenerics>, 'client'> &
  Partial<Pick<ChatContextValue<ErmisChatGenerics>, 'ImageComponent' | 'resizableCDNHosts'>> & {
    /**
     * When false, ws connection won't be disconnection upon backgrounding the app.
     * To receive push notifications, its necessary that user doesn't have active
     * websocket connection. So by default, we disconnect websocket connection when
     * app goes to background, and reconnect when app comes to foreground.
     */
    closeConnectionOnBackground?: boolean;
    /**
     * Enables offline storage and loading for chat data.
     */
    enableOfflineSupport?: boolean;
    /**
     * Instance of Ermisi18n class should be provided to Chat component to enable internationalization.
     *
     * Ermis provides following list of in-built translations:
     * 1. English (en)
     * 2. Dutch (nl)
     * 3. ...
     * 4. ...
     *
     * Simplest way to start using chat components in one of the in-built languages would be following:
     *
     * ```
     * const i18n = new Ermisi18n('nl');
     * <Chat client={chatClient} i18nInstance={i18n}>
     *  ...
     * </Chat>
     * ```
     *
     * If you would like to override certain keys in in-built translation.
     * UI will be automatically updated in this case.
     *
     * ```
     * const i18n = new Ermisi18n('nl');
     *
     * i18n.registerTranslation('nl', {
     *  'Nothing yet...': 'Nog Niet ...',
     *  '{{ firstUser }} and {{ secondUser }} are typing...': '{{ firstUser }} en {{ secondUser }} zijn aan het typen...',
     * });
     *
     * <Chat client={chatClient} i18nInstance={i18n}>
     *  ...
     * </Chat>
     * ```
     *
     * You can use the same function to add whole new language.
     *
     * ```
     * const i18n = new Ermisi18n('it');
     *
     * i18n.registerTranslation('it', {
     *  'Nothing yet...': 'Non ancora ...',
     *  '{{ firstUser }} and {{ secondUser }} are typing...': '{{ firstUser }} a {{ secondUser }} stanno scrivendo...',
     * });
     *
     * // Make sure to call setLanguage to reflect new language in UI.
     * i18n.setLanguage('it');
     * <Chat client={chatClient} i18nInstance={i18n}>
     *  ...
     * </Chat>
     * ```
     */
    i18nInstance?: Ermisi18n;
    /**
     * You can pass the theme object to customize the styles of Chat components. You can check the default theme in [theme.ts]
     *
     * Please check section about [themes in cookbook]
     *
     * ```
     * import type { DeepPartial, Theme } from 'ermis-chat-react-native';
     *
     * const theme: DeepPartial<Theme> = {
     *   messageSimple: {
     *     file: {
     *       container: {
     *         backgroundColor: 'red',
     *       },
     *       icon: {
     *         height: 16,
     *         width: 16,
     *       },
     *     },
     *   },
     * };
     *
     * <Chat style={theme}>
     * </Chat>
     * ```
     *
     * @overrideType object
     */
    style?: DeepPartial<Theme>;
  };

const ChatWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: PropsWithChildren<ChatProps<ErmisChatGenerics>>,
) => {
  const {
    children,
    client,
    closeConnectionOnBackground = true,
    enableOfflineSupport = false,
    i18nInstance,
    ImageComponent = Image,
    resizableCDNHosts = [''],
    style,
  } = props;

  const [channel, setChannel] = useState<Channel<ErmisChatGenerics>>();

  // Setup translators
  const translators = useErmisi18n(i18nInstance);

  /**
   * Setup connection event listeners
   */
  const { connectionRecovering, isOnline } = useIsOnline<ErmisChatGenerics>(
    client,
    closeConnectionOnBackground,
  );

  const [initialisedDatabaseConfig, setInitialisedDatabaseConfig] = useState<{
    initialised: boolean;
    userID?: string;
  }>({
    initialised: false,
  });

  /**
   * Setup muted user listener
   * TODO: reimplement
   */
  const mutedUsers = useMutedUsers<ErmisChatGenerics>(client);

  const debugRef = useDebugContext();
  const isDebugModeEnabled = __DEV__ && debugRef && debugRef.current;

  const userID = client.userID;

  // Set the `resizableCDNHosts` as per the prop.
  ErmisChatRN.setConfig({ resizableCDNHosts });

  useEffect(() => {
    if (client) {
      client.setUserAgent(`${SDK}-${Platform.OS}-${version}`);
      // This is to disable recovery related logic in js client, since we handle it in this SDK
      client.recoverStateOnReconnect = false;
      client.persistUserOnConnectionFailure = enableOfflineSupport;
    }

    if (isDebugModeEnabled) {
      if (debugRef.current.setEventType) debugRef.current.setEventType('send');
      if (debugRef.current.setSendEventParams)
        debugRef.current.setSendEventParams({
          action: 'Client',
          data: client.user,
        });
    }
  }, [client, enableOfflineSupport]);

  const setActiveChannel = (newChannel?: Channel<ErmisChatGenerics>) => setChannel(newChannel);

  useEffect(() => {
    if (userID && enableOfflineSupport) {
      setInitialisedDatabaseConfig({ initialised: false, userID });
      QuickSqliteClient.initializeDatabase();
      DBSyncManager.init(client as unknown as ErmisChat);
      setInitialisedDatabaseConfig({ initialised: true, userID });
    }
  }, [userID, enableOfflineSupport]);

  const initialisedDatabase =
    initialisedDatabaseConfig.initialised && userID === initialisedDatabaseConfig.userID;

  const appSettings = useAppSettings(client, isOnline, enableOfflineSupport, initialisedDatabase);

  const chatContext = useCreateChatContext({
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
  });

  useSyncDatabase({
    client,
    enableOfflineSupport,
    initialisedDatabase,
  });

  if (userID && enableOfflineSupport && !initialisedDatabase) {
    // if user id has been set and offline support is enabled, we need to wait for database to be initialised
    return null;
  }

  return (
    <ChatProvider<ErmisChatGenerics> value={chatContext}>
      <TranslationProvider
        value={{ ...translators, userLanguage: client.user?.language || DEFAULT_USER_LANGUAGE }}
      >
        <ThemeProvider style={style}>
          <ChannelsStateProvider<ErmisChatGenerics>>{children}</ChannelsStateProvider>
        </ThemeProvider>
      </TranslationProvider>
    </ChatProvider>
  );
};

/**
 * Chat - Wrapper component for Chat. The needs to be placed around any other chat components.
 * This Chat component provides the ChatContext to all other components.
 *
 * The ChatContext provides the following props:
 *
 * - channel - currently active channel
 * - client - client connection
 * - connectionRecovering - whether or not websocket is reconnecting
 * - isOnline - whether or not set user is active
 * - setActiveChannel - function to set the currently active channel
 *
 * The Chat Component takes the following generics in order:
 * - At (AttachmentType) - custom Attachment object extension
 * - Ct (ChannelType) - custom Channel object extension
 * - Co (CommandType) - custom Command string union extension
 * - Ev (EventType) - custom Event object extension
 * - Me (MessageType) - custom Message object extension
 * - Re (ReactionType) - custom Reaction object extension
 * - Us (UserType) - custom User object extension
 */
export const Chat = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: PropsWithChildren<ChatProps<ErmisChatGenerics>>,
) => {
  const { style } = useOverlayContext();

  return <ChatWithContext {...{ style }} {...props} />;
};
