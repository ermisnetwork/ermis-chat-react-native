import React, { useEffect, useRef, useState } from 'react';
// RNGR's FlatList ist currently breaking the pull-to-refresh behaviour on Android
// See https://github.com/software-mansion/react-native-gesture-handler/issues/598
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import type { Channel } from 'ermis-chat-sdk';

import {
    ChannelsContextValue,
    useChannelsContext,
} from '../../contexts/channelsContext/ChannelsContext';
import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useDebugContext } from '../../contexts/debugContext/DebugContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { InvitedChannelPreview } from '../ChannelPreview/InvitedChannelPreview';

const styles = StyleSheet.create({
    flatList: { flex: 1 },
    flatListContentContainer: { flexGrow: 1 },
    statusIndicator: { left: 0, position: 'absolute', right: 0, top: 0 },
});

export type InvitedChannelListMessengerPropsWithContext<
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Omit<
    ChannelsContextValue<ErmisChatGenerics>,
    | 'HeaderErrorIndicator'
    | 'HeaderNetworkDownIndicator'
    | 'maxUnreadCount'
    | 'numberOfSkeletons'
    | 'onSelect'
    | 'Preview'
    | 'PreviewTitle'
    | 'PreviewAvatar'
    | 'Skeleton'
>;

const StatusIndicator = <
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
    const { isOnline } = useChatContext<ErmisChatGenerics>();
    const { error, HeaderErrorIndicator, HeaderNetworkDownIndicator, loadingChannels, refreshList } =
        useChannelsContext<ErmisChatGenerics>();

    if (loadingChannels) return null;

    if (!isOnline) {
        return (
            <View style={styles.statusIndicator}>
                <HeaderNetworkDownIndicator />
            </View>
        );
    } else if (error) {
        return (
            <View style={styles.statusIndicator}>
                <HeaderErrorIndicator onPress={refreshList} />
            </View>
        );
    }
    return null;
};

const renderItem = <
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
    item,
}: {
    item: Channel<ErmisChatGenerics>;
}) => <InvitedChannelPreview<ErmisChatGenerics> channel={item} />;

const keyExtractor = <
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
    item: Channel<ErmisChatGenerics>,
) => item.cid;

const InvitedChannelListMessengerWithContext = <
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
    props: InvitedChannelListMessengerPropsWithContext<ErmisChatGenerics>,
) => {
    const onEndReachedCalledDuringCurrentScrollRef = useRef<boolean>(false);
    const {
        additionalFlatListProps,
        channels,
        EmptyStateIndicator,
        error,
        forceUpdate,
        hasNextPage,
        ListHeaderComponent,
        loadingChannels,
        LoadingErrorIndicator,
        LoadingIndicator,
        loadMoreThreshold,
        loadNextPage,
        refreshing,
        refreshList,
        reloadList,
        setFlatListRef,
    } = props;

    const {
        theme: {
            channelListMessenger: { flatList, flatListContent },
            colors: { white_snow },
        },
    } = useTheme();

    /**
     * In order to prevent the EmptyStateIndicator component from showing up briefly on mount,
     * we set the loading state one cycle behind to ensure the channels are set before the
     * change to loadingChannels is registered.
     */
    const [loading, setLoading] = useState(true);
    const debugRef = useDebugContext();

    useEffect(() => {
        if (!!loadingChannels !== loading) {
            setLoading(!!loadingChannels);
        }
    }, [loading, loadingChannels]);

    const isDebugModeEnabled = __DEV__ && debugRef && debugRef.current;

    if (isDebugModeEnabled) {
        if (debugRef.current.setEventType) debugRef.current.setEventType('send');
        if (debugRef.current.setSendEventParams)
            debugRef.current.setSendEventParams({
                action: 'Channels',
                data: channels?.map((channel) => ({
                    data: channel.data,
                    members: channel.state.members,
                })),
            });
    }

    if (error && !refreshing && !loadingChannels && channels === null) {
        return (
            <LoadingErrorIndicator
                error={error}
                listType='channel'
                loadNextPage={loadNextPage}
                retry={reloadList}
            />
        );
    }

    const onEndReached = () => {
        if (!onEndReachedCalledDuringCurrentScrollRef.current && hasNextPage) {
            // TODO: Khoakheu need to set flag to pagination
            // loadNextPage();

            onEndReachedCalledDuringCurrentScrollRef.current = true;
        }
    };

    if (loadingChannels) {
        return <LoadingIndicator listType='channel' />;
    }

    return (
        <>
            <FlatList
                contentContainerStyle={[
                    styles.flatListContentContainer,
                    { backgroundColor: white_snow },
                    flatListContent,
                ]}
                data={channels}
                extraData={forceUpdate}
                keyExtractor={keyExtractor}
                ListEmptyComponent={
                    loading ? (
                        <LoadingIndicator listType='channel' />
                    ) : (
                        <EmptyStateIndicator listType='channel' />
                    )
                }
                ListHeaderComponent={ListHeaderComponent}
                onEndReached={onEndReached}
                onEndReachedThreshold={loadMoreThreshold}
                onMomentumScrollBegin={() => (onEndReachedCalledDuringCurrentScrollRef.current = false)}
                ref={setFlatListRef}
                refreshControl={<RefreshControl onRefresh={refreshList} refreshing={refreshing} />}
                renderItem={renderItem}
                style={[styles.flatList, { backgroundColor: white_snow }, flatList]}
                testID='invited-channel-list-messenger'
                {...additionalFlatListProps}
            />
            <StatusIndicator<ErmisChatGenerics> />
        </>
    );
};

export type InvitedChannelListMessengerProps<
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<InvitedChannelListMessengerPropsWithContext<ErmisChatGenerics>>;

/**
 * This UI component displays the preview list of channels and handles Channel navigation. It
 * receives all props from the ChannelList component.
 *
 * @example ./InvitedChannelListMessenger.md
 */
export const InvitedChannelListMessenger = <
    ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
    props: InvitedChannelListMessengerProps<ErmisChatGenerics>,
) => {
    const {
        additionalFlatListProps,
        channels,
        EmptyStateIndicator,
        error,
        FooterLoadingIndicator,
        forceUpdate,
        hasNextPage,
        ListHeaderComponent,
        loadingChannels,
        LoadingErrorIndicator,
        LoadingIndicator,
        loadingNextPage,
        loadMoreThreshold,
        loadNextPage,
        refreshing,
        refreshList,
        reloadList,
        setFlatListRef,
    } = useChannelsContext<ErmisChatGenerics>();

    return (
        <InvitedChannelListMessengerWithContext
            {...{
                additionalFlatListProps,
                channels,
                EmptyStateIndicator,
                error,
                FooterLoadingIndicator,
                forceUpdate,
                hasNextPage,
                ListHeaderComponent,
                loadingChannels,
                LoadingErrorIndicator,
                LoadingIndicator,
                loadingNextPage,
                loadMoreThreshold,
                loadNextPage,
                refreshing,
                refreshList,
                reloadList,
                setFlatListRef,
            }}
            {...props}
        />
    );
};

InvitedChannelListMessenger.displayName = 'InvitedChannelListMessenger{channelListMessenger}';
