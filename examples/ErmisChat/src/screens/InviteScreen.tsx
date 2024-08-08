
import React, { useRef, useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native"
import { ErmisChatGenerics, StackNavigatorParamList } from "../types"
import { StackNavigationProp } from "@react-navigation/stack";
import { ChatScreenHeader } from '../components/ChatScreenHeader';
import { useAppContext } from "../context/AppContext";
import { useTheme, ChannelList, CircleClose, Search } from 'ermis-chat-react-native';
import { Channel } from 'ermis-chat-sdk';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { ScreenHeader } from "../components/ScreenHeader";
import type { ChannelSort } from 'ermis-chat-sdk';
import { InviteChannelPreview } from "../components/InviteChannelPreview";

const styles = StyleSheet.create({
    invitesContainer: {
        height: '100%',
        position: 'absolute',
        width: '100%',
    },
    emptyIndicatorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyIndicatorText: { paddingTop: 28 },
    flex: {
        flex: 1,
    },
});
const baseFilters = {
    type: null,
    roles: ['pending'],
};
const sort: ChannelSort<ErmisChatGenerics> = {};
const options = {
    presence: true,
    state: true,
    watch: true,
};
// export type InviteScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'InviteScreen'>;
// export type InviteScreenProps = {
//     navigation: InviteScreenNavigationProp;
// };
export const InviteScreen: React.FC = () => {
    const { chatClient } = useAppContext();
    const navigation = useNavigation();
    const {
        theme: {
            colors: { black, grey, grey_gainsboro, grey_whisper, white, white_snow },
        },
    } = useTheme();
    const scrollRef = useRef<FlatList<Channel<ErmisChatGenerics>> | null>(null);
    const chatClientUserId = chatClient?.user?.id;
    const filters = useMemo(
        () => ({
            ...baseFilters,
        }),
        [chatClientUserId],
    );

    useScrollToTop(scrollRef);
    const setScrollRef = (ref: React.RefObject<FlatList<Channel<ErmisChatGenerics>> | null>) => {
        scrollRef.current = ref;
    };

    if (!chatClient) {
        return null;
    }
    return (<View

        style={[
            styles.flex,
            {
                backgroundColor: white_snow,
            },
        ]}>
        <ChatScreenHeader title="Invites" />
        <View style={{ flex: 1 }}>
            <ChannelList<ErmisChatGenerics>
                additionalFlatListProps={{
                    getItemLayout: (_, index) => ({
                        index,
                        length: 65,
                        offset: 65 * index,
                    }),
                    keyboardDismissMode: 'on-drag',
                }}
                filters={filters}
                HeaderNetworkDownIndicator={() => null}
                maxUnreadCount={99}
                onSelect={(channel) => {
                    navigation.navigate('ChannelScreen', {
                        channel,
                    });
                }}
                onAccept={(channel) => {
                    console.log('onAccept', channel);
                    // đang chưa nhận được event
                    navigation.navigate('ChannelScreen', {
                        channel,
                    });
                }}
                options={options}
                Preview={InviteChannelPreview}
                setFlatListRef={setScrollRef}
                sort={sort}
                type="invite"
            />
        </View>
    </View>)
}