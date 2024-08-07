import React, { useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  ChannelPreviewInvite,
  ChannelPreviewInviteProps,
  MenuPointHorizontal,
  useChatContext,
  useTheme,
} from 'ermis-chat-react-native';

import { useAppOverlayContext } from '../context/AppOverlayContext';
import { useBottomSheetOverlayContext } from '../context/BottomSheetOverlayContext';
import { useChannelInfoOverlayContext } from '../context/ChannelInfoOverlayContext';

import type { StackNavigationProp } from '@react-navigation/stack';

import type { StackNavigatorParamList, ErmisChatGenerics } from '../types';
import { Delete } from '../icons/Delete';

const styles = StyleSheet.create({
  leftSwipeableButton: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 20,
  },
  rightSwipeableButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 20,
  },
  swipeableContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

type ChannelListScreenNavigationProp = StackNavigationProp<
  StackNavigatorParamList,
  'ChannelListScreen'
>;

export const InviteChannelPreview: React.FC<ChannelPreviewInviteProps<ErmisChatGenerics>> = (
  props,
) => {
  const { channel } = props;

  const { setOverlay } = useAppOverlayContext();

  const { setData: setDataBottomSheet } = useBottomSheetOverlayContext();

  const { data, setData } = useChannelInfoOverlayContext();

  const { client } = useChatContext<ErmisChatGenerics>();

  const navigation = useNavigation<ChannelListScreenNavigationProp>();

  const {
    theme: {
      colors: { accent_red, white_smoke },
    },
  } = useTheme();

  const otherMembers = channel
    ? Object.values(channel.state.members).filter((member) => member.user?.id !== data?.clientId)
    : [];
  const swipeableRef = useRef(null);

  const handleClose = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };
  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={[styles.swipeableContainer, { backgroundColor: white_smoke }]}>
          <RectButton
            onPress={() => {
              setData({ channel, clientId: client.userID, navigation });
              setOverlay('channelInfo');
            }}
            style={[styles.leftSwipeableButton]}
          >
            <MenuPointHorizontal />
          </RectButton>
          <RectButton
            onPress={() => {
              setDataBottomSheet({
                confirmText: 'DELETE',
                onConfirm: () => {
                  // channel.delete().then((res) => {
                  //   Alert.alert('Success', 'Channel deleted successfully');
                  //   handleClose();
                  // }).catch((err) => {
                  //   handleClose();
                  //   Alert.alert(err.message);
                  // });
                  setOverlay('none');
                },
                subtext: `Are you sure you want to delete this ${otherMembers.length === 1 ? 'conversation' : 'group'
                  }?`,
                title: `Delete ${otherMembers.length === 1 ? 'Conversation' : 'Group'}`,
              });
              setOverlay('confirmation');
            }}
            style={[styles.rightSwipeableButton]}
          >
            <Delete height={32} pathFill={accent_red} width={32} />
          </RectButton>
        </View>
      )}
    >
      <ChannelPreviewInvite {...props} />
    </Swipeable>
  );
};
