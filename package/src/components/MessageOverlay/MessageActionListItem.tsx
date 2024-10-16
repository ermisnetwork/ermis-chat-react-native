import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useMessageActionAnimation } from './hooks/useMessageActionAnimation';

import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useViewport } from '../../hooks/useViewport';
import type { DefaultErmisChatGenerics } from '../../types/types';
import type { MessageOverlayPropsWithContext } from '../MessageOverlay/MessageOverlay';

export type ActionType =
  | 'blockUser'
  | 'copyMessage'
  | 'deleteMessage'
  | 'editMessage'
  | 'flagMessage'
  | 'muteUser'
  | 'pinMessage'
  | 'selectReaction'
  | 'reply'
  | 'retry'
  | 'quotedReply'
  | 'threadReply'
  | 'unpinMessage';

export type MessageActionType = {
  /**
   * Callback when user presses the action button.
   */
  action: () => void;
  /**
   * Type of the action performed.
   * Eg: 'blockUser', 'copyMessage', 'deleteMessage', 'editMessage', 'flagMessage', 'muteUser', 'pinMessage', 'selectReaction', 'reply', 'retry', 'quotedReply', 'threadReply', 'unpinMessage'
   */
  actionType: ActionType;
  /**
   * Title for action button.
   */
  title: string;
  /**
   * Element to render as icon for action button.
   */
  icon?: React.ReactElement;
  /**
   * Styles for underlying Text component of action title.
   */
  titleStyle?: StyleProp<TextStyle>;
};

export type MessageActionListItemProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = MessageActionType &
  Pick<
    MessageOverlayPropsWithContext<ErmisChatGenerics>,
    'error' | 'isMyMessage' | 'isThreadMessage' | 'message' | 'messageReactions'
  > & {
    index: number;
    length: number;
  };

const MessageActionListItemWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageActionListItemProps<ErmisChatGenerics>,
) => {
  const { action, actionType, icon, index, length, title, titleStyle } = props;
  const { vw } = useViewport();

  const {
    theme: {
      colors: { black, border },
      overlay: { messageActions },
    },
  } = useTheme();

  const { animatedStyle, onTap } = useMessageActionAnimation({ action });

  return (
    <TapGestureHandler onHandlerStateChange={onTap}>
      <Animated.View
        style={[
          styles.row,
          {
            minWidth: vw(65),
          },
          index !== length - 1 ? { ...styles.bottomBorder, borderBottomColor: border } : {},
          animatedStyle,
          messageActions.actionContainer,
        ]}
        testID={`${actionType}-list-item`}
      >
        <View style={messageActions.icon}>{icon}</View>
        <Text style={[styles.titleStyle, { color: black }, titleStyle, messageActions.title]}>
          {title}
        </Text>
      </Animated.View>
    </TapGestureHandler>
  );
};

const messageActionIsEqual = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  prevProps: MessageActionListItemProps<ErmisChatGenerics>,
  nextProps: MessageActionListItemProps<ErmisChatGenerics>,
) => prevProps.length === nextProps.length;

export const MemoizedMessageActionListItem = React.memo(
  MessageActionListItemWithContext,
  messageActionIsEqual,
) as typeof MessageActionListItemWithContext;

/**
 * MessageActionListItem - A high-level component that implements all the logic required for a `MessageAction` in a `MessageActionList`
 */
export const MessageActionListItem = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: MessageActionListItemProps<ErmisChatGenerics>,
) => <MemoizedMessageActionListItem {...props} />;

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
  },
  container: {
    borderRadius: 16,
    marginTop: 8,
    maxWidth: 275,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleStyle: {
    paddingLeft: 20,
  },
});
