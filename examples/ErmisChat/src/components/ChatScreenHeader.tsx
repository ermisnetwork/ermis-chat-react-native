import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CompositeNavigationProp, useNavigation, useNavigationState } from '@react-navigation/native';
import { useChatContext, useTheme } from 'ermis-chat-react-native';

import { RoundButton } from './RoundButton';
import { ScreenHeader } from './ScreenHeader';

import { useAppContext } from '../context/AppContext';
import { NewDirectMessageIcon } from '../icons/NewDirectMessageIcon';

import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { StackNavigationProp } from '@react-navigation/stack';

import type { DrawerNavigatorParamList, StackNavigatorParamList } from '../types';
import { NetworkDownIndicator } from './NetworkDownIndicator';
import AsyncStore from '../utils/AsyncStore';

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
});

type ChatScreenHeaderNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerNavigatorParamList>,
  StackNavigationProp<StackNavigatorParamList>
>;

export const ChatScreenHeader: React.FC<{ title?: string, MiddleContent?: React.ElementType }> = ({ title, MiddleContent = () => <></> }) => {
  const navigationState = useNavigationState((state) => state);
  const {
    theme: {
      colors: { accent_blue },
    },
  } = useTheme();

  const navigation = useNavigation<ChatScreenHeaderNavigationProp>();
  const { chatClient } = useAppContext();
  const { isOnline } = useChatContext();
  const [platform, setPlatform] = useState<string>();
  useEffect(() => {
    const fetchPlatform = async () => {
      if (navigationState) {
        const currentRoute = navigationState.routes[navigationState.index].name;
        AsyncStore.setItem('@ermisPlatform', currentRoute);
        if (currentRoute === 'SdkScreen') {
          setPlatform('SDKs');
        } else {
          setPlatform('Ermis')
        }
      }
    };
    fetchPlatform();
  }, [navigationState]);
  useEffect(() => {
    console.log('chatClient?.user?.avatar', chatClient?.user?.avatar);
  }, [chatClient?.user?.avatar]);
  return (
    <ScreenHeader
      // eslint-disable-next-line react/no-unstable-nested-components
      LeftContent={() => (
        <TouchableOpacity onPress={navigation.openDrawer}>
          {/* <Image
            source={{
              uri: chatClient?.user?.avatar,
            }}
            style={styles.avatar}
          /> */}
          <Text>{platform}</Text>
        </TouchableOpacity>
      )}
      // eslint-disable-next-line react/no-unstable-nested-components
      RightContent={() => (
        <RoundButton
          onPress={() => {
            navigation.navigate('NewDirectMessagingScreen');
          }}
        >
          <NewDirectMessageIcon active color={accent_blue} height={25} width={25} />
        </RoundButton>
      )}
      // eslint-disable-next-line react/no-unstable-nested-components
      Title={isOnline ? title ? undefined : () => <MiddleContent /> : () => <NetworkDownIndicator titleSize='large' />}
      titleText={title}
    />
  );
};
