import React, { useEffect } from 'react';
import { DevSettings, LogBox, Platform, useColorScheme } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Chat,
  OverlayProvider,
  QuickSqliteClient,
  ThemeProvider,
  useOverlayContext,
} from 'ermis-chat-react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppContext } from './src/context/AppContext';
import { AppOverlayProvider } from './src/context/AppOverlayProvider';
import { UserSearchProvider } from './src/context/UserSearchContext';
import { useChatClient } from './src/hooks/useChatClient';
import { useErmisChatTheme } from './src/hooks/useErmisChatTheme';
import { AdvancedUserSelectorScreen } from './src/screens/AdvancedUserSelectorScreen';
import { ChannelFilesScreen } from './src/screens/ChannelFilesScreen';
import { ChannelImagesScreen } from './src/screens/ChannelImagesScreen';
import { ChannelScreen } from './src/screens/ChannelScreen';
import { ChannelPinnedMessagesScreen } from './src/screens/ChannelPinnedMessagesScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { GroupChannelDetailsScreen } from './src/screens/GroupChannelDetailsScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { MenuDrawer } from './src/screens/MenuDrawer';
import { NewDirectMessagingScreen } from './src/screens/NewDirectMessagingScreen';
import { NewGroupChannelAddMemberScreen } from './src/screens/NewGroupChannelAddMemberScreen';
import { NewGroupChannelAssignNameScreen } from './src/screens/NewGroupChannelAssignNameScreen';
import { OneOnOneChannelDetailScreen } from './src/screens/OneOnOneChannelDetailScreen';
import { SharedGroupsScreen } from './src/screens/SharedGroupsScreen';
import { ThreadScreen } from './src/screens/ThreadScreen';
import { LoginScreen } from './src/screens/LoginScreen';

import type { ErmisChat } from 'ermis-chat-sdk';
import '@walletconnect/react-native-compat'
import { WagmiConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, avalanche, optimism, bsc, fantom, gnosis } from 'viem/chains'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native'

if (__DEV__) {
  DevSettings.addMenuItem('Reset local DB (offline storage)', () => {
    QuickSqliteClient.resetDB();
    console.info('Local DB reset');
  });
}

import type {
  StackNavigatorParamList,
  ErmisChatGenerics,
  UserSelectorParamList,
} from './src/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigateToChannel, RootNavigationRef } from './src/utils/RootNavigation';
import FastImage from 'react-native-fast-image';
import { ChannelListScreen } from './src/screens/ChannelListScreen';
import Config from 'react-native-config';
import ProfileScreen from './src/screens/ProfileScreen';
import { MentionsScreen } from './src/screens/MentionsScreen';
import { InviteScreen } from './src/screens/InviteScreen';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
console.assert = () => null;

// when a channel id is set here, the intial route is the channel screen
const initialChannelIdGlobalRef = { current: '' };

notifee.onBackgroundEvent(async ({ detail, type }) => {
  // user press on notification detected while app was on background on Android
  if (type === EventType.PRESS) {
    const channelId = detail.notification?.data?.channel_id as string;
    if (channelId) {
      navigateToChannel(channelId);
    }
    await Promise.resolve();
  }
});
const projectId = Config.REACT_APP_PROJECT_ID || 'b7269aa7b1593b2f400e38a23a53b42b';
const chains = [mainnet, polygon, avalanche, arbitrum, bsc, optimism, gnosis, fantom];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: "Ermis chat",
    description: "Ermis chat demo app.",
    url: "https://ermis.network",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
    redirect: {
      native: "w3mdapp://",
      universal: null
    }
  },
});

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<StackNavigatorParamList>();
const App = () => {
  const { chatClient, isConnecting, loginUser, logout, switchUser, unreadCount } = useChatClient();
  const colorScheme = useColorScheme();
  const ErmisChatTheme = useErmisChatTheme();
  useEffect(() => {
    const unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      // Notification caused app to open from background state on iOS
      const channelId = remoteMessage.data?.channel_id as string;
      if (channelId) {
        navigateToChannel(channelId);
      }
    });
    // handle notification clicks on foreground
    const unsubscribeForegroundEvent = notifee.onForegroundEvent(({ detail, type }) => {
      if (type === EventType.PRESS) {
        // user has pressed the foreground notification
        const channelId = detail.notification?.data?.channel_id as string;
        if (channelId) {
          navigateToChannel(channelId);
        }
      }
    });
    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        // Notification caused app to open from quit state on Android
        const channelId = initialNotification.notification.data?.channel_id as string;
        if (channelId) {
          initialChannelIdGlobalRef.current = channelId;
        }
      }
    });
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          // Notification caused app to open from quit state on iOS
          const channelId = remoteMessage.data?.channel_id as string;
          if (channelId) {
            // this will make the app to start with the channel screen with this channel id
            initialChannelIdGlobalRef.current = channelId;
          }
        }
      });
    createWeb3Modal({
      projectId,
      chains,
      wagmiConfig
    });
    return () => {
      unsubscribeOnNotificationOpen();
      unsubscribeForegroundEvent();
    };
  }, []);

  return (
    <SafeAreaProvider
      style={{
        backgroundColor: ErmisChatTheme.colors?.white_snow || '#FCFCFC',
      }}
    >
      <ThemeProvider style={ErmisChatTheme}>
        <NavigationContainer
          ref={RootNavigationRef}
          theme={{
            colors: {
              ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
              background: ErmisChatTheme.colors?.white_snow || '#FCFCFC',
            },
            dark: colorScheme === 'dark',
          }}
        >
          <WagmiConfig config={wagmiConfig} >
            <AppContext.Provider value={{ chatClient, loginUser, logout, switchUser, unreadCount }}>
              {isConnecting && !chatClient ? (
                <LoadingScreen />
              ) : chatClient ? (
                <DrawerNavigatorWrapper chatClient={chatClient} />
              ) : (
                <LoginScreen />
              )}
              <Web3Modal />
            </AppContext.Provider>
          </WagmiConfig>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={MenuDrawer}
    screenOptions={{
      drawerStyle: {
        width: 300,
      },
    }}
  >
    <Drawer.Screen component={HomeScreen} name='HomeScreen' options={{ headerShown: false }} />
  </Drawer.Navigator>
);

const DrawerNavigatorWrapper: React.FC<{
  chatClient: ErmisChat<ErmisChatGenerics>;
}> = ({ chatClient }) => {
  const { bottom } = useSafeAreaInsets();
  const ErmisChatTheme = useErmisChatTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OverlayProvider<ErmisChatGenerics> bottomInset={bottom} value={{ style: ErmisChatTheme }}>
        <Chat<ErmisChatGenerics>
          client={chatClient}
          enableOfflineSupport
          // @ts-expect-error
          ImageComponent={FastImage}
        >
          <AppOverlayProvider>
            <UserSearchProvider>
              <DrawerNavigator />
            </UserSearchProvider>
          </AppOverlayProvider>
        </Chat>
      </OverlayProvider>
    </GestureHandlerRootView>
  );
};


// TODO: Split the stack into multiple stacks - ChannelStack, CreateChannelStack etc.
const HomeScreen = () => {
  const { overlay } = useOverlayContext();

  return (
    <Stack.Navigator
      initialRouteName={initialChannelIdGlobalRef.current ? 'ChannelScreen' : 'MessagingScreen'}
    >
      <Stack.Screen
        component={ChatScreen}
        name='MessagingScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ChannelScreen}
        initialParams={
          initialChannelIdGlobalRef.current
            ? { channelId: initialChannelIdGlobalRef.current }
            : undefined
        }
        name='ChannelScreen'
        options={{
          gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={NewDirectMessagingScreen}
        name='NewDirectMessagingScreen'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={NewGroupChannelAddMemberScreen}
        name='NewGroupChannelAddMemberScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={NewGroupChannelAssignNameScreen}
        name='NewGroupChannelAssignNameScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={OneOnOneChannelDetailScreen}
        name='OneOnOneChannelDetailScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={GroupChannelDetailsScreen}
        name='GroupChannelDetailsScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ChannelImagesScreen}
        name='ChannelImagesScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ChannelFilesScreen}
        name='ChannelFilesScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ChannelPinnedMessagesScreen}
        name='ChannelPinnedMessagesScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={SharedGroupsScreen}
        name='SharedGroupsScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ThreadScreen}
        name='ThreadScreen'
        options={{
          gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={ProfileScreen}
        name='ProfileScreen'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={InviteScreen}
        name='InviteScreen'
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default App;
