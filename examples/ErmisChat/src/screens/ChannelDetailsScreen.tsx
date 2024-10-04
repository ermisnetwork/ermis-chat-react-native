import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StackNavigatorParamList } from '../types';
import { RouteProp } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useAppOverlayContext } from '../context/AppOverlayContext';
import { useBottomSheetOverlayContext } from '../context/BottomSheetOverlayContext';
import { useTheme, ChannelAvatar, useChannelPreviewDisplayName } from 'ermis-chat-react-native';
import { Mute } from '../icons/Mute';
import { Search } from '../icons/Search';
import { LogOut } from '../icons/LogOut';
import { SceneMap, TabView } from 'react-native-tab-view';
import type { Channel, UserResponse } from 'ermis-chat-sdk';
import { Member } from '../components/ChannelInfo/Member';
import { Media } from '../components/ChannelInfo/Media';
import { Files } from '../components/ChannelInfo/Files';
import { usePaginatedAttachments } from '../hooks/usePaginatedAttachments';
import { BackButton, ScreenHeader } from '../components/ScreenHeader';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    backButton: {
        position: 'absolute',
        left: 8,
        top: 8,
        zIndex: 1,
    },
    userInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    displayName: {
        fontSize: 16,
        fontWeight: '600',
        paddingTop: 16,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        alignItems: 'center',
        width: '60%',
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 8,
        height: 46,
        justifyContent: 'center',
        width: 54,
        // paddingVertical: 16
    },
    actionTitle: {
        fontSize: 10,
        paddingTop: 4,
        lineHeight: 15,
        alignContent: 'center',
        fontWeight: '400',
        color: '#979797'
    },
    tabViewContainer: {
        flex: 1,
        marginTop: 56,
    }
});

type ChannelDetailsScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'ChannelDetailsScreen'>;
type ChannelDetailsScreenRouteProp = RouteProp<StackNavigatorParamList, 'ChannelDetailsScreen'>;
type ChannelDetailsScreenProps = {
    navigation: ChannelDetailsScreenNavigationProp;
    route: ChannelDetailsScreenRouteProp;
};

export const ChannelDetailsScreen: React.FC<ChannelDetailsScreenProps> = ({
    navigation,
    route: {
        params: { channel },
    },
}) => {
    const {
        theme: {
            colors: { accent_green, accent_red, black, border, grey, white, white_smoke },
        },
    } = useTheme();
    const { chatClient } = useAppContext();
    const { setOverlay } = useAppOverlayContext();
    const { setData } = useBottomSheetOverlayContext();
    const displayName = useChannelPreviewDisplayName(channel, 20);
    const { loading, loadMore, files, media } = usePaginatedAttachments(channel);

    const [index, setIndex] = React.useState(0);

    const [routes] = React.useState([
        { key: 'members', title: 'Members' },
        { key: 'media', title: 'Media' },
        { key: 'files', title: 'Files' },
    ]);

    const renderScene = SceneMap({
        members: () => { return <Member channel={channel} /> },
        media: () => { return <Media media={media} loadMore={loadMore} loading={loading} /> },
        files: () => { return <Files files={files} loadMore={loadMore} loading={loading} /> },
    });


    if (!channel) {
        return null;
    }

    return (
        <SafeAreaView style={[{ backgroundColor: white }, styles.container]}>
            <View style={styles.userInfoContainer}>
                <View style={styles.backButton}>
                    <BackButton />
                </View>
                <ChannelAvatar channel={channel} size={59} />
                <Text style={[styles.displayName, {
                    color: black,
                }]}>{displayName}</Text>
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Mute height={24} width={24} />
                        <Text style={styles.actionTitle}>Mute</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Search height={24} width={24} fill={'#979797'} />
                        <Text style={styles.actionTitle}>Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <LogOut height={24} width={24} />
                        <Text style={styles.actionTitle}>Leave</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                // renderTabBar={renderTabBar}
                />
            </View>
        </SafeAreaView>
    )
};