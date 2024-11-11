import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../contexts/messageInputContext/MessageInputContext';
import { useOwnCapabilitiesContext } from '../../contexts/ownCapabilitiesContext/OwnCapabilitiesContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';

import type { DefaultErmisChatGenerics } from '../../types/types';

const styles = StyleSheet.create({
  attachButtonContainer: { paddingRight: 5 },
});

export type InputButtonsProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<InputButtonsWithContextProps<ErmisChatGenerics>>;

export type InputButtonsWithContextProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  MessageInputContextValue<ErmisChatGenerics>,
  | 'AttachButton'
  | 'CommandsButton'
  | 'giphyActive'
  | 'hasCommands'
  | 'hasFilePicker'
  | 'hasImagePicker'
  | 'MoreOptionsButton'
  | 'openCommandsPicker'
  | 'selectedPicker'
  | 'setShowMoreOptions'
  | 'showMoreOptions'
  | 'text'
  | 'toggleAttachmentPicker'
>;

export const InputButtonsWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InputButtonsWithContextProps<ErmisChatGenerics>,
) => {
  const {
    AttachButton,
    CommandsButton,
    giphyActive,
    hasCommands,
    hasFilePicker,
    hasImagePicker,
    MoreOptionsButton,
    openCommandsPicker,
    setShowMoreOptions,
    showMoreOptions,
    text,
    toggleAttachmentPicker,
  } = props;

  const {
    theme: {
      messageInput: { attachButtonContainer, commandsButtonContainer },
    },
  } = useTheme();

  const ownCapabilities = useOwnCapabilitiesContext();

  if (giphyActive) {
    return null;
  }

  return !showMoreOptions && (hasImagePicker || hasFilePicker) && hasCommands ? (
    <MoreOptionsButton handleOnPress={() => setShowMoreOptions(true)} />
  ) : (
    <>
      {(hasImagePicker || hasFilePicker) && ownCapabilities.uploadFile && (
        <View
          style={[hasCommands ? styles.attachButtonContainer : undefined, attachButtonContainer]}
        >
          <AttachButton handleOnPress={toggleAttachmentPicker} />
        </View>
      )}
      {hasCommands && !text && (
        <View style={commandsButtonContainer}>
          <CommandsButton handleOnPress={openCommandsPicker} />
        </View>
      )}
    </>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: InputButtonsWithContextProps<ErmisChatGenerics>,
  nextProps: InputButtonsWithContextProps<ErmisChatGenerics>,
) => {
  const {
    giphyActive: prevGiphyActive,
    hasCommands: prevHasCommands,
    hasFilePicker: prevHasFilePicker,
    hasImagePicker: prevHasImagePicker,
    selectedPicker: prevSelectedPicker,
    showMoreOptions: prevShowMoreOptions,
    text: prevText,
  } = prevProps;

  const {
    giphyActive: nextGiphyActive,
    hasCommands: nextHasCommands,
    hasFilePicker: nextHasFilePicker,
    hasImagePicker: nextHasImagePicker,
    selectedPicker: nextSelectedPicker,
    showMoreOptions: nextShowMoreOptions,
    text: nextText,
  } = nextProps;

  if (prevHasImagePicker !== nextHasImagePicker) {
    return false;
  }

  if (prevHasFilePicker !== nextHasFilePicker) {
    return false;
  }

  if (prevHasCommands !== nextHasCommands) {
    return false;
  }

  if (prevSelectedPicker !== nextSelectedPicker) {
    return false;
  }

  if (prevShowMoreOptions !== nextShowMoreOptions) {
    return false;
  }

  if ((!prevProps.text && nextText) || (prevText && !nextText)) {
    return false;
  }

  if (prevGiphyActive !== nextGiphyActive) {
    return false;
  }

  return true;
};

const MemoizedInputButtonsWithContext = React.memo(
  InputButtonsWithContext,
  areEqual,
) as typeof InputButtonsWithContext;

export const InputButtons = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: InputButtonsProps<ErmisChatGenerics>,
) => {
  const {
    AttachButton,
    CommandsButton,
    giphyActive,
    hasCommands,
    hasFilePicker,
    hasImagePicker,
    MoreOptionsButton,
    openCommandsPicker,
    selectedPicker,
    setShowMoreOptions,
    showMoreOptions,
    text,
    toggleAttachmentPicker,
  } = useMessageInputContext<ErmisChatGenerics>();

  return (
    <MemoizedInputButtonsWithContext
      {...{
        AttachButton,
        CommandsButton,
        giphyActive,
        hasCommands,
        hasFilePicker,
        hasImagePicker,
        MoreOptionsButton,
        openCommandsPicker,
        selectedPicker,
        setShowMoreOptions,
        showMoreOptions,
        text,
        toggleAttachmentPicker,
      }}
      {...props}
    />
  );
};
