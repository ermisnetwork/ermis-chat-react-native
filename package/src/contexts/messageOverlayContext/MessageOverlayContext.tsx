import React, { PropsWithChildren, useContext } from 'react';

import type { ImageProps } from 'react-native';

import type { Attachment, TranslationLanguages } from 'ermis-chat-sdk';

import { useResettableState } from './hooks/useResettableState';

import type { GroupType, MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { MessageActionListProps } from '../../components/MessageOverlay/MessageActionList';
import type {
  MessageActionListItemProps,
  MessageActionType,
} from '../../components/MessageOverlay/MessageActionListItem';
import type { OverlayReactionListProps } from '../../components/MessageOverlay/OverlayReactionList';
import type { OverlayReactionsProps } from '../../components/MessageOverlay/OverlayReactions';
import type { OverlayReactionsAvatarProps } from '../../components/MessageOverlay/OverlayReactionsAvatar';
import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import type { ReactionData } from '../../utils/utils';
import type { ChatContextValue } from '../chatContext/ChatContext';
import type { Alignment, MessageContextValue } from '../messageContext/MessageContext';
import type { MessagesContextValue } from '../messagesContext/MessagesContext';
import type { OwnCapabilitiesContextValue } from '../ownCapabilitiesContext/OwnCapabilitiesContext';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type MessageOverlayData<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  alignment?: Alignment;
  chatContext?: ChatContextValue<ErmisChatGenerics>;
  clientId?: string;
  files?: Attachment<ErmisChatGenerics>[];
  groupStyles?: GroupType[];
  handleReaction?: (reactionType: string) => Promise<void>;
  ImageComponent?: React.ComponentType<ImageProps>;
  images?: Attachment<ErmisChatGenerics>[];
  message?: MessageType<ErmisChatGenerics>;
  messageActions?: MessageActionType[];
  messageContext?: MessageContextValue<ErmisChatGenerics>;
  messageReactionTitle?: string;
  messagesContext?: MessagesContextValue<ErmisChatGenerics>;
  onlyEmojis?: boolean;
  otherAttachments?: Attachment<ErmisChatGenerics>[];
  OverlayReactionList?: React.ComponentType<OverlayReactionListProps<ErmisChatGenerics>>;
  ownCapabilities?: OwnCapabilitiesContextValue;
  supportedReactions?: ReactionData[];
  threadList?: boolean;
  userLanguage?: TranslationLanguages;
  videos?: Attachment<ErmisChatGenerics>[];
};

export type MessageOverlayContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  /**
   * Custom UI component for rendering [message actions]
   *
   * **Default** [MessageActionList]
   */
  MessageActionList: React.ComponentType<MessageActionListProps<ErmisChatGenerics>>;
  MessageActionListItem: React.ComponentType<MessageActionListItemProps<ErmisChatGenerics>>;
  /**
   * Custom UI component for rendering [reaction selector]
   *
   * **Default** [OverlayReactionList]
   */
  OverlayReactionList: React.ComponentType<OverlayReactionListProps<ErmisChatGenerics>>;
  /**
   * Custom UI component for rendering [reactions list]
   *
   * **Default** [OverlayReactions]
   */
  OverlayReactions: React.ComponentType<OverlayReactionsProps<ErmisChatGenerics>>;
  OverlayReactionsAvatar: React.ComponentType<OverlayReactionsAvatarProps>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<MessageOverlayData<ErmisChatGenerics>>>;
  data?: MessageOverlayData<ErmisChatGenerics>;
};

export const MessageOverlayContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as MessageOverlayContextValue,
);

export const MessageOverlayProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  value,
}: PropsWithChildren<{
  value?: MessageOverlayContextValue<ErmisChatGenerics>;
}>) => {
  const messageOverlayContext = useResettableState(value);
  return (
    <MessageOverlayContext.Provider
      value={messageOverlayContext as unknown as MessageOverlayContextValue}
    >
      {children}
    </MessageOverlayContext.Provider>
  );
};

export const useMessageOverlayContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    MessageOverlayContext,
  ) as unknown as MessageOverlayContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useMessageOverlayContext hook was called outside the MessageOverlayContext Provider. Make sure you have configured OverlayProvider component correctly`,
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
 * typing is desired while using the HOC withMessageOverlayContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withMessageOverlayContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof MessageOverlayContextValue<ErmisChatGenerics>>> => {
  const WithMessageOverlayContextComponent = (
    props: Omit<P, keyof MessageOverlayContextValue<ErmisChatGenerics>>,
  ) => {
    const messageContext = useMessageOverlayContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...messageContext} />;
  };
  WithMessageOverlayContextComponent.displayName = `WithMessageOverlayContext${getDisplayName(
    Component,
  )}`;
  return WithMessageOverlayContextComponent;
};
