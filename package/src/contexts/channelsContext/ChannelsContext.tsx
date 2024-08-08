import React, { PropsWithChildren, useContext } from 'react';

import type { FlatListProps } from 'react-native';
import type { FlatList } from 'react-native-gesture-handler';

import type { Channel } from 'ermis-chat-sdk';

import type { HeaderErrorProps } from '../../components/ChannelList/ChannelListHeaderErrorIndicator';
import type { QueryChannels } from '../../components/ChannelList/hooks/usePaginatedChannels';
import type { ChannelAvatarProps } from '../../components/ChannelPreview/ChannelAvatar';
import type { ChannelPreviewMessageProps } from '../../components/ChannelPreview/ChannelPreviewMessage';
import type { ChannelPreviewMessengerProps } from '../../components/ChannelPreview/ChannelPreviewMessenger';
import type { ChannelPreviewStatusProps } from '../../components/ChannelPreview/ChannelPreviewStatus';
import type { ChannelPreviewTitleProps } from '../../components/ChannelPreview/ChannelPreviewTitle';
import type { ChannelPreviewUnreadCountProps } from '../../components/ChannelPreview/ChannelPreviewUnreadCount';
import type { EmptyStateProps } from '../../components/Indicators/EmptyStateIndicator';
import type { LoadingErrorProps } from '../../components/Indicators/LoadingErrorIndicator';
import type { LoadingProps } from '../../components/Indicators/LoadingIndicator';
import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';
import { ChannelPreviewInviteProps } from '../../components';

export type ChannelsContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  /**
   * Besides the existing default behavior of the ChannelListMessenger component, you can attach
   * additional props to the underlying React Native FlatList.
   *
   * You can find list of all the available FlatList props here - https://facebook.github.io/react-native/docs/flatlist#props
   *
   * **EXAMPLE:**
   *
   * ```
   * <ChannelListMessenger
   *  channels={channels}
   *  additionalFlatListProps={{ bounces: true }}
   * />
   * ```
   *
   * **Note:** Don't use `additionalFlatListProps` to access the FlatList ref, use `setFlatListRef`
   */
  additionalFlatListProps: Partial<FlatListProps<Channel<ErmisChatGenerics>>>;
  /**
   * Channels can be either an array of channels or a promise which resolves to an array of channels
   */
  channels: Channel<ErmisChatGenerics>[] | null;
  /**
   * Custom indicator to use when channel list is empty
   *
   * Default: [EmptyStateIndicator]
   * */
  EmptyStateIndicator: React.ComponentType<EmptyStateProps>;
  /**
   * Custom loading indicator to display at bottom of the list, while loading further pages
   *
   * Default: [ChannelListFooterLoadingIndicator]
   */
  FooterLoadingIndicator: React.ComponentType;
  /**
   * Incremental number change to force update the FlatList
   */
  forceUpdate: number;
  /**
   * Whether or not the FlatList has another page to render
   */
  hasNextPage: boolean;
  /**
   * Custom indicator to display error at top of list, if loading/pagination error occurs
   *
   * Default: [ChannelListHeaderErrorIndicator]
   */
  HeaderErrorIndicator: React.ComponentType<HeaderErrorProps>;
  /**
   * Custom indicator to display network-down error at top of list, if there is connectivity issue
   *
   * Default: [ChannelListHeaderNetworkDownIndicator]
   */
  HeaderNetworkDownIndicator: React.ComponentType;
  /**
   * Initial channels query loading state, triggers the LoadingIndicator
   */
  loadingChannels: boolean;
  /**
   * Custom indicator to use when there is error in fetching channels
   *
   * Default: [LoadingErrorIndicator]
   * */
  LoadingErrorIndicator: React.ComponentType<LoadingErrorProps>;
  /**
   * Custom loading indicator to use on Channel List
   *
   * */
  LoadingIndicator: React.ComponentType<Pick<LoadingProps, 'listType'>>;
  /**
   * Whether or not additional channels are being loaded, triggers the FooterLoadingIndicator
   */
  loadingNextPage: boolean;
  /**
   * The React Native FlatList threshold to fetch more data
   * @see See loadMoreThreshold [doc](https://facebook.github.io/react-native/docs/flatlist#onendreachedthreshold)
   * */
  loadMoreThreshold: number;
  /**
   * Loads the next page of `channels`, which is present as a required prop
   */
  loadNextPage: QueryChannels;
  /**
   * Max number to display within notification badge. Default: 255 and it cannot be higher than that for now due to backend limitations
   */
  maxUnreadCount: number;
  /**
   * Number of skeletons that should show when loading. Default: 6
   */
  numberOfSkeletons: number;
  /**
   * Custom UI component to display individual channel list items
   *
   * Default: [ChannelPreviewMessenger]
   */
  Preview: React.ComponentType<ChannelPreviewMessengerProps<ErmisChatGenerics>> | React.ComponentType<ChannelPreviewInviteProps<ErmisChatGenerics>>;
  /**
   * Triggered when the channel list is refreshing, displays a loading spinner at the top of the list
   */
  refreshing: boolean;
  /**
   * Function to refresh the channel list that is similar to `reloadList`, but it doesn't wipe out existing channels
   * from UI before loading the new ones
   */
  refreshList: () => void | Promise<void>;
  /**
   * Removes all the existing channels from UI and loads fresh channels
   * */
  reloadList: () => Promise<void>;
  // /**
  //  * Function to set the currently active channel, acts as a bridge between ChannelList and Channel components
  //  *
  //  * @param channel A channel object
  //  */
  // setActiveChannel?: (channel: Channel<ErmisChatGenerics>) => void;
  /**
   * Function to gain access to the inner FlatList ref
   *
   * **Example:**
   *
   * ```
   * <ChannelListMessenger
   *  setFlatListRef={(ref) => {
   *    // Use ref for your own good
   *  }}
   * ```
   */
  setFlatListRef: (ref: FlatList<Channel<ErmisChatGenerics>> | null) => void;
  /**
   * Custom UI component to display loading channel skeletons
   *
   * Default: [Skeleton]
   */
  Skeleton: React.ComponentType;
  /**
   * Error in channels query, if any
   */
  error?: Error;
  ListHeaderComponent?: React.ComponentType;
  /**
   * Function to set the currently active channel, acts as a bridge between ChannelList and Channel components
   *
   * @param channel A channel object
   */
  onSelect?: (channel: Channel<ErmisChatGenerics>) => void;
  /**
   * Custom UI component to render preview avatar.
   *
   * **Default** [ChannelAvatar]
   */
  PreviewAvatar?: React.ComponentType<ChannelAvatarProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to render preview of latest message on channel.
   *
   * **Default** [ChannelPreviewMessage]
   */
  PreviewMessage?: React.ComponentType<ChannelPreviewMessageProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to render muted status.
   *
   * **Default** [ChannelMutedStatus]
   */
  PreviewMutedStatus?: React.ComponentType;
  /**
   * Custom UI component to render preview avatar.
   *
   * **Default** [ChannelPreviewStatus]
   */
  PreviewStatus?: React.ComponentType<ChannelPreviewStatusProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to render preview avatar.
   *
   * **Default** [ChannelPreviewTitle]
   */
  PreviewTitle?: React.ComponentType<ChannelPreviewTitleProps<ErmisChatGenerics>>;
  /**
   * Custom UI component to render preview avatar.
   *
   * **Default** [ChannelPreviewUnreadCount]
   */
  PreviewUnreadCount?: React.ComponentType<ChannelPreviewUnreadCountProps<ErmisChatGenerics>>;
  /**
    * Function to set the currently invited channel.
    *
    */
  onAccept?: (channel: Channel<ErmisChatGenerics>) => void;
  onReject?: () => void;
  /**
   * Type of channel list to render.
   * 
   */
  type?: 'messenger' | 'invite';
};

export const ChannelsContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as ChannelsContextValue,
);

export const ChannelsProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  value,
}: PropsWithChildren<{
  value: ChannelsContextValue<ErmisChatGenerics>;
}>) => (
  <ChannelsContext.Provider value={value as unknown as ChannelsContextValue}>
    {children}
  </ChannelsContext.Provider>
);

export const useChannelsContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    ChannelsContext,
  ) as unknown as ChannelsContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useChannelsContext hook was called outside of the ChannelsContext provider. Make sure you have configured ChannelList component correctly`,
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
 * typing is desired while using the HOC withChannelsContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChannelsContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof ChannelsContextValue<ErmisChatGenerics>>> => {
  const WithChannelsContextComponent = (
    props: Omit<P, keyof ChannelsContextValue<ErmisChatGenerics>>,
  ) => {
    const channelsContext = useChannelsContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...channelsContext} />;
  };
  WithChannelsContextComponent.displayName = `WithChannelsContext${getDisplayName(Component)}`;
  return WithChannelsContextComponent;
};
