import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { filterTypingUsers } from './utils/filterTypingUsers';

import { ChatContextValue, useChatContext } from '../../contexts/chatContext/ChatContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { ThreadContextValue, useThreadContext } from '../../contexts/threadContext/ThreadContext';
import { TypingContextValue, useTypingContext } from '../../contexts/typingContext/TypingContext';

import type { DefaultErmisChatGenerics } from '../../types/types';

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
});

type TypingIndicatorContainerPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<TypingContextValue<ErmisChatGenerics>, 'typing'> &
  Pick<ChatContextValue<ErmisChatGenerics>, 'client'> &
  Pick<ThreadContextValue<ErmisChatGenerics>, 'thread'>;

const TypingIndicatorContainerWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: PropsWithChildren<TypingIndicatorContainerPropsWithContext<ErmisChatGenerics>>,
) => {
  const { children, client, thread, typing } = props;

  const {
    theme: {
      messageList: { typingIndicatorContainer },
    },
  } = useTheme();
  const typingUsers = filterTypingUsers({ client, thread, typing });

  if (!typingUsers.length) {
    return null;
  }

  return (
    <View style={[styles.container, typingIndicatorContainer]} testID='typing-indicator-container'>
      {children}
    </View>
  );
};

export type TypingIndicatorContainerProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = PropsWithChildren<Partial<TypingIndicatorContainerPropsWithContext<ErmisChatGenerics>>>;

export const TypingIndicatorContainer = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: TypingIndicatorContainerProps<ErmisChatGenerics>,
) => {
  const { typing } = useTypingContext<ErmisChatGenerics>();
  const { client } = useChatContext<ErmisChatGenerics>();
  const { thread } = useThreadContext<ErmisChatGenerics>();

  return <TypingIndicatorContainerWithContext {...{ client, thread, typing }} {...props} />;
};

TypingIndicatorContainer.displayName =
  'TypingIndicatorContainer{messageList{typingIndicatorContainer}}';
