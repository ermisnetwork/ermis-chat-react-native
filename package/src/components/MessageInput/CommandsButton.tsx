import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable } from 'react-native';

import {
  ChannelContextValue,
  useChannelContext,
} from '../../contexts/channelContext/ChannelContext';
import {
  isSuggestionCommand,
  SuggestionsContextValue,
  useSuggestionsContext,
} from '../../contexts/suggestionsContext/SuggestionsContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { Lightning } from '../../icons/Lightning';

import type { DefaultErmisChatGenerics } from '../../types/types';

type CommandsButtonPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelContextValue<ErmisChatGenerics>, 'disabled'> &
  Pick<SuggestionsContextValue<ErmisChatGenerics>, 'suggestions'> & {
    /** Function that opens commands selector */
    handleOnPress?: ((event: GestureResponderEvent) => void) & (() => void);
  };

const CommandsButtonWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: CommandsButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled, handleOnPress, suggestions } = props;

  const {
    theme: {
      colors: { accent_blue, grey },
      messageInput: { commandsButton },
    },
  } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={handleOnPress}
      style={[commandsButton]}
      testID='commands-button'
    >
      <Lightning
        pathFill={
          suggestions && suggestions.data.some((suggestion) => isSuggestionCommand(suggestion))
            ? accent_blue
            : grey
        }
      />
    </Pressable>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: CommandsButtonPropsWithContext<ErmisChatGenerics>,
  nextProps: CommandsButtonPropsWithContext<ErmisChatGenerics>,
) => {
  const { disabled: prevDisabled, suggestions: prevSuggestions } = prevProps;
  const { disabled: nextDisabled, suggestions: nextSuggestions } = nextProps;

  const disabledEqual = prevDisabled === nextDisabled;
  if (!disabledEqual) return false;

  const suggestionsEqual = !!prevSuggestions === !!nextSuggestions;
  if (!suggestionsEqual) return false;

  return true;
};

const MemoizedCommandsButton = React.memo(
  CommandsButtonWithContext,
  areEqual,
) as typeof CommandsButtonWithContext;

export type CommandsButtonProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<CommandsButtonPropsWithContext<ErmisChatGenerics>>;

/**
 * UI Component for attach button in MessageInput component.
 */
export const CommandsButton = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: CommandsButtonProps<ErmisChatGenerics>,
) => {
  const { disabled = false } = useChannelContext<ErmisChatGenerics>();
  const { suggestions } = useSuggestionsContext<ErmisChatGenerics>();

  return <MemoizedCommandsButton {...{ disabled, suggestions }} {...props} />;
};

CommandsButton.displayName = 'CommandsButton{messageInput}';
