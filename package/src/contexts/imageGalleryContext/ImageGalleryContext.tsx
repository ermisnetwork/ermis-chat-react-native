import React, { PropsWithChildren, useContext, useState } from 'react';

import type { MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { DefaultErmisChatGenerics, UnknownType } from '../../types/types';
import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

import { getDisplayName } from '../utils/getDisplayName';
import { isTestEnvironment } from '../utils/isTestEnvironment';

type SelectedMessage = {
  messageId?: string;
  url?: string;
};

export type ImageGalleryContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  messages: MessageType<ErmisChatGenerics>[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType<ErmisChatGenerics>[]>>;
  setSelectedMessage: React.Dispatch<React.SetStateAction<SelectedMessage | undefined>>;
  selectedMessage?: SelectedMessage;
};

export const ImageGalleryContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as ImageGalleryContextValue,
);

export const ImageGalleryProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
}: PropsWithChildren<UnknownType>) => {
  const [messages, setMessages] = useState<MessageType<ErmisChatGenerics>[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage>();

  return (
    <ImageGalleryContext.Provider
      value={
        {
          messages,
          selectedMessage,
          setMessages,
          setSelectedMessage,
        } as unknown as ImageGalleryContextValue
      }
    >
      {children}
    </ImageGalleryContext.Provider>
  );
};

export const useImageGalleryContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>() => {
  const contextValue = useContext(
    ImageGalleryContext,
  ) as unknown as ImageGalleryContextValue<ErmisChatGenerics>;

  if (contextValue === DEFAULT_BASE_CONTEXT_VALUE && !isTestEnvironment()) {
    throw new Error(
      `The useImageGalleryContext hook was called outside the ImageGalleryContext Provider. Make sure you have configured OverlayProvider component correctly`,
    );
  }

  return contextValue as ImageGalleryContextValue<ErmisChatGenerics>;
};

/**
 * @deprecated
 *
 * This will be removed in the next major version.
 *
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withImageGalleryContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withImageGalleryContext = <
  P extends UnknownType,
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof ImageGalleryContextValue<ErmisChatGenerics>>> => {
  const WithImageGalleryContextComponent = (
    props: Omit<P, keyof ImageGalleryContextValue<ErmisChatGenerics>>,
  ) => {
    const imageGalleryContext = useImageGalleryContext<ErmisChatGenerics>();

    return <Component {...(props as P)} {...imageGalleryContext} />;
  };
  WithImageGalleryContextComponent.displayName = `WithImageGalleryContext${getDisplayName(
    Component,
  )}`;
  return WithImageGalleryContextComponent;
};
