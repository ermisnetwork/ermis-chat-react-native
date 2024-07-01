import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import dayjs from 'dayjs';

import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../../../contexts/themeContext/ThemeContext';

import type { DefaultErmisChatGenerics } from '../../../../types/types';

type AudioRecordingInProgressPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageInputContextValue<ErmisChatGenerics>, 'AudioRecordingWaveform'> & {
  /**
   * The waveform data to be presented to show the audio levels.
   */
  waveformData: number[];
  /**
   * Maximum number of waveform lines that should be rendered in the UI.
   */
  maxDataPointsDrawn?: number;
  /**
   * The duration of the voice recording.
   */
  recordingDuration?: number;
};

const AudioRecordingInProgressWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AudioRecordingInProgressPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    AudioRecordingWaveform,
    maxDataPointsDrawn = 80,
    recordingDuration,
    waveformData,
  } = props;

  const {
    theme: {
      colors: { grey_dark },
      messageInput: {
        audioRecordingInProgress: { container, durationText },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.container, container]}>
      {/* `durationMillis` is for Expo apps, `currentPosition` is for Native CLI apps. */}
      <Text style={[styles.durationText, { color: grey_dark }, durationText]}>
        {recordingDuration ? dayjs.duration(recordingDuration).format('mm:ss') : null}
      </Text>
      <AudioRecordingWaveform maxDataPointsDrawn={maxDataPointsDrawn} waveformData={waveformData} />
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: AudioRecordingInProgressPropsWithContext<ErmisChatGenerics>,
  nextProps: AudioRecordingInProgressPropsWithContext<ErmisChatGenerics>,
) => {
  const { recordingDuration: prevRecordingDuration } = prevProps;
  const { recordingDuration: nextRecordingDuration } = nextProps;

  const recordingDurationEqual = prevRecordingDuration === nextRecordingDuration;

  if (!recordingDurationEqual) return false;

  return true;
};

const MemoizedAudioRecordingInProgress = React.memo(
  AudioRecordingInProgressWithContext,
  areEqual,
) as typeof AudioRecordingInProgressWithContext;

export type AudioRecordingInProgressProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<AudioRecordingInProgressPropsWithContext<ErmisChatGenerics>> & {
  waveformData: number[];
};

/**
 * Component displayed when the audio is in the recording state.
 */
export const AudioRecordingInProgress = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AudioRecordingInProgressProps<ErmisChatGenerics>,
) => {
  const { AudioRecordingWaveform } = useMessageInputContext<ErmisChatGenerics>();

  return <MemoizedAudioRecordingInProgress {...{ AudioRecordingWaveform }} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingTop: 4,
  },
  durationText: {
    fontSize: 16,
  },
});

AudioRecordingInProgress.displayName = 'AudioRecordingInProgress{messageInput}';
