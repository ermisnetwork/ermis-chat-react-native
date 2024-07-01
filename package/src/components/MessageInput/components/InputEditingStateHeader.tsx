import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ChannelContextValue } from '../../../contexts/channelContext/ChannelContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';

import { CircleClose, Edit } from '../../../icons';
import type { DefaultErmisChatGenerics } from '../../../types/types';

const styles = StyleSheet.create({
  editingBoxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  editingBoxHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export type InputEditingStateHeaderPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<MessageInputContextValue<ErmisChatGenerics>, 'clearEditingState' | 'resetInput'> &
  Pick<ChannelContextValue<ErmisChatGenerics>, 'disabled'>;

export const InputEditingStateHeaderWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  clearEditingState,
  disabled,
  resetInput,
}: InputEditingStateHeaderPropsWithContext<ErmisChatGenerics>) => {
  const { t } = useTranslationContext();
  const {
    theme: {
      colors: { black, grey, grey_gainsboro },
      messageInput: {
        editingStateHeader: { editingBoxHeader, editingBoxHeaderTitle },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.editingBoxHeader, editingBoxHeader]}>
      <Edit pathFill={grey_gainsboro} />
      <Text style={[styles.editingBoxHeaderTitle, { color: black }, editingBoxHeaderTitle]}>
        {t<string>('Editing Message')}
      </Text>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          resetInput();
          clearEditingState();
        }}
        testID='close-button'
      >
        <CircleClose pathFill={grey} />
      </TouchableOpacity>
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: InputEditingStateHeaderPropsWithContext<ErmisChatGenerics>,
  nextProps: InputEditingStateHeaderPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled: prevDisabled } = prevProps;
  const { disabled: nextDisabled } = nextProps;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  return true;
};

const MemoizedInputEditingStateHeader = React.memo(
  InputEditingStateHeaderWithContext,
  areEqual,
) as typeof InputEditingStateHeaderWithContext;

export type InputEditingStateHeaderProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<InputEditingStateHeaderPropsWithContext<ErmisChatGenerics>>;

export const InputEditingStateHeader = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InputEditingStateHeaderProps<ErmisChatGenerics>,
) => {
  const { clearEditingState, resetInput } = useMessageInputContext<ErmisChatGenerics>();

  return <MemoizedInputEditingStateHeader {...{ clearEditingState, resetInput }} {...props} />;
};

InputEditingStateHeader.displayName = 'EditingStateHeader{messageInput}';
