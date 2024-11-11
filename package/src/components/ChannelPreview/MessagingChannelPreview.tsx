import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ChannelAvatar } from './ChannelAvatar';
import type { ChannelPreviewProps } from './ChannelPreview';
import { ChannelPreviewTitle } from './ChannelPreviewTitle';
import { useChannelPreviewDisplayName } from './hooks/useChannelPreviewDisplayName';


import {
  ChannelsContextValue,
  useChannelsContext,
} from '../../contexts/channelsContext/ChannelsContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useViewport } from '../../hooks/useViewport';
import type { DefaultErmisChatGenerics } from '../../types/types';
import { ArrowRight } from '../../icons';

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

export type MessagingChannelPreviewPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelPreviewProps<ErmisChatGenerics>, 'channel'> &
  Pick<
    ChannelsContextValue<ErmisChatGenerics>,
    | 'onSelect'
    | 'PreviewAvatar'
    | 'PreviewTitle'
  >;

const MessagingChannelPreviewWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessagingChannelPreviewPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    channel,
    onSelect,
    PreviewAvatar = ChannelAvatar,
    PreviewTitle = ChannelPreviewTitle,
  } = props;
  const { vw } = useViewport();

  const maxWidth = vw(80) - 16 - 40;

  const {
    theme: {
      channelPreview: { container, contentContainer, row, title },
      colors: { border, white_snow, grey_dark },
    },
  } = useTheme();


  const displayName = useChannelPreviewDisplayName(
    channel,
    Math.floor(maxWidth / ((title.fontSize || styles.title.fontSize) / 2)),
  );

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
            <ArrowRight fill={grey_dark} width={24} height={24} />
          </View>
        </View>
      </View>
    </TouchableOpacity >
  );
};

export type MessagingChannelPreviewProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<
  Omit<
    MessagingChannelPreviewPropsWithContext<ErmisChatGenerics>,
    'channel'
  >
> &
  Pick<
    MessagingChannelPreviewPropsWithContext<ErmisChatGenerics>,
    'channel'
  >;

const MemoizedMessagingChannelPreviewWithContext = React.memo(
  MessagingChannelPreviewWithContext,
) as typeof MessagingChannelPreviewWithContext;

/**
 * This UI component displays an individual preview item for each channel in a list. It also receives all props
 * from the ChannelPreview component.
 */
export const MessagingChannelPreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessagingChannelPreviewProps<ErmisChatGenerics>,
) => {
  const {
    onSelect,
    PreviewAvatar,
    PreviewTitle,
  } = useChannelsContext<ErmisChatGenerics>();
  return (
    <MemoizedMessagingChannelPreviewWithContext
      {...{
        onSelect,
        PreviewAvatar,
        PreviewTitle,
      }}
      {...props}
    />
  );
};

MessagingChannelPreview.displayName = 'MessagingChannelPreview{channelPreview}';
