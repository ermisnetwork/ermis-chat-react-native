import React from 'react';
import { Alert, Linking, Pressable, StyleSheet } from 'react-native';

import {
  ChannelContextValue,
  useChannelContext,
} from '../../../../contexts/channelContext/ChannelContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../../contexts/translationContext/TranslationContext';
import { Mic } from '../../../../icons/Mic';
import { AudioRecordingReturnType, triggerHaptic } from '../../../../native';

import type { DefaultErmisChatGenerics } from '../../../../types/types';

type AudioRecordingButtonPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelContextValue<ErmisChatGenerics>, 'disabled'> &
  Pick<MessageInputContextValue<ErmisChatGenerics>, 'asyncMessagesMinimumPressDuration'> & {
    /**
     * The current voice recording that is in progress.
     */
    recording: AudioRecordingReturnType;
    /**
     * Size of the mic button.
     */
    buttonSize?: number;
    /**
     * Handler to determine what should happen on long press of the mic button.
     */
    handleLongPress?: () => void;
    /**
     * Handler to determine what should happen on press of the mic button.
     */
    handlePress?: () => void;
    /**
     * Boolean to determine if the audio recording permissions are granted.
     */
    permissionsGranted?: boolean;
    /**
     * Function to start the voice recording.
     */
    startVoiceRecording?: () => Promise<void>;
  };

const AudioRecordingButtonWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AudioRecordingButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    asyncMessagesMinimumPressDuration,
    buttonSize,
    disabled,
    handleLongPress,
    handlePress,
    permissionsGranted,
    recording,
    startVoiceRecording,
  } = props;

  const {
    theme: {
      colors: { grey, light_gray, white },
      messageInput: {
        audioRecordingButton: { container, micIcon },
      },
    },
  } = useTheme();
  const { t } = useTranslationContext();

  const onPressHandler = () => {
    if (handlePress) {
      handlePress();
    }
    if (!recording) {
      triggerHaptic('notificationError');
      Alert.alert(t('Hold to start recording.'));
    }
  };

  const onLongPressHandler = () => {
    if (handleLongPress) {
      handleLongPress();
      return;
    }
    if (!recording) {
      triggerHaptic('impactHeavy');
      if (!permissionsGranted) {
        Alert.alert(t('Please allow Audio permissions in settings.'), '', [
          {
            onPress: () => {
              Linking.openSettings();
            },
            text: t('Open Settings'),
          },
        ]);
        return;
      }
      if (startVoiceRecording) startVoiceRecording();
    }
  };

  return (
    <Pressable
      delayLongPress={asyncMessagesMinimumPressDuration}
      disabled={disabled}
      onLongPress={onLongPressHandler}
      onPress={onPressHandler}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? light_gray : white,
          height: buttonSize || 40,
          width: buttonSize || 40,
        },
        container,
      ]}
      testID='audio-button'
    >
      <Mic fill={grey} size={32} {...micIcon} />
    </Pressable>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: AudioRecordingButtonPropsWithContext<ErmisChatGenerics>,
  nextProps: AudioRecordingButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    asyncMessagesMinimumPressDuration: prevAsyncMessagesMinimumPressDuration,
    disabled: prevDisabled,
    recording: prevRecording,
  } = prevProps;
  const {
    asyncMessagesMinimumPressDuration: nextAsyncMessagesMinimumPressDuration,
    disabled: nextDisabled,
    recording: nextRecording,
  } = nextProps;

  const asyncMessagesMinimumPressDurationEqual =
    prevAsyncMessagesMinimumPressDuration === nextAsyncMessagesMinimumPressDuration;
  if (!asyncMessagesMinimumPressDurationEqual) return false;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  const recordingEqual = prevRecording === nextRecording;
  if (!recordingEqual) return false;

  return true;
};

const MemoizedAudioRecordingButton = React.memo(
  AudioRecordingButtonWithContext,
  areEqual,
) as typeof AudioRecordingButtonWithContext;

export type AudioRecordingButtonProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<AudioRecordingButtonPropsWithContext<ErmisChatGenerics>> & {
  recording: AudioRecordingReturnType;
};

/**
 * Component to display the mic button on the Message Input.
 */
export const AudioRecordingButton = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AudioRecordingButtonProps<ErmisChatGenerics>,
) => {
  const { disabled = false } = useChannelContext<ErmisChatGenerics>();
  const { asyncMessagesMinimumPressDuration } = useMessageInputContext<ErmisChatGenerics>();

  return (
    <MemoizedAudioRecordingButton {...{ asyncMessagesMinimumPressDuration, disabled }} {...props} />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
  },
});

AudioRecordingButton.displayName = 'AudioRecordingButton{messageInput}';
