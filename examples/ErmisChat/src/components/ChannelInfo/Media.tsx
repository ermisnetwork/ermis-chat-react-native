import { Channel, Attachment } from 'ermis-chat-sdk';
import { ErmisChatGenerics } from '../../types';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from 'react-native';
import Dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { usePaginatedAttachments } from '../../hooks/usePaginatedAttachments';
import { DateHeader, Picture, useImageGalleryContext, useOverlayContext, useTheme } from 'ermis-chat-react-native';

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 8
    },
    contentContainer: { flexGrow: 1 },
    emptyContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    flex: { flex: 1 },
    noMedia: {
        fontSize: 16,
        paddingBottom: 8,
    },
    noMediaDetails: {
        fontSize: 14,
        textAlign: 'center',
    },
    stickyHeader: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 8, // DateHeader already has marginTop 8
    },
});

const screen = Dimensions.get('screen').width;

type MediaProps = {
    media: Attachment<ErmisChatGenerics>[];
    loading: boolean;
    loadMore: () => void;
}
export const Media: React.FC<MediaProps> = ({ media, loading, loadMore }) => {
    const {
        messages: images,
        setMessages: setImages,
        setSelectedMessage: setImage,
    } = useImageGalleryContext<ErmisChatGenerics>();
    const { setOverlay } = useOverlayContext();
    const {
        theme: {
            colors: { white },
        },
    } = useTheme();
    // useEffect(() => {
    //     console.log('media', media);
    // }, []);


    const channelImages = useRef(images);

    const [stickyHeaderDate, setStickyHeaderDate] = useState(
        Dayjs(media?.[0]?.created_at).format('MMM YYYY'),
    );
    const stickyHeaderDateRef = useRef('');

    const updateStickyDate = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems?.length) {
            const lastItem = viewableItems[0];

            const created_at = lastItem?.item?.created_at;

            if (
                created_at &&
                !lastItem.item.deleted_at &&
                Dayjs(created_at).format('MMM YYYY') !== stickyHeaderDateRef.current
            ) {
                stickyHeaderDateRef.current = Dayjs(created_at).format('MMM YYYY');
                const isCurrentYear = new Date(created_at).getFullYear() === new Date().getFullYear();
                setStickyHeaderDate(
                    isCurrentYear ? Dayjs(created_at).format('MMM') : Dayjs(created_at).format('MMM YYYY'),
                );
            }
        }
    });
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                data={media}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ListEmptyComponent={EmptyListComponent}
                numColumns={3}
                onEndReached={loadMore}
                onViewableItemsChanged={updateStickyDate.current}
                refreshing={loading}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                setImage({
                                    messageId: item.message_id,
                                    url: item.url || item.image_url,
                                });
                                setOverlay('gallery');
                            }}
                        >
                            <Image
                                source={{ uri: item.thumb_url || item.url || item.image_url }}
                                style={{
                                    height: screen / 3,
                                    margin: 1,
                                    width: screen / 3 - 2,
                                }}
                            />
                        </TouchableOpacity>
                    )
                }}
                style={styles.flex}
                viewabilityConfig={{
                    viewAreaCoveragePercentThreshold: 50,
                }}
            />
            {media && media.length ? (
                <View style={styles.stickyHeader}>
                    <DateHeader dateString={stickyHeaderDate} />
                </View>
            ) : null}
        </View>
    );
}
const EmptyListComponent = () => {
    const {
        theme: {
            colors: { black, grey, grey_gainsboro },
        },
    } = useTheme();
    return (
        <View style={styles.emptyContainer}>
            <Picture fill={grey_gainsboro} scale={6} />
            <Text style={[styles.noMedia, { color: black }]}>No media</Text>
            <Text style={[styles.noMediaDetails, { color: grey }]}>
                Photos or video sent in this chat will appear here
            </Text>
        </View>
    );
};