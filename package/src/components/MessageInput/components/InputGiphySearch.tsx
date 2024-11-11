import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ChannelContextValue } from '../../../contexts/channelContext/ChannelContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../../contexts/messageInputContext/MessageInputContext';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';

import { CircleClose, Lightning } from '../../../icons';
import type { DefaultErmisChatGenerics } from '../../../types/types';
import { AutoCompleteInput } from '../../AutoCompleteInput/AutoCompleteInput';
import { useCountdown } from '../hooks/useCountdown';

const styles = StyleSheet.create({
  autoCompleteInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 10,
  },
  giphyContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    height: 24,
    marginRight: 8,
    paddingHorizontal: 8,
  },
  giphyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export type InputGiphySearchPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessageInputContextValue<ErmisChatGenerics>,
  'additionalTextInputProps' | 'cooldownEndsAt' | 'setGiphyActive' | 'setShowMoreOptions'
> &
  Pick<ChannelContextValue<ErmisChatGenerics>, 'disabled'>;

export const InputGiphySearchWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  additionalTextInputProps,
  cooldownEndsAt,
  disabled,
  setGiphyActive,
  setShowMoreOptions,
}: InputGiphySearchPropsWithContext<ErmisChatGenerics>) => {
  const { seconds: cooldownRemainingSeconds } = useCountdown(cooldownEndsAt);

  const {
    theme: {
      colors: { accent_blue, grey, white },
      messageInput: {
        autoCompleteInputContainer,
        giphyCommandInput: { giphyContainer, giphyText },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.autoCompleteInputContainer, autoCompleteInputContainer]}>
      <View style={[styles.giphyContainer, { backgroundColor: accent_blue }, giphyContainer]}>
        <Lightning height={16} pathFill={white} width={16} />
        <Text style={[styles.giphyText, { color: white }, giphyText]}>GIPHY</Text>
      </View>

      <AutoCompleteInput<ErmisChatGenerics>
        additionalTextInputProps={additionalTextInputProps}
        cooldownActive={!!cooldownRemainingSeconds}
      />
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          setGiphyActive(false);
          setShowMoreOptions(true);
        }}
        testID='close-button'
      >
        <CircleClose height={20} pathFill={grey} width={20} />
      </TouchableOpacity>
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: InputGiphySearchPropsWithContext<ErmisChatGenerics>,
  nextProps: InputGiphySearchPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled: prevDisabled } = prevProps;
  const { disabled: nextDisabled } = nextProps;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  return true;
};

const MemoizedInputGiphySearch = React.memo(
  InputGiphySearchWithContext,
  areEqual,
) as typeof InputGiphySearchWithContext;

export type InputGiphySearchProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<InputGiphySearchPropsWithContext<ErmisChatGenerics>>;

export const InputGiphySearch = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InputGiphySearchProps<ErmisChatGenerics>,
) => {
  const { additionalTextInputProps, cooldownEndsAt, setGiphyActive, setShowMoreOptions } =
    useMessageInputContext<ErmisChatGenerics>();

  return (
    <MemoizedInputGiphySearch
      {...{ additionalTextInputProps, cooldownEndsAt, setGiphyActive, setShowMoreOptions }}
      {...props}
    />
  );
};

InputGiphySearch.displayName = 'InputGiphySearch{messageInput}';
