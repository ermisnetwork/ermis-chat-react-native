import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Channel,
  Thread,
  ThreadContextValue,
  useAttachmentPickerContext,
  useTheme,
  useTypingString,
} from 'ermis-chat-react-native';

import { ScreenHeader } from '../components/ScreenHeader';

import type { RouteProp } from '@react-navigation/native';

import type { StackNavigatorParamList, ErmisChatGenerics } from '../types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type ThreadScreenRouteProp = RouteProp<StackNavigatorParamList, 'ThreadScreen'>;

type ThreadScreenProps = {
  route: ThreadScreenRouteProp;
};

export type ThreadHeaderProps = {
  thread: ThreadContextValue<ErmisChatGenerics>['thread'];
};

const ThreadHeader: React.FC<ThreadHeaderProps> = ({ thread }) => {
  const typing = useTypingString();

  return (
    <ScreenHeader
      inSafeArea
      subtitleText={typing ? typing : `with ${thread?.user?.name}`}
      titleText='Thread Reply'
    />
  );
};

export const ThreadScreen: React.FC<ThreadScreenProps> = ({
  route: {
    params: { channel, thread },
  },
}) => {
  const {
    theme: {
      colors: { white },
    },
  } = useTheme();
  const { setSelectedImages } = useAttachmentPickerContext();

  useEffect(() => {
    setSelectedImages([]);
    return () => setSelectedImages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: white }]}>
      <Channel<ErmisChatGenerics>
        audioRecordingEnabled={true}
        channel={channel}
        enforceUniqueReaction
        keyboardVerticalOffset={0}
        thread={thread}
        threadList
      >
        <View style={styles.container}>
          <ThreadHeader thread={thread} />
          <Thread<ErmisChatGenerics> />
        </View>
      </Channel>
    </SafeAreaView>
  );
};
