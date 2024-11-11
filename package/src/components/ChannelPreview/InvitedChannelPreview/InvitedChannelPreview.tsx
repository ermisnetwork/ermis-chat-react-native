import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ChannelAvatar } from './../ChannelAvatar';
import type { ChannelPreviewProps } from './../ChannelPreview';
import { ChannelPreviewTitle } from './../ChannelPreviewTitle';
import { useChannelPreviewDisplayName } from './../hooks/useChannelPreviewDisplayName';


import {
  ChannelsContextValue,
  useChannelsContext,
} from '../../../contexts/channelsContext/ChannelsContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useViewport } from '../../../hooks/useViewport';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { LoadingDots } from '../../Indicators/LoadingDots';

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

export type InvitedChannelPreviewPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelPreviewProps<ErmisChatGenerics>, 'channel'> &
  Pick<
    ChannelsContextValue<ErmisChatGenerics>,
    | 'onSelect'
    | 'PreviewAvatar'
    | 'PreviewTitle'
    | 'onAccept'
    | 'onReject'
  >;

const InvitedChannelPreviewWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InvitedChannelPreviewPropsWithContext<ErmisChatGenerics>,
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
    channel.acceptInvite('accept').then(() => {
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

export type InvitedChannelPreviewProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<
  Omit<
    InvitedChannelPreviewPropsWithContext<ErmisChatGenerics>,
    'channel'
  >
> &
  Pick<
    InvitedChannelPreviewPropsWithContext<ErmisChatGenerics>,
    'channel'
  >;

const MemoizedInvitedChannelPreviewWithContext = React.memo(
  InvitedChannelPreviewWithContext,
) as typeof InvitedChannelPreviewWithContext;

/**
 * This UI component displays an individual preview item for each channel in a list. It also receives all props
 * from the ChannelPreview component.
 */
export const InvitedChannelPreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InvitedChannelPreviewProps<ErmisChatGenerics>,
) => {
  const {
    onSelect,
    PreviewAvatar,
    PreviewTitle,
  } = useChannelsContext<ErmisChatGenerics>();
  return (
    <MemoizedInvitedChannelPreviewWithContext
      {...{
        onSelect,
        PreviewAvatar,
        PreviewTitle,
      }}
      {...props}
    />
  );
};

InvitedChannelPreview.displayName = 'InvitedChannelPreview{channelPreview}';
