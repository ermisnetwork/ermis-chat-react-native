import { useEffect, useRef, useState } from 'react';
import { ErmisChat, ErmisAuth } from 'ermis-chat-sdk';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { QuickSqliteClient } from 'ermis-chat-react-native';
import AsyncStore from '../utils/AsyncStore';
import Config from 'react-native-config';
import type { LoginConfig, ErmisChatGenerics } from '../types';
import { Alert } from 'react-native';
// Request Push Notification permission from device.
const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const isEnabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  console.log('Permission Status', { authStatus, isEnabled });
};

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const logMessage = `Received background message: ${JSON.stringify(remoteMessage)}`;
  console.log('message from background: ', logMessage);

  const messageId = remoteMessage.data?.id as string;
  if (!messageId) {
    return;
  }
  const config = await AsyncStore.getItem<LoginConfig | null>(
    '@ermisChat-login-config',
    null,
  );
  if (!config) {
    return;
  }

  let api_key = Config.REACT_APP_API_KEY || "VskVZNX0ouKF1751699014812";

  let project_id = "b44937e4-c0d4-4a73-847c-3730a923ce83"

  const client = ErmisChat.getInstance(api_key, project_id);

  const user = {
    id: config.userId,
    name: config.userName,
  };

  await client._setToken(user, config.userToken);
  const message = await client.getMessage(messageId);

  // create the android channel to send the notification to
  const channelId = await notifee.createChannel({
    id: 'chat-messages',
    name: 'Chat Messages',
  });

  if (message.message.user?.name && message.message.text) {
    const { stream, ...rest } = remoteMessage.data ?? {};
    const data = {
      ...rest,
      ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
    };
    await notifee.displayNotification({
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
      body: message.message.text,
      data,
      title: 'New message from ' + message.message.user.name,
    });
  }
});

export const useChatClient = () => {
  const [chatClient, setChatClient] = useState<ErmisChat<ErmisChatGenerics> | null>(null);
  const [walletConnect, setWalletConnect] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>();
  const unsubscribePushListenersRef = useRef<() => void>();
  // const { disconnect } = useDisconnect();
  /**
   * @param config the user login config
   * @returns function to unsubscribe from listeners
   */
  const loginUser = async (config: LoginConfig) => {
    let api_key = Config.REACT_APP_API_KEY || "VskVZNX0ouKF1751699014812";
    let project_id = "b44937e4-c0d4-4a73-847c-3730a923ce83";
    // unsubscribe from previous push listeners
    unsubscribePushListenersRef.current?.();
    const client = ErmisChat.getInstance<ErmisChatGenerics>(api_key, project_id, {
      timeout: 6000,
      logger: (type, msg) => console.log(type, msg),
      baseURL: Config.REACT_APP_API_URL || 'https://api.ermis.network',
    });
    console.log('api url: ', Config.REACT_APP_API_URL, "   api key: ", Config.REACT_APP_API_KEY)
    setChatClient(client);
    const user = {
      id: config.userId,
      api_key: api_key,
    };
    const connectedUser = await client.connectUser(user, config.userToken).then((res) => res).catch((e) => {
      Alert.alert("Error", "Please check your internet connection and try again");
      return null;
    });

    // connect to SSE, which will keep the connection alive and listen to new messages from user servers.
    await client.connectToSSE();

    const initialUnreadCount = connectedUser?.me?.total_unread_count;
    setUnreadCount(initialUnreadCount);
    await AsyncStore.setItem('@ermisChat-login-config', config);

    // get profile user
    let profile = await client.queryUser(config.userId);

    client._setUser(profile);
    client.state.updateUser(profile);

    // let chains = await client.getChains();
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~chains: ', chains);

    const permissionAuthStatus = await messaging().hasPermission();
    const isEnabled =
      permissionAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      permissionAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (isEnabled) {
      // Register FCM token with ermis chat server.
      let token = await AsyncStore.getItem<string | null>('@fcm-token', null);
      if (!token) {
        try {
          const token = await messaging().getToken();
          await client.addDevice(token, 'firebase');
          console.log('FCM token when enabled: ', token);
          await AsyncStore.setItem('@fcm-token', token);
        } catch (e) {
          console.error("error: ", e);
        }
      }


      // Listen to new FCM tokens and register them with ermis chat server.
      // const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      //   await client.addDevice(newToken, 'firebase');
      // });
      // show notifications when on foreground
      const unsubscribeForegroundMessageReceive = messaging().onMessage(async (remoteMessage) => {
        console.log('Message handled in the foreground!', remoteMessage);
        const messageId = remoteMessage.data?.id;
        if (!messageId) {
          return;
        }
        const message = await client.getMessage(messageId);

        if (message.message.user?.name && message.message.text) {
          // create the android channel to send the notification to
          const channelId = await notifee.createChannel({
            id: 'foreground',
            name: 'Foreground Messages',
          });
          // display the notification on foreground
          const { stream, ...rest } = remoteMessage.data ?? {};
          const data = {
            ...rest,
            ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
          };
          await notifee.displayNotification({
            android: {
              channelId,
              pressAction: {
                id: 'default',
              }
            },
            body: message.message.text,
            data,
            title: 'New message from ' + message.message.user.name,
          });
        }
      });

      unsubscribePushListenersRef.current = () => {
        // unsubscribeTokenRefresh();
        unsubscribeForegroundMessageReceive();
      };
    }
    setChatClient(client);
  };

  const switchUser = async (config?: LoginConfig) => {
    setIsConnecting(true);
    try {
      if (config) {
        await loginUser(config);
      } else {
        const config = await AsyncStore.getItem<LoginConfig | null>(
          '@ermisChat-login-config',
          null,
        );

        if (config) {
          await loginUser(config);
        }
      }
    } catch (e) {
      console.warn("error : ", e);
    }

    setIsConnecting(false);
  };

  const logout = async () => {
    try {
      let token = await AsyncStore.getItem<string | null>('@fcm-token', null);
      if (!token) {
        token = await messaging().getToken();
      }
      await chatClient?.removeDevice(token);
    } catch (e) {
      console.error("error: ", e);
    };
    QuickSqliteClient.resetDB();
    setChatClient(null);
    chatClient?.disconnectUser();
    chatClient?.disconnectFromSSE();
    await AsyncStore.removeItem('@fcm-token');
    await AsyncStore.removeItem('@ermisChat-login-config');
  };

  useEffect(() => {
    const run = async () => {
      await requestNotificationPermission();
      await switchUser();
    };
    run();
    return unsubscribePushListenersRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Listen to changes in unread counts and update the badge count
   */
  useEffect(() => {
    const listener = chatClient?.on((e) => {
      if (e.total_unread_count !== undefined) {
        setUnreadCount(e.total_unread_count);
      } else {
        const countUnread = Object.values(chatClient.activeChannels).reduce(
          (count, channel) => count + channel.countUnread(),
          0,
        );
        setUnreadCount(countUnread);
      }
    });

    return () => {
      if (listener) {
        listener.unsubscribe();
      }
    };
  }, [chatClient]);

  return {
    chatClient,
    walletConnect,
    isConnecting,
    loginUser,
    logout,
    switchUser,
    unreadCount,
  };
};
