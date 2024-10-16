import React from 'react';

import type { Attachment as AttachmentType } from 'ermis-chat-sdk';

import { AttachmentActions as AttachmentActionsDefault } from '../../components/Attachment/AttachmentActions';
import { Card as CardDefault } from '../../components/Attachment/Card';
import { FileAttachment as FileAttachmentDefault } from '../../components/Attachment/FileAttachment';
import { Gallery as GalleryDefault } from '../../components/Attachment/Gallery';
import { Giphy as GiphyDefault } from '../../components/Attachment/Giphy';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import { isVideoPackageAvailable } from '../../native';

import type { DefaultErmisChatGenerics } from '../../types/types';

export type ActionHandler = (name: string, value: string) => void;

export type AttachmentPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessagesContextValue<ErmisChatGenerics>,
  | 'AttachmentActions'
  | 'Card'
  | 'FileAttachment'
  | 'Gallery'
  | 'giphyVersion'
  | 'Giphy'
  | 'isAttachmentEqual'
  | 'UrlPreview'
  | 'myMessageTheme'
> & {
  /**
   * The attachment to render
   */
  attachment: AttachmentType<ErmisChatGenerics>;
};

const AttachmentWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AttachmentPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    attachment,
    AttachmentActions,
    Card,
    FileAttachment,
    Gallery,
    Giphy,
    giphyVersion,
    UrlPreview,
  } = props;

  const hasAttachmentActions = !!attachment.actions?.length;

  if (attachment.type === 'giphy' || attachment.type === 'imgur') {
    return <Giphy attachment={attachment} giphyVersion={giphyVersion} />;
  }

  if (attachment.og_scrape_url || attachment.title_link) {
    return <UrlPreview {...attachment} />;
  }

  if (attachment.type === 'image') {
    return (
      <>
        <Gallery images={[attachment]} />
        {hasAttachmentActions && (
          <AttachmentActions key={`key-actions-${attachment.id}`} {...attachment} />
        )}
      </>
    );
  }

  if (attachment.type === 'video' && !attachment.og_scrape_url) {
    return isVideoPackageAvailable() ? (
      <>
        <Gallery videos={[attachment]} />
        {hasAttachmentActions && (
          <AttachmentActions key={`key-actions-${attachment.id}`} {...attachment} />
        )}
      </>
    ) : (
      <FileAttachment attachment={attachment} />
    );
  }

  if (
    attachment.type === 'file' ||
    attachment.type === 'audio' ||
    attachment.type === 'voiceRecording'
  ) {
    return <FileAttachment attachment={attachment} />;
  }

  if (hasAttachmentActions) {
    return (
      <>
        <Card {...attachment} />
        <AttachmentActions key={`key-actions-${attachment.id}`} {...attachment} />
      </>
    );
  } else {
    return <Card {...attachment} />;
  }
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: AttachmentPropsWithContext<ErmisChatGenerics>,
  nextProps: AttachmentPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    attachment: prevAttachment,
    isAttachmentEqual,
    myMessageTheme: prevMyMessageTheme,
  } = prevProps;
  const { attachment: nextAttachment, myMessageTheme: nextMyMessageTheme } = nextProps;

  const attachmentEqual =
    prevAttachment.actions?.length === nextAttachment.actions?.length &&
    prevAttachment.image_url === nextAttachment.image_url &&
    prevAttachment.thumb_url === nextAttachment.thumb_url &&
    prevAttachment.type === nextAttachment.type;
  if (!attachmentEqual) return false;

  if (isAttachmentEqual) {
    return isAttachmentEqual(prevAttachment, nextAttachment);
  }

  const messageThemeEqual =
    JSON.stringify(prevMyMessageTheme) === JSON.stringify(nextMyMessageTheme);
  if (!messageThemeEqual) return false;

  return true;
};

const MemoizedAttachment = React.memo(
  AttachmentWithContext,
  areEqual,
) as typeof AttachmentWithContext;

export type AttachmentProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<
  Pick<
    MessagesContextValue<ErmisChatGenerics>,
    | 'AttachmentActions'
    | 'Card'
    | 'FileAttachment'
    | 'Gallery'
    | 'Giphy'
    | 'giphyVersion'
    | 'myMessageTheme'
    | 'UrlPreview'
    | 'isAttachmentEqual'
  >
> &
  Pick<AttachmentPropsWithContext<ErmisChatGenerics>, 'attachment'>;

/**
 * Attachment - The message attachment
 */
export const Attachment = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AttachmentProps<ErmisChatGenerics>,
) => {
  const {
    attachment,
    AttachmentActions: PropAttachmentActions,
    Card: PropCard,
    FileAttachment: PropFileAttachment,
    Gallery: PropGallery,
    Giphy: PropGiphy,
    giphyVersion: PropGiphyVersion,
    myMessageTheme: PropMyMessageTheme,
    UrlPreview: PropUrlPreview,
  } = props;

  const {
    AttachmentActions: ContextAttachmentActions,
    Card: ContextCard,
    FileAttachment: ContextFileAttachment,
    Gallery: ContextGallery,
    Giphy: ContextGiphy,
    giphyVersion: ContextGiphyVersion,
    isAttachmentEqual,
    myMessageTheme: ContextMyMessageTheme,
    UrlPreview: ContextUrlPreview,
  } = useMessagesContext<ErmisChatGenerics>();

  if (!attachment) {
    return null;
  }

  const AttachmentActions =
    PropAttachmentActions || ContextAttachmentActions || AttachmentActionsDefault;
  const Card = PropCard || ContextCard || CardDefault;
  const FileAttachment = PropFileAttachment || ContextFileAttachment || FileAttachmentDefault;
  const Gallery = PropGallery || ContextGallery || GalleryDefault;
  const Giphy = PropGiphy || ContextGiphy || GiphyDefault;
  const UrlPreview = PropUrlPreview || ContextUrlPreview || CardDefault;
  const giphyVersion = PropGiphyVersion || ContextGiphyVersion;
  const myMessageTheme = PropMyMessageTheme || ContextMyMessageTheme;

  return (
    <MemoizedAttachment
      {...{
        attachment,
        AttachmentActions,
        Card,
        FileAttachment,
        Gallery,
        Giphy,
        giphyVersion,
        isAttachmentEqual,
        myMessageTheme,
        UrlPreview,
      }}
    />
  );
};
