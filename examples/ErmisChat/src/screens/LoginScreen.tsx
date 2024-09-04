import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, version } from 'ermis-chat-react-native';

import { useAppContext } from '../context/AppContext';
import { WalletConnect, ErmisChat } from 'ermis-chat-sdk';
import { ErmisLogo } from '../icons/ErmisLogo';
import { Settings } from '../icons/Settings';
import AsyncStore from '../utils/AsyncStore';

import type { StackNavigationProp } from '@react-navigation/stack';

import type { ErmisChatGenerics, LoginConfig, UserSelectorParamList } from '../types';
import ConnectWallet from '../components/ConnectWallet';
import { useAccount, useDisconnect, useSignTypedData } from 'wagmi';
import { W3mAccountButton } from '@web3modal/wagmi-react-native'
import Config from 'react-native-config';
const styles = StyleSheet.create({
  avatarImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  footerText: {
    textAlign: 'center',
  },
  nameContainer: {
    marginLeft: 8,
  },
  rightArrow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 12,
  },
  scrollContainer: {
    flex: 1,
    overflow: 'visible',
  },
  subTitle: {
    fontSize: 14,
    marginTop: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 31,
    paddingTop: 34,
  },
  userContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    flex: 1
  },
});

export type LoginScreenNavigationProp = StackNavigationProp<
  UserSelectorParamList,
  'LoginScreen'
>;

type Props = {
  // navigation: LoginScreenNavigationProp;
};

export const LoginScreen: React.FC<Props> = () => {
  const {
    theme: {
      colors: { black, border, grey, grey_gainsboro, grey_whisper, white_snow },
    },
  } = useTheme();
  const { walletConnect, chatClient, switchUser } = useAppContext();
  const { bottom } = useSafeAreaInsets();
  const { connector, address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetWallet, setIsResetWallet] = useState('false');

  const onLoginWallet = useCallback(async () => {

    try {
      if (address && connector) {
        setIsLoading(true);

        console.log('--------------------address: ', address.toLowerCase());
        let api_key = Config.REACT_APP_API_KEY || "VskVZNX0ouKF1751699014812";
        const wallet = WalletConnect.getInstance(api_key, address.toLowerCase(), {
          timeout: 6000,
          logger: (type, msg) => console.log(type, msg),
          baseURL: Config.REACT_APP_API_URL || 'https://api.ermis.network',
        });

        // call startAuth to get challenge
        const startAuthResponse = await wallet.startAuth();
        // get challenge
        const challenge = JSON.parse(startAuthResponse.challenge);
        // get signature
        const signature = await signTypedDataAsync(challenge);

        if (signature) {

          let getTokenReponse = await wallet.getAuth(signature);

          let { token, refresh_token } = getTokenReponse;
          console.log('--------------------token: ', token);
          console.log('--------------------refresh_token: ', refresh_token);

          let config: LoginConfig = {
            userId: address.toLowerCase(),
            userToken: token
          };

          switchUser(config);

        }
        setIsLoading(false);

      } else {
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      disconnect();
      setIsLoading(false);
    }
  }, [address, connector, isResetWallet]);
  useEffect(() => {
    onLoginWallet();
  }, []);
  useEffect(() => {
    onLoginWallet();
  }, [onLoginWallet]);
  return (
    <SafeAreaView
      edges={['right', 'top', 'left']}
      style={[styles.container, { backgroundColor: white_snow }]}
      testID='user-selector-screen'
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollContainer}
        testID='users-list'
      >
        <View style={styles.titleContainer}>
          <ErmisLogo />
          <Text style={[styles.title, { color: black }]}>Welcome to Ermis Chat</Text>
          <W3mAccountButton />
        </View>
        <View style={styles.walletView}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            flex: 1,
          }}>
            <ConnectWallet />
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          {
            backgroundColor: white_snow,
            paddingBottom: bottom ? bottom : 16,
            paddingTop: 16,
          },
        ]}
      >
        <Text style={[styles.footerText, { color: grey_gainsboro }]}>Ermis SDK v{version}</Text>
      </View>
    </SafeAreaView>
  );
};
