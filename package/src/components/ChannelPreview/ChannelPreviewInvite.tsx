import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ChannelAvatar } from './ChannelAvatar';
import type { ChannelPreviewProps } from './ChannelPreview';
import { ChannelPreviewTitle } from './ChannelPreviewTitle';
import { useChannelPreviewDisplayName } from './hooks/useChannelPreviewDisplayName';

import type { LatestMessagePreview } from './hooks/useLatestMessagePreview';

import {
  ChannelsContextValue,
  useChannelsContext,
} from '../../contexts/channelsContext/ChannelsContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useViewport } from '../../hooks/useViewport';
import type { DefaultErmisChatGenerics } from '../../types/types';
import { LoadingDots } from '../Indicators/LoadingDots';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  contentContainer: { flex: 1 },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  statusContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: '700' },
  decline: {
    backgroundColor: '#D9D9D9',
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
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  loading: { position: 'absolute' }
});

export type ChannelPreviewInvitePropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelPreviewProps<ErmisChatGenerics>, 'channel'> &
  Pick<
    ChannelsContextValue<ErmisChatGenerics>,
    | 'onSelect'
    | 'PreviewAvatar'
    | 'PreviewTitle'
    | 'onAccept'
    | 'onReject'
  > & {
    /**
     * Latest message on a channel, formatted for preview
     *
     * e.g.,
     *
     * ```json
     * {
     *  created_at: '' ,
     *  messageObject: { ... },
     *  previews: {
     *    bold: true,
     *    text: 'This is the message preview text'
     *  },
     *  status: 0 | 1 | 2 // read states of the latest message.
     * }
     * ```
     *
     * The read status is either of the following:
     *
     * 0: The message was not sent by the current user
     * 1: The message was sent by the current user and is unread
     * 2: The message was sent by the current user and is read
     *
     * @overrideType object
     */
    latestMessagePreview: LatestMessagePreview<ErmisChatGenerics>;
    /**
     * Formatter function for date of latest message.
     * @param date Message date
     * @returns Formatted date string
     *
     * By default today's date is shown in 'HH:mm A' format and other dates
     * are displayed in 'DD/MM/YY' format. props.latestMessage.created_at is the
     * default formatted date. This default logic is part of ChannelPreview component.
     */
    formatLatestMessageDate?: (date: Date) => string;
    /** Number of unread messages on the channel */
    unread?: number;
  };

const ChannelPreviewInviteWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelPreviewInvitePropsWithContext<ErmisChatGenerics>,
) => {
  const {
    channel,
    onSelect,
    PreviewAvatar = ChannelAvatar,
    PreviewTitle = ChannelPreviewTitle,
    // onAccept,
    onReject
  } = props;
  const { vw } = useViewport();

  const maxWidth = vw(80) - 16 - 40;

  const {
    theme: {
      channelPreview: { container, contentContainer, row, title },
      colors: { border, white_snow },
    },
  } = useTheme();


  const displayName = useChannelPreviewDisplayName(
    channel,
    Math.floor(maxWidth / ((title.fontSize || styles.title.fontSize) / 2)),
  );
  const [isLoading, setIsLoading] = useState(false);
  const acceptHandler = () => {
    setIsLoading(true);
    channel.acceptInvite().then(() => {
      // if (onAccept) {
      //   onAccept(channel);
      // }
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
      if (onReject) {
        onReject();
      }
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      Alert.alert('Error', error.message);
      console.error(error);
    }
    );
  }
  return (
    <TouchableOpacity
      onPress={() => {
        if (onSelect) {
          onSelect(channel);
        }
      }}
      style={[
        styles.container,
        { backgroundColor: white_snow, borderBottomColor: border },
        container,
      ]}
      testID='channel-preview-button'
      activeOpacity={0.8}
    >
      <PreviewAvatar channel={channel} />
      <View
        style={[styles.contentContainer, contentContainer]}
        testID={`channel-preview-content-${channel.id}`}
      >
        <View style={[styles.row, row]}>
          <PreviewTitle channel={channel} displayName={displayName} />
        </View>
        <View style={[styles.row, row]}>
          <View />
          <View style={styles.statusContainer}>
            <TouchableOpacity onPress={rejectHandler} style={styles.decline} activeOpacity={0.8} disabled={isLoading}>
              <Text style={styles.text}>Decline</Text>
              {isLoading && <LoadingDots style={styles.loading} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={acceptHandler} style={styles.accept} activeOpacity={0.8} disabled={isLoading}>
              <Text style={styles.text}>Accept</Text>
              {isLoading && <LoadingDots style={styles.loading} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity >
  );
};

export type ChannelPreviewInviteProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<
  Omit<
    ChannelPreviewInvitePropsWithContext<ErmisChatGenerics>,
    'channel' | 'latestMessagePreview'
  >
> &
  Pick<
    ChannelPreviewInvitePropsWithContext<ErmisChatGenerics>,
    'channel' | 'latestMessagePreview'
  >;

const MemoizedChannelPreviewInviteWithContext = React.memo(
  ChannelPreviewInviteWithContext,
) as typeof ChannelPreviewInviteWithContext;

/**
 * This UI component displays an individual preview item for each channel in a list. It also receives all props
 * from the ChannelPreview component.
 */
export const ChannelPreviewInvite = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ChannelPreviewInviteProps<ErmisChatGenerics>,
) => {
  const {
    onSelect,
    PreviewAvatar,
    PreviewTitle,
  } = useChannelsContext<ErmisChatGenerics>();
  return (
    <MemoizedChannelPreviewInviteWithContext
      {...{
        onSelect,
        PreviewAvatar,
        PreviewTitle,
      }}
      {...props}
    />
  );
};

ChannelPreviewInvite.displayName = 'ChannelPreviewInvite{channelPreview}';
