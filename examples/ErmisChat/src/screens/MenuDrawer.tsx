import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Edit, Group, User, useTheme } from 'ermis-chat-react-native';

import { useAppContext } from '../context/AppContext';

import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useDisconnect } from 'wagmi';
const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
  },
});

export const MenuDrawer = ({ navigation }: DrawerContentComponentProps) => {
  const {
    theme: {
      colors: { black, grey, white },
    },
  } = useTheme();

  const { chatClient, logout } = useAppContext();
  const { disconnect } = useDisconnect();
  if (!chatClient) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: white }]}>
      <View style={styles.userRow}>
        <Image
          source={{
            uri: chatClient.user?.avatar,
          }}
          style={styles.avatar}
        />
        <Text
          style={[
            styles.userName,
            {
              color: black,
            },
          ]}
        >
          {chatClient.user?.name}
        </Text>
      </View>
      <View style={styles.menuContainer}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}
            style={styles.menuItem}
          >
            <Edit height={24} pathFill={grey} width={24} />
            <Text
              style={[
                styles.menuTitle,
                {
                  color: black,
                },
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PlatformScreen')}
            style={styles.menuItem}
          >
            <Group height={24} pathFill={grey} width={24} />
            <Text
              style={[
                styles.menuTitle,
                {
                  color: black,
                },
              ]}
            >
              Test Platform
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SdkScreen')}
            style={styles.menuItem}
          >
            <Group height={24} pathFill={grey} width={24} />
            <Text
              style={[
                styles.menuTitle,
                {
                  color: black,
                },
              ]}
            >
              Sdks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ErmisScreen')}
            style={styles.menuItem}
          >
            <Edit height={24} pathFill={grey} width={24} />
            <Text
              style={[
                styles.menuTitle,
                {
                  color: black,
                },
              ]}
            >
              Ermis
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            logout();
            disconnect();
          }}
          style={styles.menuItem}
        >
          <User height={24} pathFill={grey} width={24} />
          <Text
            style={[
              styles.menuTitle,
              {
                color: black,
              },
            ]}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
