import { useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';

import type { Channel, MessageResponse, Attachment } from 'ermis-chat-sdk';

import type { ErmisChatGenerics } from '../types';

export const usePaginatedAttachments = (
  channel: Channel<ErmisChatGenerics>,
  attachmentType?: string,
) => {
  const { chatClient } = useAppContext();
  // const offset = useRef(0);
  const hasMoreResults = useRef(true);
  const queryInProgress = useRef(false);
  const [loading, setLoading] = useState(true);
  // const [attachtments, setActtachments] = useState<Attachment<ErmisChatGenerics>[]>([]);
  const [media, setMedia] = useState<Attachment<ErmisChatGenerics>[]>([]);
  const [files, setFiles] = useState<Attachment<ErmisChatGenerics>[]>([]);
  const fetchAttachments = async () => {
    if (queryInProgress.current) {
      return;
    }

    setLoading(true);

    try {
      queryInProgress.current = true;

      // offset.current = offset.current + attachtments.length;

      if (!hasMoreResults.current) {
        queryInProgress.current = false;
        setLoading(false);
        return;
      }

      const res = await channel.queryAttachmentMessages();


      const newAttachments: Attachment<ErmisChatGenerics>[] = res?.attachments;

      if (!newAttachments) {
        queryInProgress.current = false;
        setLoading(false);
        return;
      }

      newAttachments.map((attachment) => {
        if (attachment.content_type?.startsWith('image/') || attachment.content_type?.startsWith('video/')) {
          setMedia((existingMedia) => existingMedia.concat(attachment));
        } else {
          setFiles((existingFiles) => existingFiles.concat(attachment));
        }
      });

      // setActtachments((existingAttachments) => existingAttachments.concat(newAttachments));

      if (newAttachments.length < 10) {
        hasMoreResults.current = false;
      }
    } catch (e) {
      // do nothing;
    }
    queryInProgress.current = false;
    setLoading(false);
  };

  const loadMore = () => {
    // fetchAttachments();
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    loadMore,
    // attachtments,
    media,
    files,
  };
};
