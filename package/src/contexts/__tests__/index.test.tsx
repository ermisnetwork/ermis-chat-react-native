import React from 'react';
import { View } from 'react-native';

import { render } from '@testing-library/react-native';

import {
  useAttachmentPickerContext,
  useChannelContext,
  useChannelsContext,
  useChatContext,
  useImageGalleryContext,
  useMessageOverlayContext,
  useMessagesContext,
  useOverlayContext,
  useOwnCapabilitiesContext,
  usePaginatedMessageListContext,
  useSuggestionsContext,
  useTheme,
  useThreadContext,
  useTypingContext,
} from '../';
import { useChannelsStateContext } from '../channelsStateContext/ChannelsStateContext';

jest.mock('../utils/isTestEnvironment', () => ({ isTestEnvironment: jest.fn(() => false) }));
console.error = jest.fn();
describe('contexts hooks in a component throws an error with message when not wrapped in a provider', () => {
  const TestComponent = ({ useContextHook }: { useContextHook(): void }) => {
    useContextHook();
    return <View />;
  };

  it.each([
    [
      useOverlayContext,
      'The useOverlayContext hook was called outside the OverlayContext Provider. Make sure you have configured OverlayProvider component correctly',
    ],
    [
      usePaginatedMessageListContext,
      'The usePaginatedMessageListContext hook was called outside of the PaginatedMessageList provider. Make sure you have configured Channel component correctly ',
    ],
    [
      useChannelsStateContext,
      `The useChannelsStateContext hook was called outside the ChannelStateContext Provider. Make sure you have configured OverlayProvider component correctly`,
    ],
    [
      useOwnCapabilitiesContext,
      `The useOwnCapabilitiesContext hook was called outside the Channel Component. Make sure you have configured Channel component correctly `,
    ],
    [
      useSuggestionsContext,
      'The useSuggestionsContext hook was called outside of the SuggestionsContext provider. Make sure you have configured Channel component correctly',
    ],
    [
      useTypingContext,
      `The useTypingContext hook was called outside of the TypingContext provider. Make sure you have configured Channel component correctly`,
    ],
    [
      useTheme,
      `The useThemeContext hook was called outside the ThemeContext Provider. Make sure you have configured OverlayProvider component correctly`,
    ],
    [
      useChannelContext,
      `The useChannelContext hook was called outside of the ChannelContext provider. Make sure you have configured Channel component correctly`,
    ],
    [
      useChannelsContext,
      `The useChannelsContext hook was called outside of the ChannelsContext provider. Make sure you have configured ChannelList component correctly`,
    ],
    [
      useChatContext,
      `The useChatContext hook was called outside the ChatContext Provider. Make sure you have configured Chat component correctly`,
    ],
    [
      useImageGalleryContext,
      `The useImageGalleryContext hook was called outside the ImageGalleryContext Provider. Make sure you have configured OverlayProvider component correctly`,
    ],
    [
      useMessageOverlayContext,
      `The useMessageOverlayContext hook was called outside the MessageOverlayContext Provider. Make sure you have configured OverlayProvider component correctly`,
    ],
    [
      useMessagesContext,
      `The useMessagesContext hook was called outside of the MessagesContext provider. Make sure you have configured MessageList component correctly`,
    ],
    [
      useThreadContext,
      `The useThreadContext hook was called outside of the ThreadContext provider. Make sure you have configured Channel component correctly`,
    ],
    [
      useAttachmentPickerContext,
      `The useAttachmentPickerContext hook was called outside the AttachmentPickerContext provider. Make sure you have configured OverlayProvider component correctly`,
    ],
  ])('calls %p results in error %p', (useContextHook, expectedErrorMessage) => {
    expect(() => render(<TestComponent useContextHook={useContextHook} />)).toThrow(
      expectedErrorMessage,
    );
  });
});
