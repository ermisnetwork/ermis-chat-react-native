import React, { PropsWithChildren, useContext, useRef } from 'react';

import type { Channel, ChannelState, ErmisChat } from 'ermis-chat-sdk';

import type { MessageType } from '../../components/MessageList/hooks/useMessageList';
import type { DefaultErmisChatGenerics } from '../../types/types';

import { DEFAULT_BASE_CONTEXT_VALUE } from '../utils/defaultBaseContextValue';

export type DebugDataType<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> =
  | ErmisChat<ErmisChatGenerics>['user']
  | {
    data: Channel<ErmisChatGenerics>['data'];
    members: ChannelState<ErmisChatGenerics>['members'];
  }[]
  | MessageType<ErmisChatGenerics>[];

export type DebugContextValue<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  eventType?: string;
  sendEventParams?: {
    action: string;
    data: DebugDataType<ErmisChatGenerics>;
  };
  setEventType?: (data: string) => void;
  setSendEventParams?: (data: { action: string; data: DebugDataType<ErmisChatGenerics> }) => void;
};

export const DebugContext = React.createContext(
  DEFAULT_BASE_CONTEXT_VALUE as React.MutableRefObject<DebugContextValue>,
);

export const DebugContextProvider = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  children,
  useFlipper,
}: PropsWithChildren<{
  useFlipper: () => {
    updateData: (ref: React.RefObject<DebugContextValue<ErmisChatGenerics>>) => void;
  };
}>) => {
  const debugRef = useRef<DebugContextValue<ErmisChatGenerics>>({
    eventType: undefined,
    sendEventParams: undefined,
  });

  const { updateData } = useFlipper();

  const ref = useRef<DebugContextValue<ErmisChatGenerics>>({
    setEventType: (data: string) => {
      debugRef.current.eventType = data;
      updateData(debugRef);
    },
    setSendEventParams: (data: { action: string; data: DebugDataType<ErmisChatGenerics> }) => {
      debugRef.current.sendEventParams = data;
      updateData(debugRef);
    },
  });

  return (
    <DebugContext.Provider value={ref as unknown as React.MutableRefObject<DebugContextValue>}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebugContext = () => {
  const contextValue = useContext(
    DebugContext,
  ) as unknown as React.MutableRefObject<DebugContextValue>;

  return contextValue;
};
