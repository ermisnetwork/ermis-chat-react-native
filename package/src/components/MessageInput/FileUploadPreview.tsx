import React, { useEffect, useRef, useState } from 'react';
import { FlatList, I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import dayjs from 'dayjs';

import { UploadProgressIndicator } from './UploadProgressIndicator';

import { ChatContextValue, useChatContext } from '../../contexts';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../contexts/messageInputContext/MessageInputContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../contexts/translationContext/TranslationContext';
import { Close } from '../../icons/Close';
import { Warning } from '../../icons/Warning';
import { isAudioPackageAvailable } from '../../native';
import type { DefaultErmisChatGenerics, FileUpload } from '../../types/types';
import { getTrimmedAttachmentTitle } from '../../utils/getTrimmedAttachmentTitle';
import { getIndicatorTypeForFileState, ProgressIndicatorTypes } from '../../utils/utils';
import { getFileSizeDisplayText } from '../Attachment/FileAttachment';
import { WritingDirectionAwareText } from '../RTLComponents/WritingDirectionAwareText';

const FILE_PREVIEW_HEIGHT = 60;
const WARNING_ICON_SIZE = 16;

const styles = StyleSheet.create({
  dismiss: {
    borderRadius: 24,
    height: 24,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
  },
  fileContainer: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  fileIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  filenameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fileSizeText: {
    fontSize: 12,
    marginTop: 10,
  },
  fileTextContainer: {
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  flatList: { marginBottom: 12, maxHeight: FILE_PREVIEW_HEIGHT * 2.5 + 16 },
  overlay: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginTop: 2,
  },
  unsupportedFile: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  unsupportedFileText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  warningIconStyle: {
    borderRadius: 24,
    marginTop: 2,
  },
});

const UnsupportedFileTypeOrFileSizeIndicator = ({
  indicatorType,
  item,
}: {
  indicatorType: (typeof ProgressIndicatorTypes)[keyof typeof ProgressIndicatorTypes];
  item: FileUpload;
}) => {
  const {
    theme: {
      colors: { accent_red, grey, grey_dark },
      messageInput: {
        fileUploadPreview: { fileSizeText },
      },
    },
  } = useTheme();

  const ONE_HOUR_IN_SECONDS = 3600;
  let durationLabel = '00:00';
  const videoDuration = item.file.duration;

  if (videoDuration) {
    const isDurationLongerThanHour = videoDuration / ONE_HOUR_IN_SECONDS >= 1;
    const formattedDurationParam = isDurationLongerThanHour ? 'HH:mm:ss' : 'mm:ss';
    const formattedVideoDuration = dayjs
      .duration(videoDuration, 'second')
      .format(formattedDurationParam);
    durationLabel = formattedVideoDuration;
  }

  const { t } = useTranslationContext();

  return indicatorType === ProgressIndicatorTypes.NOT_SUPPORTED ? (
    <View style={styles.unsupportedFile}>
      <Warning
        height={WARNING_ICON_SIZE}
        pathFill={accent_red}
        style={styles.warningIconStyle}
        width={WARNING_ICON_SIZE}
      />
      <Text style={[styles.unsupportedFileText, { color: grey_dark }]}>
        {t<string>('File type not supported')}
      </Text>
    </View>
  ) : (
    <WritingDirectionAwareText style={[styles.fileSizeText, { color: grey }, fileSizeText]}>
      {videoDuration ? durationLabel : getFileSizeDisplayText(item.file.size)}
    </WritingDirectionAwareText>
  );
};

type FileUploadPreviewPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessageInputContextValue<ErmisChatGenerics>,
  'fileUploads' | 'removeFile' | 'uploadFile' | 'setFileUploads' | 'AudioAttachmentUploadPreview'
> &
  Pick<MessagesContextValue<ErmisChatGenerics>, 'FileAttachmentIcon'> &
  Pick<ChatContextValue<ErmisChatGenerics>, 'enableOfflineSupport'>;

const FileUploadPreviewWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: FileUploadPreviewPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    AudioAttachmentUploadPreview,
    enableOfflineSupport,
    FileAttachmentIcon,
    fileUploads,
    removeFile,
    setFileUploads,
    uploadFile,
  } = props;

  const flatListRef = useRef<FlatList<FileUpload> | null>(null);
  const [flatListWidth, setFlatListWidth] = useState(0);

  useEffect(() => {
    setFileUploads(
      fileUploads.map((file) => ({
        ...file,
        duration: file.duration || 0,
        paused: true,
        progress: 0,
      })),
    );
  }, [fileUploads.length]);

  // Handler triggered when an audio is loaded in the message input. The initial state is defined for the audio here and the duration is set.
  const onLoad = (index: string, duration: number) => {
    setFileUploads((prevFileUploads) =>
      prevFileUploads.map((fileUpload) => ({
        ...fileUpload,
        duration: fileUpload.id === index ? duration : fileUpload.duration,
        file: {
          ...fileUpload.file,
          duration: fileUpload.id === index ? duration : fileUpload.duration,
        },
      })),
    );
  };

  // The handler which is triggered when the audio progresses/ the thumb is dragged in the progress control. The progressed duration is set here.
  const onProgress = (index: string, currentTime?: number, hasEnd?: boolean) => {
    setFileUploads((prevFileUploads) =>
      prevFileUploads.map((fileUpload) => ({
        ...fileUpload,
        progress:
          fileUpload.id === index
            ? hasEnd
              ? 1
              : currentTime
                ? currentTime / (fileUpload.duration as number)
                : 0
            : fileUpload.progress,
      })),
    );
  };

  // The handler which controls or sets the paused/played state of the audio.
  const onPlayPause = (index: string, pausedStatus?: boolean) => {
    if (pausedStatus === false) {
      // If the status is false we set the audio with the index as playing and the others as paused.
      setFileUploads((prevFileUploads) =>
        prevFileUploads.map((fileUpload) => ({
          ...fileUpload,
          paused: fileUpload.id !== index,
        })),
      );
    } else {
      // If the status is true we simply set all the audio's paused state as true.
      setFileUploads((prevFileUploads) =>
        prevFileUploads.map((fileUpload) => ({
          ...fileUpload,
          paused: true,
        })),
      );
    }
  };

  const {
    theme: {
      colors: { black, grey_dark, grey_gainsboro, grey_whisper },
      messageInput: {
        fileUploadPreview: { dismiss, fileContainer, filenameText, fileTextContainer, flatList },
      },
    },
  } = useTheme();

  const renderItem = ({ item }: { item: FileUpload }) => {
    const indicatorType = getIndicatorTypeForFileState(item.state, enableOfflineSupport);

    return (
      <>
        <UploadProgressIndicator
          action={() => {
            uploadFile({ newFile: item });
          }}
          style={styles.overlay}
          type={indicatorType}
        >
          {item.file.mimeType?.startsWith('audio/') && isAudioPackageAvailable() ? (
            <AudioAttachmentUploadPreview
              hideProgressBar={true}
              item={item}
              onLoad={onLoad}
              onPlayPause={onPlayPause}
              onProgress={onProgress}
              testID='audio-attachment-upload-preview'
            />
          ) : (
            <View
              style={[
                styles.fileContainer,
                {
                  borderColor: grey_whisper,
                },
                fileContainer,
              ]}
            >
              <View style={styles.fileIcon}>
                <FileAttachmentIcon mimeType={item.file.mimeType} />
              </View>
              <View style={[styles.fileTextContainer, fileTextContainer]}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filenameText,
                    {
                      color: black,
                      width:
                        flatListWidth -
                        16 - // 16 = horizontal padding
                        40 - // 40 = file icon size
                        24 - // 24 = close icon size
                        24, // 24 = internal padding
                    },
                    I18nManager.isRTL ? { writingDirection: 'rtl' } : { writingDirection: 'ltr' },
                    filenameText,
                  ]}
                >
                  {getTrimmedAttachmentTitle(item.file.name)}
                </Text>
                {indicatorType !== null && (
                  <UnsupportedFileTypeOrFileSizeIndicator
                    indicatorType={indicatorType}
                    item={item}
                  />
                )}
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              removeFile(item.id);
            }}
            style={[styles.dismiss, { backgroundColor: grey_gainsboro }, dismiss]}
            testID='remove-file-upload-preview'
          >
            <Close pathFill={grey_dark} />
          </TouchableOpacity>
        </UploadProgressIndicator>
      </>
    );
  };

  const fileUploadsLength = fileUploads.length;

  useEffect(() => {
    if (fileUploadsLength && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd(), 1);
    }
  }, [fileUploadsLength]);

  return fileUploadsLength ? (
    <FlatList
      data={fileUploads}
      getItemLayout={(_, index) => ({
        index,
        length: FILE_PREVIEW_HEIGHT + 8,
        offset: (FILE_PREVIEW_HEIGHT + 8) * index,
      })}
      keyExtractor={(item) => `${item.id}`}
      onLayout={({
        nativeEvent: {
          layout: { width },
        },
      }) => {
        setFlatListWidth(width);
      }}
      ref={flatListRef}
      renderItem={renderItem}
      style={[styles.flatList, flatList]}
    />
  ) : null;
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: FileUploadPreviewPropsWithContext<ErmisChatGenerics>,
  nextProps: FileUploadPreviewPropsWithContext<ErmisChatGenerics>,
) => {
  const { fileUploads: prevFileUploads } = prevProps;
  const { fileUploads: nextFileUploads } = nextProps;

  return (
    prevFileUploads.length === nextFileUploads.length &&
    prevFileUploads.every(
      (prevFileUpload, index) =>
        prevFileUpload.state === nextFileUploads[index].state &&
        prevFileUpload.paused === nextFileUploads[index].paused &&
        prevFileUpload.progress === nextFileUploads[index].progress &&
        prevFileUpload.duration === nextFileUploads[index].duration,
    )
  );
};

const MemoizedFileUploadPreview = React.memo(
  FileUploadPreviewWithContext,
  areEqual,
) as typeof FileUploadPreviewWithContext;

export type FileUploadPreviewProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<FileUploadPreviewPropsWithContext<ErmisChatGenerics>>;

/**
 * FileUploadPreview
 * UI Component to preview the files set for upload
 */
export const FileUploadPreview = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: FileUploadPreviewProps<ErmisChatGenerics>,
) => {
  const { enableOfflineSupport } = useChatContext<ErmisChatGenerics>();
  const { AudioAttachmentUploadPreview, fileUploads, removeFile, setFileUploads, uploadFile } =
    useMessageInputContext<ErmisChatGenerics>();
  const { FileAttachmentIcon } = useMessagesContext<ErmisChatGenerics>();

  return (
    <MemoizedFileUploadPreview
      {...{
        AudioAttachmentUploadPreview,
        FileAttachmentIcon,
        fileUploads,
        removeFile,
        setFileUploads,
        uploadFile,
      }}
      {...{ enableOfflineSupport }}
      {...props}
    />
  );
};

FileUploadPreview.displayName = 'FileUploadPreview{messageInput{fileUploadPreview}}';
