import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ChatScreenHeader } from "../components/ChatScreenHeader";
import { UserSearchResults } from '../components/UserSearch/UserSearchResults';
import { useAppContext } from '../context/AppContext';
import { useUserSearchContext } from '../context/UserSearchContext';
import type { Channel, ChannelSort, ContactResult, UserResponse } from 'ermis-chat-sdk';
import type { ErmisChatGenerics, StackNavigatorParamList } from '../types';
import { ScreenHeader } from "../components/ScreenHeader";
import { Avatar, ChannelList, useTheme, MessagingChannelPreview, InvitedChannelPreview } from "ermis-chat-react-native";
import { Search } from "../icons/Search";
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { GoForward } from "../icons/GoForward";
import { useNavigation, useScrollToTop } from "@react-navigation/native";
import { usePaginatedSearchedMessages } from "../hooks/usePaginatedSearchedMessages";
dayjs.extend(calendar);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    absolute: { position: 'absolute' },
    emptyResultIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 28,
    },
    emptyResultIndicatorText: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 28,
    },
    flex: { flex: 1 },
    gradient: {
        height: 24,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    matches: { fontSize: 12 },
    searchResultContainer: {
        alignItems: 'center',
        borderBottomWidth: 1,
        flexDirection: 'row',
        paddingLeft: 8,
        paddingRight: 16,
        paddingVertical: 12,
    },
    searchResultUserDetails: {
        flex: 1,
        paddingLeft: 8,
    },
    searchResultUserLastOnline: { fontSize: 12 },
    searchResultUserName: { fontSize: 14, fontWeight: '700' },
    sectionHeader: {
        fontSize: 14.5,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
});

const baseFilters = {
    type: ["messaging"],
    roles: ["owner", "moder", "member"],
};
const sort: ChannelSort<ErmisChatGenerics> = {};
const options = {
    presence: true,
    state: true,
    watch: true,
};
export const ContactsScreen: React.FC = () => {
    const { chatClient } = useAppContext();
    const navigation = useNavigation();


    const {
        theme: {
            colors: { black, grey, grey_gainsboro, grey_whisper, white, white_snow },
        },
    } = useTheme();
    const searchInputRef = useRef<TextInput | null>(null);
    const scrollRef = useRef<FlatList<Channel<ErmisChatGenerics>> | null>(null);

    const [searchInputText, setSearchInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <View style={styles.container}>
            <ScreenHeader titleText="Contacts" LeftContent={() => <></>} />
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
                options={options}
                // Preview={InvitedChannelPreview}
                setFlatListRef={setScrollRef}
                sort={sort}
                type='messenger'
                sectionList
            />
        </View>
    )
}