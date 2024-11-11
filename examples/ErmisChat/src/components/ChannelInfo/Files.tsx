import { Channel, Attachment } from 'ermis-chat-sdk';
import { ErmisChatGenerics } from '../../types';
import {
    Dimensions,
    FlatList,
    Image,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from 'react-native';
import Dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { usePaginatedAttachments } from '../../hooks/usePaginatedAttachments';
import { DateHeader, FileIcon, getFileSizeDisplayText, Picture, ThemeProvider, useImageGalleryContext, useOverlayContext, useTheme } from 'ermis-chat-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File } from '../../icons/File';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: 12,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    details: {
        flex: 1,
        paddingLeft: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    flex: {
        flex: 1,
    },
    noFiles: {
        fontSize: 16,
        paddingBottom: 8,
    },
    noFilesDetails: {
        fontSize: 14,
        textAlign: 'center',
    },
    sectionContainer: {
        paddingBottom: 8,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionContentContainer: {
        flexGrow: 1,
    },
    sectionTitle: {
        fontSize: 14,
    },
    size: {
        fontSize: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        paddingBottom: 2,
    },
});


type FilesProps = {
    files: Attachment<ErmisChatGenerics>[];
    loading: boolean;
    loadMore: () => void;
}
export const Files: React.FC<FilesProps> = ({ files, loadMore, loading }) => {
    const {
        theme: {
            colors: { black, border, grey, white_snow },
        },
    } = useTheme();


    const [sections, setSections] = useState<
        Array<{
            data: Attachment<ErmisChatGenerics>[];
            title: string;
        }>
    >([]);

    useEffect(() => {
        const newSections: Record<
            string,
            {
                data: Attachment<ErmisChatGenerics>[];
                title: string;
            }
        > = {};

        files.forEach((file) => {
            const month = Dayjs(file.created_at).format('MMM YYYY');
            if (!newSections[month]) {
                newSections[month] = {
                    data: [],
                    title: month,
                };
            }

            newSections[month].data.push(file);
        });

        setSections(Object.values(newSections));
    }, [files]);
    return (
        <ThemeProvider>
            {(sections.length > 0 || !loading) && (
                <SectionList<Attachment<ErmisChatGenerics>>
                    contentContainerStyle={styles.sectionContentContainer}
                    ListEmptyComponent={EmptyListComponent}
                    onEndReached={loadMore}
                    renderItem={({ index, item: attachment, section }) => (
                        <TouchableOpacity
                            key={`${attachment.id}`}
                            onPress={() => console.log(attachment.url)}
                            style={{
                                borderBottomColor: border,
                                borderBottomWidth: index === section.data.length - 1 ? 0 : 1,
                            }}
                        >
                            <View style={[styles.container, { backgroundColor: white_snow }]}>
                                <FileIcon mimeType={attachment.content_type} />
                                <View style={styles.details}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.title,
                                            {
                                                color: black,
                                            },
                                        ]}
                                    >
                                        {attachment.file_name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.size,
                                            {
                                                color: grey,
                                            },
                                        ]}
                                    >
                                        {getFileSizeDisplayText(attachment.content_length)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View
                            style={[
                                styles.sectionContainer,
                                {
                                    backgroundColor: white_snow,
                                },
                            ]}
                        >
                            <Text style={[styles.sectionTitle, { color: black }]}>{title}</Text>
                        </View>
                    )}
                    sections={sections}
                    stickySectionHeadersEnabled
                />
            )}
        </ThemeProvider>
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
            <File fill={grey_gainsboro} scale={6} />
            <Text style={[styles.noFiles, { color: black }]}>No files</Text>
            <Text style={[styles.noFilesDetails, { color: grey }]}>
                Files sent on this chat will appear here.
            </Text>
        </View>
    );
};
