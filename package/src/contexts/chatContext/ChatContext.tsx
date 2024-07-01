import React, { PropsWithChildren, useContext } from 'react';
import type { ImageProps } from 'react-native';

import type { AppSettingsAPIResponse, Channel, Mute, ErmisChat } from 'ermis-chat-sdk-test';

import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type ChatContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  /**
   * Object of application settings returned from Stream.
   * */
  appSettings: AppSettingsAPIResponse<ErmisChatGenerics> | null;
  /**
   * The ErmisChat client object
   *
   * ```
   * import { ErmisChat } from 'ermis-chat-sdk-test';
   * import { Chat } from 'stream-chat-react-native';
   *
   * const client = ErmisChat.getInstance('api_key);
   * await client.connectUser('user_id', 'userToken');
   *
   * <Chat client={client}>
   * </Chat>
   * ```
   *
   * @overrideType ErmisChat
   * */
  client: ErmisChat<ErmisChatGenerics>;
  connectionRecovering: boolean;
  enableOfflineSupport: boolean;
  /**
   * Drop in replacement of all the underlying Image components within SDK. This is useful for the purpose of offline caching of images. Please check the Offline Support Guide for usage.
   */
  ImageComponent: React.ComponentType<ImageProps>;
  isOnline: boolean | null;
  mutedUsers: Mute<ErmisChatGenerics>[];
  /**
   * @param newChannel Channel to set as active.
   *
   * @overrideType Function
   */
  setActiveChannel: (newChannel?: Channel<ErmisChatGenerics>) => void;
  /**
   * Instance of channel object from stream-chat package.
   *
   * Please check the docs around how to create or query channel - https://getstream.io/chat/docs/javascript/creating_channels/?language=javascript
   *
   * ```
   * import { ErmisChat, Channel } from 'ermis-chat-sdk-test';
   * import { Chat, Channel} from 'stream-chat-react-native';
   *
   * const client = ErmisChat.getInstance('api_key');
   * await client.connectUser('user_id', 'user_token');
   * const channel = client.channel('messaging', 'channel_id');
   * await channel.watch();
   * ```
   *
   * @overrideType Channel
   */
  channel?: Channel<ErmisChatGenerics>;
  /**
   * This option allows you to specify a list of CDNs that offer image resizing.
   */
  resizableCDNHosts?: string[];
};

export const ChatContext = React.createContext(DEFAULT_BASE_CONTEXT_VALUE as ChatContextValue);

export const ChatProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  value,
}: PropsWithChildren<{
  value?: ChatContextValue<ErmisChatGenerics>;
}>) => (
  <ChatContext.Provider value={value as unknown as ChatContextValue}>
    {children}
  </ChatContext.Provider>
);

export const useChatContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(ChatContext) as unknown as ChatContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useChatContext hook was called outside the ChatContext Provider. Make sure you have configured Chat component correctly - https://getstream.io/chat/docs/sdk/reactnative/basics/hello_stream_chat/#chat`,
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
 * typing is desired while using the HOC withChatContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChatContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof ChatContextValue<ErmisChatGenerics>>> => {
  const WithChatContextComponent = (props: Omit<P, keyof ChatContextValue<ErmisChatGenerics>>) => {
    const chatContext = useChatContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...chatContext} />;
  };
  WithChatContextComponent.displayName = `WithChatContext${getDisplayName(Component)}`;
  return WithChatContextComponent;
};
