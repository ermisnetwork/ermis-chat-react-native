import React, { useCallback, useEffect, useState } from 'react';
import {
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

import { USERS } from '../ChatUsers';
import { useAppContext } from '../context/AppContext';
import { RightArrow } from '../icons/RightArrow';
import { ErmisLogo } from '../icons/ErmisLogo';
import { Settings } from '../icons/Settings';
import AsyncStore from '../utils/AsyncStore';

import type { StackNavigationProp } from '@react-navigation/stack';

import type { LoginConfig, UserSelectorParamList } from '../types';
import ConnectWallet from '../components/ConnectWallet';
import { useAccount, useDisconnect, useSignTypedData } from 'wagmi';
import axiosWalletInstance from '../hooks/axiosWallet';
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

export type UserSelectorScreenNavigationProp = StackNavigationProp<
  UserSelectorParamList,
  'UserSelectorScreen'
>;

type Props = {
  navigation: UserSelectorScreenNavigationProp;
};

export const UserSelectorScreen: React.FC<Props> = ({ navigation }) => {
  const {
    theme: {
      colors: { black, border, grey, grey_gainsboro, grey_whisper, white_snow },
    },
  } = useTheme();
  const { switchUser } = useAppContext();
  const { bottom } = useSafeAreaInsets();
  const { connector, address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetWallet, setIsResetWallet] = useState('false');
  const [severity, setSeverity] = useState('');
  const createNonce = length => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  const onLoginWallet = useCallback(async () => {
    try {
      if (address && connector) {

        if ((severity && severity === 'error') || isResetWallet === 'true') {
          //  fix issue reconecting wallet
          disconnect();
        } else {
          setIsLoading(true);
          const response = await axiosWalletInstance.post('/auth/start', {
            address,
          });

          if (response.status === 200) {
            const challenge = JSON.parse(response.data.challenge);
            const { types, domain, primaryType, message } = challenge;
            const nonce = createNonce(20);

            const signature = await signTypedDataAsync(challenge);


            if (signature) {
              const data = {
                address,
                signature,
                nonce,
              };

              const responseToken = await axiosWalletInstance.post('/auth', data);
              if (responseToken.status === 200) {
                setIsLoading(false);
                const { token } = responseToken.data;
                let config: LoginConfig = {
                  userId: address.toLowerCase(),
                  userImage: 'https://randomuser.me/api/portraits/thumb/women/11.jpg',// this is mock profile, real profile will be added from user sevices.
                  userName: address.toLowerCase(),
                  userToken: token
                };
                switchUser(config);
              }

            }
          }
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      disconnect();
      setIsLoading(false);
    }
  }, [address, connector, severity, isResetWallet]);
  useEffect(() => {
    AsyncStore.setItem('@stream-rn-ErmisChat-user-id', '');
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
