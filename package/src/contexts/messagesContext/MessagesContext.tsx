import React, { PropsWithChildren, useContext } from 'react';

import type { TouchableOpacityProps } from 'react-native';

import type { Attachment, ChannelState, MessageResponse } from 'ermis-chat-sdk';

import type { AttachmentProps } from '../../components/Attachment/Attachment';
import type { AttachmentActionsProps } from '../../components/Attachment/AttachmentActions';
import type { AudioAttachmentProps } from '../../components/Attachment/AudioAttachment';
import type { CardProps } from '../../components/Attachment/Card';
import type { FileAttachmentProps } from '../../components/Attachment/FileAttachment';
import type { FileAttachmentGroupProps } from '../../components/Attachment/FileAttachmentGroup';
import type { FileIconProps } from '../../components/Attachment/FileIcon';
import type { GalleryProps } from '../../components/Attachment/Gallery';
import type { GiphyProps } from '../../components/Attachment/Giphy';
import type { ImageLoadingFailedIndicatorProps } from '../../components/Attachment/ImageLoadingFailedIndicator';
import type { ImageLoadingIndicatorProps } from '../../components/Attachment/ImageLoadingIndicator';
import type { VideoThumbnailProps } from '../../components/Attachment/VideoThumbnail';
import type {
  MessageProps,
  MessageTouchableHandlerPayload,
} from '../../components/Message/Message';
import type { MessageAvatarProps } from '../../components/Message/MessageSimple/MessageAvatar';
import type { MessageBounceProps } from '../../components/Message/MessageSimple/MessageBounce';
import type { MessageContentProps } from '../../components/Message/MessageSimple/MessageContent';
import type { MessageDeletedProps } from '../../components/Message/MessageSimple/MessageDeleted';
import type { MessageEditedTimestampProps } from '../../components/Message/MessageSimple/MessageEditedTimestamp';
import type { MessageErrorProps } from '../../components/Message/MessageSimple/MessageError';
import type { MessageFooterProps } from '../../components/Message/MessageSimple/MessageFooter';
import type { MessagePinnedHeaderProps } from '../../components/Message/MessageSimple/MessagePinnedHeader';
import type { MessageRepliesProps } from '../../components/Message/MessageSimple/MessageReplies';
import type { MessageRepliesAvatarsProps } from '../../components/Message/MessageSimple/MessageRepliesAvatars';
import type { MessageSimpleProps } from '../../components/Message/MessageSimple/MessageSimple';
import type { MessageStatusProps } from '../../components/Message/MessageSimple/MessageStatus';
import type { MessageTextProps } from '../../components/Message/MessageSimple/MessageTextContainer';
import { MessageTimestampProps } from '../../components/Message/MessageSimple/MessageTimestamp';
import type { ReactionListProps } from '../../components/Message/MessageSimple/ReactionList';
import type { MarkdownRules } from '../../components/Message/MessageSimple/utils/renderText';
import type { MessageActionsParams } from '../../components/Message/utils/messageActions';
import type { DateHeaderProps } from '../../components/MessageList/DateHeader';
import type { MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { InlineDateSeparatorProps } from '../../components/MessageList/InlineDateSeparator';
import type { MessageListProps } from '../../components/MessageList/MessageList';
import type { MessageSystemProps } from '../../components/MessageList/MessageSystem';
import type { ScrollToBottomButtonProps } from '../../components/MessageList/ScrollToBottomButton';
import { TypingIndicatorContainerProps } from '../../components/MessageList/TypingIndicatorContainer';
import type { getGroupStyles } from '../../components/MessageList/utils/getGroupStyles';
import type { MessageActionType } from '../../components/MessageOverlay/MessageActionListItem';
import type { OverlayReactionListProps } from '../../components/MessageOverlay/OverlayReactionList';
import type { ReplyProps } from '../../components/Reply/Reply';
import type { FlatList } from '../../native';
import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import type { ReactionData } from '../../utils/utils';
import type { Alignment } from '../messageContext/MessageContext';
import type { SuggestionCommand } from '../suggestionsContext/SuggestionsContext';
import type { DeepPartial } from '../themeContext/ThemeContext';
import type { Theme } from '../themeContext/utils/theme';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type MessageContentType = 'attachments' | 'files' | 'gallery' | 'quoted_reply' | 'text';
export type DeletedMessagesVisibilityType = 'always' | 'never' | 'receiver' | 'sender';

export type MessagesContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  /**
   * UI component for Attachment.
   * Defaults to: [Attachment]
   */
  Attachment: React.ComponentType<AttachmentProps<ErmisChatGenerics>>;
  /**
   * UI component to display AttachmentActions. e.g., send, shuffle, cancel in case of giphy
   * Defaults to: [AttachmentActions]
   */
  AttachmentActions: React.ComponentType<AttachmentActionsProps<ErmisChatGenerics>>;
  /** Custom UI component for AudioAttachment. */
  AudioAttachment: React.ComponentType<AudioAttachmentProps>;
  /**
   * UI component to display generic media type e.g. giphy, url preview etc
   * Defaults to: [Card]
   */
  Card: React.ComponentType<CardProps<ErmisChatGenerics>>;
  /**
   * UI component for DateHeader
   * Defaults to: [DateHeader]
   **/
  DateHeader: React.ComponentType<DateHeaderProps>;
  deleteMessage: (message: MessageResponse<ErmisChatGenerics>) => Promise<void>;
  deleteReaction: (type: string, messageId: string) => Promise<void>;

  /** Should keyboard be dismissed when messaged is touched */
  dismissKeyboardOnMessageTouch: boolean;

  enableMessageGroupingByUser: boolean;

  /**
   * UI component to display File type attachment.
   * Defaults to: [FileAttachment]
   */
  FileAttachment: React.ComponentType<FileAttachmentProps<ErmisChatGenerics>>;
  /**
   * UI component to display group of File type attachments or multiple file attachments (in single message).
   * Defaults to: [FileAttachmentGroup]
   */
  FileAttachmentGroup: React.ComponentType<FileAttachmentGroupProps<ErmisChatGenerics>>;
  /**
   * UI component for attachment icon for type 'file' attachment.
   * Defaults to: https://github.com/
   */
  FileAttachmentIcon: React.ComponentType<FileIconProps>;
  FlatList: typeof FlatList;
  /**
   * UI component to display image attachments
   * Defaults to: [Gallery]
   */
  Gallery: React.ComponentType<GalleryProps<ErmisChatGenerics>>;
  /**
   * UI component for Giphy
   * Defaults to: [Giphy]
   */
  Giphy: React.ComponentType<GiphyProps<ErmisChatGenerics>>;
  /**
   * The giphy version to render - check the keys of the [Image Object](https://developers.giphy.com/docs/api/schema#image-object) for possible values. Uses 'fixed_height' by default
   * */
  giphyVersion: keyof NonNullable<Attachment['giphy']>;

  /**
   * The indicator rendered when loading an image fails.
   */
  ImageLoadingFailedIndicator: React.ComponentType<ImageLoadingFailedIndicatorProps>;

  /**
   * The indicator rendered when image is loading. By default renders <ActivityIndicator/>
   */
  ImageLoadingIndicator: React.ComponentType<ImageLoadingIndicatorProps>;

  /**
   * When true, messageList will be scrolled at first unread message, when opened.
   */
  initialScrollToFirstUnreadMessage: boolean;
  /**
   * UI component for Message Date Separator Component
   * Defaults to: [InlineDateSeparator]
   */
  InlineDateSeparator: React.ComponentType<InlineDateSeparatorProps>;
  /**
   * UI component for InlineUnreadIndicator
   * Defaults to: [InlineUnreadIndicator]
   **/
  InlineUnreadIndicator: React.ComponentType;

  Message: React.ComponentType<MessageProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageAvatar
   * Defaults to: [MessageAvatar]
   **/
  MessageAvatar: React.ComponentType<MessageAvatarProps<ErmisChatGenerics>>;
  /**
   * UI Component for MessageBounce
   */
  MessageBounce: React.ComponentType<MessageBounceProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageContent
   * Defaults to: [MessageContent]
   */
  MessageContent: React.ComponentType<MessageContentProps<ErmisChatGenerics>>;
  /** Order to render the message content */
  messageContentOrder: MessageContentType[];
  /**
   * UI component for MessageDeleted
   * Defaults to: [MessageDeleted]
   */
  MessageDeleted: React.ComponentType<MessageDeletedProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageEditedTimestamp
   * Defaults to: [MessageEditedTimestamp]
   */
  MessageEditedTimestamp: React.ComponentType<MessageEditedTimestampProps>;
  /**
   * UI component for the MessageError.
   */
  MessageError: React.ComponentType<MessageErrorProps>;
  /**
   * Custom message footer component
   */
  MessageFooter: React.ComponentType<MessageFooterProps<ErmisChatGenerics>>;
  MessageList: React.ComponentType<MessageListProps<ErmisChatGenerics>>;
  /**
   * Custom message pinned component
   */
  MessagePinnedHeader: React.ComponentType<MessagePinnedHeaderProps<ErmisChatGenerics>>;

  /**
   * UI component for MessageReplies
   * Defaults to: [MessageReplies]
   */
  MessageReplies: React.ComponentType<MessageRepliesProps<ErmisChatGenerics>>;
  /**
   * UI Component for MessageRepliesAvatars
   * Defaults to: [MessageRepliesAvatars]
   */
  MessageRepliesAvatars: React.ComponentType<MessageRepliesAvatarsProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageSimple
   * Defaults to: [MessageSimple]
   */
  MessageSimple: React.ComponentType<MessageSimpleProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageStatus (delivered/read)
   * Defaults to: [MessageStatus]
   */
  MessageStatus: React.ComponentType<MessageStatusProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageSystem
   * Defaults to: [MessageSystem](https://
   */
  MessageSystem: React.ComponentType<MessageSystemProps<ErmisChatGenerics>>;
  /**
   * UI component for MessageTimestamp
   * Defaults to: [MessageTimestamp]
   */
  MessageTimestamp: React.ComponentType<MessageTimestampProps>;
  /**
   * UI component for OverlayReactionList
   */
  OverlayReactionList: React.ComponentType<OverlayReactionListProps<ErmisChatGenerics>>;
  /**
   * UI component for ReactionList
   * Defaults to: [ReactionList]
   */
  ReactionList: React.ComponentType<ReactionListProps<ErmisChatGenerics>>;
  removeMessage: (message: { id: string; parent_id?: string }) => void;
  /**
   * UI component for Reply
   * Defaults to: [Reply](https://
   */
  Reply: React.ComponentType<ReplyProps<ErmisChatGenerics>>;
  /**
   * Override the api request for retry message functionality.
   */
  retrySendMessage: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /**
   * UI component for ScrollToBottomButton
   * Defaults to: [ScrollToBottomButton](https://
   */
  ScrollToBottomButton: React.ComponentType<ScrollToBottomButtonProps>;
  sendReaction: (type: string, messageId: string) => Promise<void>;
  setEditingState: (message?: MessageType<ErmisChatGenerics>) => void;
  setQuotedMessageState: (message: MessageType<ErmisChatGenerics> | boolean) => void;
  supportedReactions: ReactionData[];
  /**
   * UI component for TypingIndicator
   * Defaults to: [TypingIndicator](https://
   */
  TypingIndicator: React.ComponentType;
  /**
   * UI component for TypingIndicatorContainer
   * Defaults to: [TypingIndicatorContainer](https://
   */
  TypingIndicatorContainer: React.ComponentType<TypingIndicatorContainerProps>;
  updateMessage: (
    updatedMessage: MessageResponse<ErmisChatGenerics>,
    extraState?: {
      commands?: SuggestionCommand<ErmisChatGenerics>[];
      messageInput?: string;
      threadMessages?: ChannelState<ErmisChatGenerics>['threads'][string];
    },
  ) => void;
  /**
   * Custom UI component to display enriched url preview.
   * Defaults to https://github.com/
   */
  UrlPreview: React.ComponentType<CardProps<ErmisChatGenerics>>;
  VideoThumbnail: React.ComponentType<VideoThumbnailProps>;
  /**
   * Provide any additional props for `TouchableOpacity` which wraps inner MessageContent component here.
   * Please check docs for TouchableOpacity for supported props - https://reactnative.dev/docs/touchableopacity#props
   *
   * @overrideType Object
   */
  additionalTouchableProps?: Omit<TouchableOpacityProps, 'style'>;
  /**
   * Custom UI component to override default cover (between Header and Footer) of Card component.
   * Accepts the same props as Card component.
   */
  CardCover?: React.ComponentType<CardProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to override default Footer of Card component.
   * Accepts the same props as Card component.
   */
  CardFooter?: React.ComponentType<CardProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to override default header of Card component.
   * Accepts the same props as Card component.
   */
  CardHeader?: React.ComponentType<CardProps<ErmisChatGenerics>>;

  /**
   * Full override of the delete message button in the Message Actions
   *
   * Please check [cookbook]
   */

  /** Control if the deleted message is visible to both the send and reciever, either of them or none  */
  deletedMessagesVisibilityType?: DeletedMessagesVisibilityType;

  disableTypingIndicator?: boolean;

  /**
   * Whether messages should be aligned to right or left part of screen.
   * By default, messages will be received messages will be aligned to left and
   * sent messages will be aligned to right.
   */
  forceAlignMessages?: Alignment | boolean;
  getMessagesGroupStyles?: typeof getGroupStyles;
  handleBlock?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when a copy message action is invoked */
  handleCopy?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when a delete message action is invoked */
  handleDelete?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when an edit message action is invoked */
  handleEdit?: (message: MessageType<ErmisChatGenerics>) => void;
  /** Handler to access when a flag message action is invoked */
  handleFlag?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when a mute user action is invoked */
  handleMute?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when a pin/unpin user action is invoked*/
  handlePinMessage?: ((message: MessageType<ErmisChatGenerics>) => MessageActionType) | null;
  /** Handler to access when a quoted reply action is invoked */
  handleQuotedReply?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to process a reaction */
  handleReaction?: (
    message: MessageType<ErmisChatGenerics>,
    reactionType: string,
  ) => Promise<void>;
  /** Handler to access when a retry action is invoked */
  handleRetry?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to access when a thread reply action is invoked */
  handleThreadReply?: (message: MessageType<ErmisChatGenerics>) => Promise<void>;
  /** Handler to deal with custom memoization logic of Attachment */
  isAttachmentEqual?: (
    prevAttachment: Attachment<ErmisChatGenerics>,
    nextAttachment: Attachment<ErmisChatGenerics>,
  ) => boolean;
  legacyImageViewerSwipeBehaviour?: boolean;
  /** Object specifying rules defined within simple-markdown https://github.com/Khan/simple-markdown#adding-a-simple-extension */
  markdownRules?: MarkdownRules;
  /**
   * Use this prop to override message actions (which pop-up in message overlay).
   *
   * You can either completely override the default messageActions object.
   *
   * ```
   * <Channel
   *   messageActions=[
   *     {
   *       action: () => { someAction() };
   *       title: "Pin Message";
   *       icon: PinIcon;
   *       titleStyle: {};
   *     },
   *     {
   *       action: () => { someAction() };
   *       title: "Delete Message";
   *       icon: PinIcon;
   *       titleStyle: {};
   *     }
   *   ]
   * >
   * </Channel>
   * ```
   *
   * Or you can selectly keep certain action and remove some:
   *
   * e.g. Lets say you only want to keep threadReply and copyMessage actions
   *
   * ```
   * <Channel
   *   messageActions={({
   *     blockUser,
   *     copyMessage,
   *     deleteMessage,
   *     editMessage,
   *     flagMessage,
   *     muteUser,
   *     quotedReply,
   *     retry,
   *     threadReply,
   *   }) => ([
   *     threadReply, copyMessage
   *   ])}
   * >
   *  </Channel>
   *  ```
   *
   * @overrideType Function | Array<Objects>
   */
  messageActions?: (param: MessageActionsParams<ErmisChatGenerics>) => MessageActionType[];
  /**
   * Custom message header component
   */
  MessageHeader?: React.ComponentType<MessageFooterProps<ErmisChatGenerics>>;
  /** Custom UI component for message text */
  MessageText?: React.ComponentType<MessageTextProps<ErmisChatGenerics>>;

  /**
   * Theme provided only to messages that are the current users
   */
  myMessageTheme?: DeepPartial<Theme>;
  /**
   * Override default handler for onLongPress on message. You have access to payload of that handler as param:
   *
   * ```
   * <Channel
   *  onLongPressMessage={({
   *    actionHandlers: {
   *        deleteMessage, // () => Promise<void>;
   *        editMessage, // () => void;
   *        quotedReply, // () => void;
   *        resendMessage, // () => Promise<void>;
   *        showMessageOverlay, // () => void;
   *        toggleBanUser, // () => Promise<void>;
   *        toggleMuteUser, // () => Promise<void>;
   *        toggleReaction, // (reactionType: string) => Promise<void>;
   *    },
   *    defaultHandler, // () => void
   *    event, // any event object corresponding to touchable feedback
   *    emitter, // which component trigged this touchable feedback e.g. card, fileAttachment, gallery, message ... etc
   *    message // message object on which longPress occured
   *  }) => {
   *    // Your custom action
   *  }}
   * />
   * ```
   */
  onLongPressMessage?: (payload: MessageTouchableHandlerPayload<ErmisChatGenerics>) => void;
  /**
   * Add onPressIn handler for attachments. You have access to payload of that handler as param:
   *
   * ```
   * <Channel
   *  onPressInMessage={({
   *    actionHandlers: {
   *        deleteMessage, // () => Promise<void>;
   *        editMessage, // () => void;
   *        quotedReply, // () => void;
   *        resendMessage, // () => Promise<void>;
   *        showMessageOverlay, // () => void;
   *        toggleBanUser, // () => Promise<void>;
   *        toggleMuteUser, // () => Promise<void>;
   *        toggleReaction, // (reactionType: string) => Promise<void>;
   *    },
   *    defaultHandler, // () => void
   *    event, // any event object corresponding to touchable feedback
   *    emitter, // which component trigged this touchable feedback e.g. card, fileAttachment, gallery, message ... etc
   *    message // message object on which longPress occured
   *  }) => {
   *    // Your custom action
   *  }}
   * />
   * ```
   */
  onPressInMessage?: (payload: MessageTouchableHandlerPayload<ErmisChatGenerics>) => void;
  /**
   * Override onPress handler for message. You have access to payload of that handler as param:
   *
   * ```
   * <Channel
   *  onPressMessage={({
   *    actionHandlers: {
   *        deleteMessage, // () => Promise<void>;
   *        editMessage, // () => void;
   *        quotedReply, // () => void;
   *        resendMessage, // () => Promise<void>;
   *        showMessageOverlay, // () => void;
   *        toggleBanUser, // () => Promise<void>;
   *        toggleMuteUser, // () => Promise<void>;
   *        toggleReaction, // (reactionType: string) => Promise<void>;
   *    },
   *    defaultHandler, // () => void
   *    event, // any event object corresponding to touchable feedback
   *    emitter, // which component trigged this touchable feedback e.g. card, fileAttachment, gallery, message ... etc
   *    message // message object on which longPress occurred
   *  }) => {
   *    // Your custom action
   *  }}
   * />
   * ```
   */
  onPressMessage?: (payload: MessageTouchableHandlerPayload<ErmisChatGenerics>) => void;

  /**
   * Full override of the reaction function on Message and Message Overlay
   *
   * Please check [cookbook]
   * */
  selectReaction?: (
    message: MessageType<ErmisChatGenerics>,
  ) => (reactionType: string) => Promise<void>;

  targetedMessage?: string;
};

export const MessagesContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as MessagesContextValue,
);

export const MessagesProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  value,
}: PropsWithChildren<{
  value?: MessagesContextValue<ErmisChatGenerics>;
}>) => (
  <MessagesContext.Provider value={value as unknown as MessagesContextValue}>
    {children}
  </MessagesContext.Provider>
);

export const useMessagesContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    MessagesContext,
  ) as unknown as MessagesContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useMessagesContext hook was called outside of the MessagesContext provider. Make sure you have configured MessageList component correctly`
    );
  }

  return contextValue;
};

/**
 * @deprecated
 *
 * This will be removed in the next major version.
 *
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withMessagesContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withMessagesContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof MessagesContextValue<ErmisChatGenerics>>> => {
  const WithMessagesContextComponent = (
    props: Omit<P, keyof MessagesContextValue<ErmisChatGenerics>>,
  ) => {
    const messagesContext = useMessagesContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...messagesContext} />;
  };
  WithMessagesContextComponent.displayName = `WithMessagesContext${getDisplayName(Component)}`;
  return WithMessagesContextComponent;
};
