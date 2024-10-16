import { useEffect, useState } from 'react';

import { Attachment } from 'ermis-chat-sdk';

import type { DefaultErmisChatGenerics, FileUpload, ImageUpload } from '../../../types/types';
import { generateRandomId } from '../../../utils/utils';

import type { MessageInputContextValue } from '../MessageInputContext';

export const useMessageDetailsForState = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  message: MessageInputContextValue<ErmisChatGenerics>['editing'],
  initialValue?: string,
) => {
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [numberOfUploads, setNumberOfUploads] = useState(0);
  const [showMoreOptions, setShowMoreOptions] = useState(true);

  const initialTextValue = initialValue || '';
  const [text, setText] = useState(initialTextValue);

  useEffect(() => {
    if (text !== initialTextValue) {
      setShowMoreOptions(false);
    }
    if (fileUploads.length || imageUploads.length) {
      setShowMoreOptions(false);
    }
  }, [text, imageUploads.length, fileUploads.length]);

  const messageValue =
    message === undefined ? '' : `${message.id}${message.text}${message.updated_at}`;

  useEffect(() => {
    if (message && Array.isArray(message?.mentioned_users)) {
      const mentionedUsers = message.mentioned_users.map((user) => user.id);
      setMentionedUsers(mentionedUsers);
    }
  }, [messageValue]);

  const mapAttachmentToFileUpload = (attachment: Attachment<ErmisChatGenerics>): FileUpload => {
    const id = generateRandomId();

    if (attachment.type === 'audio') {
      return {
        file: {
          duration: attachment.duration,
          mimeType: attachment.mime_type,
          name: attachment.title || '',
          size: attachment.file_size,
          uri: attachment.asset_url,
        },
        id,
        state: 'finished',
        url: attachment.asset_url,
      };
    } else if (attachment.type === 'video') {
      return {
        file: {
          mimeType: attachment.mime_type,
          name: attachment.title || '',
          size: attachment.file_size,
        },
        id,
        state: 'finished',
        thumb_url: attachment.thumb_url,
        url: attachment.asset_url,
      };
    } else if (attachment.type === 'voiceRecording') {
      return {
        file: {
          duration: attachment.duration,
          mimeType: attachment.mime_type,
          name: attachment.title || '',
          size: attachment.file_size,
          uri: attachment.asset_url,
          waveform_data: attachment.waveform_data,
        },
        id,
        state: 'finished',
        url: attachment.asset_url,
      };
    } else if (attachment.type === 'file') {
      return {
        file: {
          mimeType: attachment.mime_type,
          name: attachment.title || '',
          size: attachment.file_size,
        },
        id,
        state: 'finished',
        url: attachment.asset_url,
      };
    } else {
      return {
        file: {
          mimeType: attachment.mime_type,
          name: attachment.title || '',
          size: attachment.file_size,
        },
        id,
        state: 'finished',
        url: attachment.asset_url,
      };
    }
  };

  useEffect(() => {
    if (message) {
      setText(message?.text || '');
      const newFileUploads: FileUpload[] = [];
      const newImageUploads: ImageUpload[] = [];

      const attachments = Array.isArray(message.attachments) ? message.attachments : [];

      for (const attachment of attachments) {
        if (attachment.type === 'image') {
          const id = generateRandomId();
          newImageUploads.push({
            file: {
              name: attachment.fallback,
              size: attachment.file_size,
              type: attachment.type,
            },
            id,
            state: 'finished',
            url: attachment.image_url || attachment.asset_url || attachment.thumb_url,
          });
        } else {
          const fileUpload = mapAttachmentToFileUpload(attachment);
          if (fileUpload) {
            newFileUploads.push(fileUpload);
          }
        }
      }
      if (newFileUploads.length) {
        setFileUploads(newFileUploads);
      }
      if (newImageUploads.length) {
        setImageUploads(newImageUploads);
      }
    }
  }, [messageValue]);

  return {
    fileUploads,
    imageUploads,
    mentionedUsers,
    numberOfUploads,
    setFileUploads,
    setImageUploads,
    setMentionedUsers,
    setNumberOfUploads,
    setShowMoreOptions,
    setText,
    showMoreOptions,
    text,
  };
};
