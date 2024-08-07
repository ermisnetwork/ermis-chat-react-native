import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';

import type { Asset, DefaultErmisChatGenerics, File } from '../../types/types';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

export type AttachmentPickerIconProps = {
  numberOfImageUploads: number;
  selectedPicker?: 'images';
};

export type AttachmentPickerContextValue = {
  /**
   * Custom UI component to render [draggable handle]
   *
   * **Default** [AttachmentPickerBottomSheetHandle]
   */
  AttachmentPickerBottomSheetHandle: React.FC<BottomSheetHandleProps>;
  /**
   * Height of the image picker bottom sheet handle.
   * @type number
   * @default 20
   */
  attachmentPickerBottomSheetHandleHeight: number;
  /**
   * Height of the image picker bottom sheet when opened.
   * @type number
   * @default 40% of window height
   */
  attachmentPickerBottomSheetHeight: number;
  /**
   * Custom UI component for AttachmentPickerSelectionBar
   *
   * **Default: ** [AttachmentPickerSelectionBar]
   */
  AttachmentPickerSelectionBar: React.ComponentType;
  /**
   * Height of the attachment selection bar displayed on the attachment picker.
   * @type number
   * @default 52
   */
  attachmentSelectionBarHeight: number;
  /**
   * `bottomInset` determine the height of the `AttachmentPicker` and the underlying shift to the `MessageList` when it is opened.
   * This can also be set via the `setBottomInset` function provided by the `useAttachmentPickerContext` hook.
   *
   * Please check [OverlayProvider]
   * for more details.
   */
  bottomInset: number;
  /**
   * Custom UI component for [camera selector icon]
   *
   * **Default: ** [CameraSelectorIcon]
   */
  CameraSelectorIcon: React.ComponentType<AttachmentPickerIconProps>;
  closePicker: () => void;
  /**
   * Custom UI component for [file selector icon]
   *
   * **Default: ** [FileSelectorIcon]
   */
  FileSelectorIcon: React.ComponentType<AttachmentPickerIconProps>;
  /**
   * Custom UI component for [image selector icon]
   *
   * **Default: ** [ImageSelectorIcon]
   */
  ImageSelectorIcon: React.ComponentType<AttachmentPickerIconProps>;
  /**
   * Limit for maximum files that can be attached per message.
   */
  maxNumberOfFiles: number;
  openPicker: () => void;
  selectedFiles: File[];
  selectedImages: Asset[];
  setBottomInset: React.Dispatch<React.SetStateAction<number>>;
  setMaxNumberOfFiles: React.Dispatch<React.SetStateAction<number>>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setSelectedImages: React.Dispatch<React.SetStateAction<Asset[]>>;
  setSelectedPicker: React.Dispatch<React.SetStateAction<'images' | undefined>>;
  setTopInset: React.Dispatch<React.SetStateAction<number>>;
  topInset: number;
  selectedPicker?: 'images';
};

export const AttachmentPickerContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as AttachmentPickerContextValue,
);

export const AttachmentPickerProvider = ({
  children,
  value,
}: PropsWithChildren<{
  value?: Pick<
    AttachmentPickerContextValue,
    'CameraSelectorIcon' | 'closePicker' | 'FileSelectorIcon' | 'ImageSelectorIcon' | 'openPicker'
  > &
  Partial<Pick<AttachmentPickerContextValue, 'bottomInset' | 'topInset'>>;
}>) => {
  const bottomInsetValue = value?.bottomInset;
  const topInsetValue = value?.topInset;

  const [bottomInset, setBottomInset] = useState<number>(bottomInsetValue ?? 0);
  const [maxNumberOfFiles, setMaxNumberOfFiles] = useState(10);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPicker, setSelectedPicker] = useState<'images'>();
  const [topInset, setTopInset] = useState<number>(topInsetValue ?? 0);

  useEffect(() => {
    setBottomInset(bottomInsetValue ?? 0);
  }, [bottomInsetValue]);

  useEffect(() => {
    setTopInset(topInsetValue ?? 0);
  }, [topInsetValue]);

  const combinedValue = {
    maxNumberOfFiles,
    selectedFiles,
    selectedImages,
    selectedPicker,
    setBottomInset,
    setMaxNumberOfFiles,
    setSelectedFiles,
    setSelectedImages,
    setSelectedPicker,
    setTopInset,
    ...value,
    bottomInset,
    topInset,
  };

  return (
    <AttachmentPickerContext.Provider
      value={combinedValue as unknown as AttachmentPickerContextValue}
    >
      {children}
    </AttachmentPickerContext.Provider>
  );
};

export const useAttachmentPickerContext = () => {
  const contextValue = useContext(
    AttachmentPickerContext,
  ) as unknown as AttachmentPickerContextValue;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useAttachmentPickerContext hook was called outside the AttachmentPickerContext provider. Make sure you have configured OverlayProvider component correctly`,
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
 * typing is desired while using the HOC withAttachmentPickerContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withAttachmentPickerContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<ErmisChatGenerics>,
): React.ComponentType<Omit<ErmisChatGenerics, keyof AttachmentPickerContextValue>> => {
  const WithAttachmentPickerContextComponent = (
    props: Omit<ErmisChatGenerics, keyof AttachmentPickerContextValue>,
  ) => {
    const attachmentPickerContext = useAttachmentPickerContext();

    return <Component {...(props as ErmisChatGenerics)} {...attachmentPickerContext} />;
  };
  WithAttachmentPickerContextComponent.displayName = `WithAttachmentPickerContext${getDisplayName(
    Component as React.ComponentType,
  )}`;
  return WithAttachmentPickerContextComponent;
};
