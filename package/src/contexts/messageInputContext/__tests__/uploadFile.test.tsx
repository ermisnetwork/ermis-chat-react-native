import React, { PropsWithChildren } from 'react';
import { act } from 'react-test-renderer';

import { renderHook, waitFor } from '@testing-library/react-native';

import { generateFileUploadPreview } from '../../../mock-builders/generator/attachment';
import { generateMessage } from '../../../mock-builders/generator/message';
import { generateUser } from '../../../mock-builders/generator/user';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import {
  InputMessageInputContextValue,
  MessageInputContextValue,
  MessageInputProvider,
  useMessageInputContext,
} from '../MessageInputContext';

type WrapperType<ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics> =
  Partial<InputMessageInputContextValue<ErmisChatGenerics>>;

const user1 = generateUser();
const message = generateMessage({ user: user1 });

const Wrapper = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>({
  children,
  ...rest
}: PropsWithChildren<WrapperType<ErmisChatGenerics>>) => (
  <MessageInputProvider
    value={
      {
        ...rest,
      } as MessageInputContextValue<ErmisChatGenerics>
    }
  >
    {children}
  </MessageInputProvider>
);

describe("MessageInputContext's uploadFile", () => {
  it('uploadFile works', async () => {
    const doDocUploadRequestMock = jest.fn().mockResolvedValue({
      file: {
        url: '',
      },
      thumb_url: '',
    });
    const initialProps = {
      doDocUploadRequest: doDocUploadRequestMock,
      editing: message,
    };
    const { result } = renderHook(() => useMessageInputContext(), {
      initialProps,
      wrapper: (props) => (
        <Wrapper
          doDocUploadRequest={initialProps.doDocUploadRequest}
          editing={initialProps.editing}
          {...props}
        />
      ),
    });

    await waitFor(() => {
      expect(result.current.fileUploads).toHaveLength(0);
    });

    act(() => {
      result.current.uploadFile({ newFile: generateFileUploadPreview({ state: '' }) });
    });

    await waitFor(() => {
      expect(doDocUploadRequestMock).toHaveBeenCalled();
    });
  });

  it('uploadFile catch block gets executed', async () => {
    const doDocUploadRequestMock = jest.fn().mockResolvedValue(new Error('This is an error'));
    const initialProps = {
      doDocUploadRequest: doDocUploadRequestMock,
      editing: message,
    };
    const { result } = renderHook(() => useMessageInputContext(), {
      initialProps,
      wrapper: (props) => (
        <Wrapper
          doDocUploadRequest={initialProps.doDocUploadRequest}
          editing={initialProps.editing}
          {...props}
        />
      ),
    });

    await waitFor(() => {
      expect(result.current.fileUploads).toHaveLength(0);
    });

    act(() => {
      result.current.uploadFile({ newFile: generateFileUploadPreview({ state: '' }) });
    });

    await waitFor(() => {
      expect(result.current.fileUploads.length).toBe(0);
    });
  });
});
