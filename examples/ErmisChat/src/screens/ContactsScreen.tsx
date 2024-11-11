import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAppContext } from '../context/AppContext';
import { useUserSearchContext } from '../context/UserSearchContext';
import type { Channel, ChannelSort, UserResponse } from 'ermis-chat-sdk';
import type { ErmisChatGenerics, StackNavigatorParamList } from '../types';
import { ScreenHeader } from "../components/ScreenHeader";
import { Avatar, useTheme, useViewport, Right } from "ermis-chat-react-native";
import { Search } from "../icons/Search";
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { GoForward } from "../icons/GoForward";
import { useNavigation, useScrollToTop } from "@react-navigation/native";
import { usePaginatedSearchedMessages } from "../hooks/usePaginatedSearchedMessages";
import { StackNavigationProp } from "@react-navigation/stack";
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
export type ContactsScreenNavigationProp = StackNavigationProp<
    StackNavigatorParamList,
    'ContactsScreen'
>;

export type ContactsScreenProps = {
    navigation: ContactsScreenNavigationProp;
};
export const ContactsScreen: React.FC = () => {
    const { chatClient } = useAppContext();
    const navigation = useNavigation<ContactsScreenNavigationProp>();
    const {
        loading,
        loadMore,
        results: resultsContext,
        contacts,
        searchText,
        selectedUserIds,
        toggleUser,
        fetchContacts
    } = useUserSearchContext();
    const [sections, setSections] = useState<
        Array<{
            data: UserResponse<ErmisChatGenerics>[];
            title: string;
        }>
    >([]);
    const [visibleItemCount, setVisibleItemCount] = useState(2);
    const {
        theme: {
            colors: {
                accent_blue,
                bg_gradient_end,
                bg_gradient_start,
                black,
                border,
                grey,
                grey_gainsboro,
                white_smoke,
                white_snow,
            },
            ermisColors
        },
    } = useTheme();
    const colorScheme = useColorScheme();
    const { vw } = useViewport();

    const handleViewMore = () => {
        setVisibleItemCount(prevCount => prevCount + 2);
    };
    const contactsLength = contacts.length;

    useEffect(() => {
        const newSections: {
            [key: string]: {
                data: UserResponse<ErmisChatGenerics>[];
                title: string;
            };
        } = {};

        contacts.forEach((user) => {

            const initial = user.name ? user.name?.slice(0, 1).toUpperCase() : user.id.slice(0, 1).toUpperCase();

            if (!initial) {
                return;
            }

            if (!newSections[initial]) {
                newSections[initial] = {
                    data: [user],
                    title: initial,
                };
            } else {
                newSections[initial].data.push(user);
            }
        });

        setSections(Object.values(newSections).sort((a, b) => a.title.localeCompare(b.title)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactsLength]);
    useEffect(() => {

        if (contacts.length === 0) {
            fetchContacts();
        }
    }, []);
    const onNavigateToChat = async (userId: string) => {
        if (!userId) return;
        if (!chatClient?.user?.id) {
            return;
        }
        const members = [chatClient?.user?.id, userId];
        const channel = chatClient.channel('messaging', {
            members,
        });
        await channel.watch();
        navigation.replace('ChannelScreen', {
            channel
        });
    }
    return (
        <View style={styles.container}>
            <ScreenHeader titleText="Contacts" LeftContent={() => <></>} />
            <SectionList
                keyboardDismissMode='interactive'
                keyboardShouldPersistTaps='handled'
                // eslint-disable-next-line react/no-unstable-nested-components
                ListEmptyComponent={() => (
                    <View style={styles.emptyResultIndicator}>
                        <Search fill={grey_gainsboro} scale={5} />
                        <Text style={[{ color: grey }, styles.emptyResultIndicatorText]}>
                            {loading ? 'Loading...' : 'No user matches these keywords...'}
                        </Text>
                    </View>
                )}
                // style={{ flex: 1 }}
                onEndReached={loadMore}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onNavigateToChat(item.id)}
                        style={[
                            styles.searchResultContainer,
                            {
                                backgroundColor: white_snow,
                                borderBottomColor: border,
                            },
                        ]}
                    >
                        <Avatar image={item.avatar} name={item.name} size={40} id={item.id} />
                        <View style={styles.searchResultUserDetails}>
                            <Text
                                style={[
                                    styles.searchResultUserName,
                                    {
                                        color: black,
                                    },
                                ]}
                            >
                                {item.name || item.id}
                            </Text>

                            <Text
                                style={[
                                    styles.searchResultUserLastOnline,
                                    {
                                        color: grey,
                                    },
                                ]}
                            >
                                Last online {dayjs(item.last_active).calendar()}
                            </Text>

                        </View>
                        <Right />
                    </TouchableOpacity>
                )}
                renderSectionHeader={({ section: { title } }) => {
                    if (searchText) {
                        return null;
                    }

                    return (
                        <Text
                            key={title}
                            style={[
                                styles.sectionHeader,
                                {
                                    backgroundColor: white_smoke,
                                    color: grey,
                                },
                            ]}
                        >
                            {title}
                        </Text>
                    );
                }}
                sections={sections}
                stickySectionHeadersEnabled
            />
        </View>
    )
}