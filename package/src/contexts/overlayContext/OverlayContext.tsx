import React, { useContext } from 'react';

import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import type { Attachment } from 'ermis-chat-sdk';

import type { AttachmentPickerProps } from '../../components/AttachmentPicker/AttachmentPicker';
import type { ImageGalleryCustomComponents } from '../../components/ImageGallery/ImageGallery';

import type { MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { DefaultErmisChatGenerics } from '../../types/types';
import type { Ermisi18n } from '../../utils/i18n/Ermisi18n';
import type { AttachmentPickerContextValue } from '../attachmentPickerContext/AttachmentPickerContext';
import type { MessageOverlayContextValue } from '../messageOverlayContext/MessageOverlayContext';
import type { DeepPartial } from '../themeContext/ThemeContext';
import type { Theme } from '../themeContext/utils/theme';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type Overlay = 'alert' | 'gallery' | 'message' | 'none';

export type OverlayContextValue = {
  overlay: Overlay;
  setOverlay: React.Dispatch<React.SetStateAction<Overlay>>;
  style?: DeepPartial<Theme>;
};

export const OverlayContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as OverlayContextValue,
);

export type OverlayProviderProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<AttachmentPickerProps> &
  Partial<
    Pick<
      AttachmentPickerContextValue,
      | 'AttachmentPickerBottomSheetHandle'
      | 'attachmentPickerBottomSheetHandleHeight'
      | 'attachmentPickerBottomSheetHeight'
      | 'AttachmentPickerSelectionBar'
      | 'attachmentSelectionBarHeight'
      | 'bottomInset'
      | 'CameraSelectorIcon'
      | 'FileSelectorIcon'
      | 'ImageSelectorIcon'
      | 'topInset'
    >
  > &
  ImageGalleryCustomComponents<ErmisChatGenerics> &
  Partial<
    Pick<
      MessageOverlayContextValue<ErmisChatGenerics>,
      | 'MessageActionList'
      | 'MessageActionListItem'
      | 'OverlayReactionList'
      | 'OverlayReactions'
      | 'OverlayReactionsAvatar'
    >
  > & {
    autoPlayVideo?: boolean;
    /**
     * The giphy version to render - check the keys of the [Image Object](https://developers.giphy.com/docs/api/schema#image-object) for possible values. Uses 'fixed_height' by default
     * */
    closePicker?: (ref: React.RefObject<BottomSheetMethods>) => void;
    error?: boolean | Error;
    giphyVersion?: keyof NonNullable<Attachment['giphy']>;
    i18nInstance?: Ermisi18n;
    imageGalleryGridHandleHeight?: number;
    imageGalleryGridSnapPoints?: [string | number, string | number];
    isMyMessage?: boolean;
    isThreadMessage?: boolean;
    message?: MessageType<ErmisChatGenerics>;
    messageReactions?: boolean;
    messageTextNumberOfLines?: number;
    numberOfImageGalleryGridColumns?: number;
    openPicker?: (ref: React.RefObject<BottomSheetMethods>) => void;
    value?: Partial<OverlayContextValue>;
  };

export const useOverlayContext = () => {
  const contextValue = useContext(OverlayContext);

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useOverlayContext hook was called outside the OverlayContext Provider. Make sure you have configured OverlayProvider component correctly`,
    );
  }

  return contextValue;
};

/**
 * @deprecated
 *
 * This will be removed in the next major version.
 *
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withOverlayContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withOverlayContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<ErmisChatGenerics>,
): React.ComponentType<Omit<ErmisChatGenerics, keyof OverlayContextValue>> => {
  const WithOverlayContextComponent = (
    props: Omit<ErmisChatGenerics, keyof OverlayContextValue>,
  ) => {
    const overlayContext = useOverlayContext();

    return <Component {...(props as ErmisChatGenerics)} {...overlayContext} />;
  };
  WithOverlayContextComponent.displayName = `WithOverlayContext${getDisplayName(
    Component as React.ComponentType,
  )}`;
  return WithOverlayContextComponent;
};
