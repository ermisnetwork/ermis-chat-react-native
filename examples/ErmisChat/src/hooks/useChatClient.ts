import { useEffect, useRef, useState } from 'react';
import { ErmisChat } from 'ermis-chat-sdk';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { QuickSqliteClient } from 'ermis-chat-react-native';
import { USER_TOKENS, USERS } from '../ChatUsers';
import AsyncStore from '../utils/AsyncStore';
import Config from 'react-native-config';
import type { LoginConfig, ErmisChatGenerics } from '../types';
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
// Request Push Notification permission from device.
const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const isEnabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  console.log('Permission Status', { authStatus, isEnabled });
};

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const messageId = remoteMessage.data?.id as string;
  if (!messageId) {
    return;
  }
  const config = await AsyncStore.getItem<LoginConfig | null>(
    '@stream-rn-ErmisChat-login-config',
    null,
  );
  if (!config) {
    return;
  }
  let api_key = Config.REACT_APP_API_KEY || "VskVZNX0ouKF1751699014812";

  const client = ErmisChat.getInstance(api_key);

  const user = {
    id: config.userId,
    image: config.userImage,
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
  const [isConnecting, setIsConnecting] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>();

  const unsubscribePushListenersRef = useRef<() => void>();
  const { close } = useWeb3Modal();
  /**
   * @param config the user login config
   * @returns function to unsubscribe from listeners
   */
  const loginUser = async (config: LoginConfig) => {
    let api_key = Config.REACT_APP_API_KEY || "VskVZNX0ouKF1751699014812";
    // unsubscribe from previous push listeners
    unsubscribePushListenersRef.current?.();
    const client = ErmisChat.getInstance<ErmisChatGenerics>(api_key, {
      timeout: 6000,
      logger: (type, msg) => console.log(type, msg),
      baseURL: Config.REACT_APP_API_URL || 'https://api.ermis.network',
    });
    console.log('api url: ', Config.REACT_APP_API_URL, "   api key: ", Config.REACT_APP_API_KEY)
    setChatClient(client);
    const user = {
      id: config.userId,
      image: config.userImage,
      name: config.userName,
      api_key: api_key,
    };
    const connectedUser = await client.connectUser(user, config.userToken);
    const initialUnreadCount = connectedUser?.me?.total_unread_count;
    setUnreadCount(initialUnreadCount);
    await AsyncStore.setItem('@stream-rn-ErmisChat-login-config', config);
    let profile = await client.queryUser(config.userId);
    client.user = { ...client.user, ...profile }
    client._user = { ...client._user, ...profile }
    const permissionAuthStatus = await messaging().hasPermission();
    const isEnabled =
      permissionAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      permissionAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (isEnabled) {
      // Register FCM token with ermis chat server.
      // const token = await messaging().getToken();
      // await client.addDevice(token, 'firebase');

      // Listen to new FCM tokens and register them with ermis chat server.
      // const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      //   await client.addDevice(newToken, 'firebase');
      // });
      // show notifications when on foreground
      const unsubscribeForegroundMessageReceive = messaging().onMessage(async (remoteMessage) => {
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
              },
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
          '@stream-rn-ErmisChat-login-config',
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
    QuickSqliteClient.resetDB();
    setChatClient(null);
    chatClient?.disconnectUser();
    await AsyncStore.removeItem('@stream-rn-ErmisChat-login-config');
    close();
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
    isConnecting,
    loginUser,
    logout,
    switchUser,
    unreadCount,
  };
};
