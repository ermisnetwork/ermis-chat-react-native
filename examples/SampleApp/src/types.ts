import type { Immutable } from 'seamless-immutable';
import type { Channel, UserResponse } from 'ermis-chat-sdk';
import type { ThreadContextValue } from 'ermis-chat-react-native';
import type { Theme } from '@react-navigation/native';

export type LocalAttachmentType = {
  file_size?: number;
  mime_type?: string;
};
export type LocalChannelType = Record<string, unknown>;
export type LocalCommandType = string;
export type LocalEventType = Record<string, unknown>;
export type LocalMessageType = Record<string, unknown>;
export type LocalReactionType = Record<string, unknown>;
export type LocalUserType = {
  image?: string;
};
type LocalPollOptionType = Record<string, unknown>;
type LocalPollType = Record<string, unknown>;

export type ErmisChatGenerics = {
  attachmentType: LocalAttachmentType;
  channelType: LocalChannelType;
  commandType: LocalCommandType;
  eventType: LocalEventType;
  messageType: LocalMessageType;
  pollOptionType: LocalPollOptionType;
  pollType: LocalPollType;
  reactionType: LocalReactionType;
  userType: LocalUserType;
};

export type DrawerNavigatorParamList = {
  HomeScreen: undefined;
  UserSelectorScreen: undefined;
};

export type StackNavigatorParamList = {
  ChannelFilesScreen: {
    channel: Channel<ErmisChatGenerics>;
  };
  ChannelImagesScreen: {
    channel: Channel<ErmisChatGenerics>;
  };
  ChannelListScreen: undefined;
  ChannelPinnedMessagesScreen: {
    channel: Channel<ErmisChatGenerics>;
  };
  ChannelScreen: {
    channel?: Channel<ErmisChatGenerics>;
    channelId?: string;
    messageId?: string;
  };
  GroupChannelDetailsScreen: {
    channel: Channel<ErmisChatGenerics>;
  };
  MessagingScreen: undefined;
  NewDirectMessagingScreen: undefined;
  NewGroupChannelAddMemberScreen: undefined;
  NewGroupChannelAssignNameScreen: undefined;
  OneOnOneChannelDetailScreen: {
    channel: Channel<ErmisChatGenerics>;
  };
  SharedGroupsScreen: {
    user: Immutable<UserResponse<ErmisChatGenerics>> | UserResponse<ErmisChatGenerics>;
  };
  ThreadScreen: {
    channel: Channel<ErmisChatGenerics>;
    thread: ThreadContextValue<ErmisChatGenerics>['thread'];
  };
};

export type UserSelectorParamList = {
  AdvancedUserSelectorScreen: undefined;
  UserSelectorScreen: undefined;
};

export type BottomTabNavigatorParamList = {
  ChatScreen: undefined;
  MentionsScreen: undefined;
};

export type AppTheme = Theme & {
  colors: {
    background: string;
    backgroundFadeGradient: string;
    backgroundNavigation: string;
    backgroundSecondary: string;
    borderLight: string;
    danger: string;
    dateStampBackground: string;
    footnote: string;
    greyContentBackground: string;
    iconButtonBackground: string;
    success: string;
    text: string;
    textInverted: string;
    textLight: string;
    textSecondary: string;
  };
};

export type LoginConfig = {
  apiKey: string;
  userId: string;
  userToken: string;
  userImage?: string;
  userName?: string;
};
