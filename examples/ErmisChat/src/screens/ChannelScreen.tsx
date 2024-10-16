import React, { useEffect, useState } from 'react';
import type { Channel as ErmisChatChannel } from 'ermis-chat-sdk';
import { RouteProp, useFocusEffect, useNavigation, useNavigationState } from '@react-navigation/native';
import {
  Channel,
  ChannelAvatar,
  LoadingDots,
  MessageInput,
  MessageList,
  ThreadContextValue,
  useAttachmentPickerContext,
  useChannelPreviewDisplayName,
  useChatContext,
  useTheme,
  useTypingString,
} from 'ermis-chat-react-native';
import { Platform, StyleSheet, View, Text, Alert } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useChannelMembersStatus } from '../hooks/useChannelMembersStatus';

import type { StackNavigatorParamList, ErmisChatGenerics } from '../types';
import { NetworkDownIndicator } from '../components/NetworkDownIndicator';
import { useUserSearchContext } from '../context/UserSearchContext';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inviteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
    padding: 20,
    borderRadius: 16,
  },
  decription: {
    color: 'black',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  decline: {
    backgroundColor: '#EAFEF2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  accept: {
    backgroundColor: '#57B77D',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textDecline: {
    opacity: 0.5,
  },
  textAccept: {
    color: 'white',
    fontWeight: 'bold',
  },
  loading: { position: 'absolute' }
});

export type ChannelScreenNavigationProp = StackNavigationProp<
  StackNavigatorParamList,
  'ChannelScreen'
>;
export type ChannelScreenRouteProp = RouteProp<StackNavigatorParamList, 'ChannelScreen'>;
export type ChannelScreenProps = {
  navigation: ChannelScreenNavigationProp;
  route: ChannelScreenRouteProp;
};

export type ChannelHeaderProps = {
  channel: ErmisChatChannel<ErmisChatGenerics>;
};

export type InviteViewProps = {
  channel: ErmisChatChannel<ErmisChatGenerics>;
  onChange: (state: boolean) => void;
};
const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel }) => {
  const { closePicker } = useAttachmentPickerContext();
  const membersStatus = useChannelMembersStatus(channel);
  const displayName = useChannelPreviewDisplayName(channel, 20);
  const { isOnline } = useChatContext();
  const { chatClient } = useAppContext();
  const navigation = useNavigation<ChannelScreenNavigationProp>();

  // TODO: Khoakheu: Handle navigation go back.
  const routes = useNavigationState((state) => state.routes);
  console.log('routes', routes);

  const typing = useTypingString();

  if (!channel || !chatClient) {
    return null;
  }

  const isOneOnOneConversation =
    channel &&
    Object.values(channel.state.members).length === 2 &&
    channel.type === 'messaging';

  return (
    <ScreenHeader
      onBack={() => {
        if (!navigation.canGoBack()) {
          // if no previous screen was present in history, go to the list screen
          // this can happen when opened through push notification
          navigation.reset({ index: 0, routes: [{ name: 'MessagingScreen' }] });
        } else {
          navigation.goBack();
        }
      }}
      // eslint-disable-next-line react/no-unstable-nested-components
      RightContent={() => (
        <TouchableOpacity
          onPress={() => {
            closePicker();
            // if (isOneOnOneConversation) {
            //   navigation.navigate('OneOnOneChannelDetailScreen', {
            //     channel,
            //   });
            // } else {
            //   navigation.navigate('GroupChannelDetailsScreen', {
            //     channel,
            //   });
            // }
            navigation.navigate('ChannelDetailsScreen', { channel })
          }}
        >
          <ChannelAvatar channel={channel} />
        </TouchableOpacity>
      )}
      showUnreadCountBadge
      Subtitle={isOnline ? undefined : NetworkDownIndicator}
      subtitleText={typing ? typing : membersStatus}
      titleText={displayName}
    />
  );
};

// Invites View for the user to accept or reject invites.
const InviteView: React.FC<InviteViewProps> = ({ channel, onChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<ChannelScreenNavigationProp>();
  const acceptHandler = () => {
    setIsLoading(true);
    channel.acceptInvite().then(() => {
      onChange(false);
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      Alert.alert('Error', error.message);
      console.error(error);
    }
    );
  }
  const rejectHandler = () => {
    setIsLoading(true);
    channel.rejectInvite().then(() => {
      // go back to home screen after rejecting the invite.
      navigation.goBack();
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      Alert.alert('Error', error.message);
      console.error(error);
    }
    );
  }
  return (
    <View style={styles.inviteContainer}>
      <View style={styles.inviteView}>
        <Text style={styles.decription}>Accept the invite to see all message of this conversation</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity onPress={rejectHandler} style={styles.decline} activeOpacity={0.8} disabled={isLoading}>
            <Text style={styles.textDecline}>Decline</Text>
            {isLoading && <LoadingDots style={styles.loading} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={acceptHandler} style={styles.accept} activeOpacity={0.8} disabled={isLoading}>
            <Text style={styles.textAccept}>Accept</Text>
            {isLoading && <LoadingDots style={styles.loading} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Either provide channel or channelId.
export const ChannelScreen: React.FC<ChannelScreenProps> = ({
  route: {
    params: { channel: channelFromProp, channelId, messageId },
  },
}) => {
  const { chatClient } = useAppContext();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const {
    theme: {
      colors: { white },
    },
  } = useTheme();

  const [channel, setChannel] = useState<ErmisChatChannel<ErmisChatGenerics> | undefined>(
    channelFromProp,
  );
  const { channelType, reset } = useUserSearchContext();
  const [selectedThread, setSelectedThread] =
    useState<ThreadContextValue<ErmisChatGenerics>['thread']>();

  const [isInvited, setIsInvited] = useState(false);


  useEffect(() => {
    const initChannel = async () => {
      if (!chatClient || !channelId) {
        return;
      }
      // TODO: KhoaKheu Init (2) team channel one more time after creating a new channel.
      const newChannel = chatClient?.channel(channelType, channelId);
      if (!newChannel?.initialized) {
        await newChannel?.watch();

      }
      setChannel(newChannel);
    };

    initChannel();
  }, [channelId, chatClient]);

  useFocusEffect(() => {
    setSelectedThread(undefined);
  });
  useEffect(() => {
    if (!channel) {
      return;
    }
    if (channel.state.membership?.channel_role === 'pending') {
      setIsInvited(true);
    }
  }, []);
  useEffect(() => {
    if (!channel) {
      return;
    }
    if (channel.state.membership?.channel_role !== 'pending') {
      setIsInvited(false);
    }
  }, [channel?.state.membership?.channel_role]);
  if (!channel || !chatClient) {
    return null;
  }



  return (
    <View style={[styles.flex, { backgroundColor: white, paddingBottom: bottom }]}>
      <Channel
        audioRecordingEnabled={true}
        channel={channel}
        disableTypingIndicator
        enforceUniqueReaction
        initialScrollToFirstUnreadMessage
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -300}
        messageId={messageId}
        NetworkDownIndicator={() => null}
        thread={selectedThread}
      >
        <ChannelHeader channel={channel} />
        {
          isInvited
            ? <InviteView channel={channel} onChange={state => setIsInvited(state)} />
            : <>
              <MessageList<ErmisChatGenerics>
              // onThreadSelect={(thread) => {
              //   setSelectedThread(thread);
              //   navigation.navigate('ThreadScreen', {
              //     channel,
              //     thread,
              //   });
              // }}
              />
              <MessageInput />
            </>
        }
      </Channel>
    </View>
  );
};
