import React, { useEffect, useRef, useState } from 'react';
import { I18nManager, StyleSheet, TextInput, TextInputProps } from 'react-native';

import throttle from 'lodash/throttle';

import {
  ChannelContextValue,
  useChannelContext,
} from '../../contexts/channelContext/ChannelContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../contexts/messageInputContext/MessageInputContext';
import {
  isSuggestionCommand,
  isSuggestionEmoji,
  isSuggestionUser,
  Suggestion,
  SuggestionCommand,
  SuggestionsContextValue,
  SuggestionUser,
  useSuggestionsContext,
} from '../../contexts/suggestionsContext/SuggestionsContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import {
  TranslationContextValue,
  useTranslationContext,
} from '../../contexts/translationContext/TranslationContext';
import type { Emoji } from '../../emoji-data';
import type { DefaultErmisChatGenerics } from '../../types/types';
import { isCommandTrigger, isEmojiTrigger, isMentionTrigger } from '../../utils/utils';

import type { Trigger } from '../../utils/utils';

const styles = StyleSheet.create({
  inputBox: {
    flex: 1,
    fontSize: 14,
    includeFontPadding: false, // for android vertical text centering
    padding: 0, // removal of default text input padding on android
    paddingTop: 0, // removal of iOS top padding for weird centering
    textAlignVertical: 'center', // for android vertical text centering
  },
});

const computeCaretPosition = (token: string, startOfTokenPosition: number) =>
  startOfTokenPosition + token.length;

const isCommand = (text: string) => text[0] === '/' && text.split(' ').length <= 1;

type AutoCompleteInputPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<ChannelContextValue<ErmisChatGenerics>, 'giphyEnabled'> &
  Pick<
    MessageInputContextValue<ErmisChatGenerics>,
    | 'additionalTextInputProps'
    | 'autoCompleteSuggestionsLimit'
    | 'giphyActive'
    | 'maxMessageLength'
    | 'mentionAllAppUsersEnabled'
    | 'mentionAllAppUsersQuery'
    | 'numberOfLines'
    | 'onChange'
    | 'setGiphyActive'
    | 'setInputBoxRef'
    | 'text'
    | 'triggerSettings'
  > &
  Pick<
    SuggestionsContextValue<ErmisChatGenerics>,
    'closeSuggestions' | 'openSuggestions' | 'updateSuggestions'
  > &
  Pick<TranslationContextValue, 't'> & {
    /**
     * This is currently passed in from MessageInput to avoid rerenders
     * that would happen if we put this in the MessageInputContext
     */
    cooldownActive?: boolean;
  };

export type AutoCompleteInputProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Partial<AutoCompleteInputPropsWithContext<ErmisChatGenerics>>;

const AutoCompleteInputWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AutoCompleteInputPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    additionalTextInputProps,
    autoCompleteSuggestionsLimit,
    closeSuggestions,
    cooldownActive = false,
    giphyActive,
    giphyEnabled,
    maxMessageLength,
    mentionAllAppUsersEnabled,
    mentionAllAppUsersQuery,
    numberOfLines,
    onChange,
    openSuggestions,
    setGiphyActive,
    setInputBoxRef,
    t,
    text,
    triggerSettings,
    updateSuggestions: updateSuggestionsContext,
  } = props;

  const isTrackingStarted = useRef(false);
  const selectionEnd = useRef(0);
  const [textHeight, setTextHeight] = useState(0);

  const {
    theme: {
      colors: { black, grey },
      messageInput: { inputBox },
    },
  } = useTheme();

  const handleChange = async (newText: string, fromUpdate = false) => {
    if (!fromUpdate) {
      onChange(newText);
    } else {
      await handleSuggestionsThrottled(newText);
    }
  };

  useEffect(() => {
    handleChange(text, true);
  }, [text]);

  const startTracking = (trigger: Trigger) => {
    const triggerSetting = triggerSettings[trigger];
    if (triggerSetting) {
      isTrackingStarted.current = true;
      const { type } = triggerSetting;
      openSuggestions(type);
    }
  };

  const stopTracking = () => {
    isTrackingStarted.current = false;
    closeSuggestions();
  };

  const updateSuggestions = async ({
    query,
    trigger,
  }: {
    query: Suggestion['name'];
    trigger: Trigger;
  }) => {
    if (isMentionTrigger(trigger)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        await triggerSetting.dataProvider(
          query as SuggestionUser<ErmisChatGenerics>['name'],
          text,
          (data, queryCallback) => {
            if (query === queryCallback) {
              updateSuggestionsContext({
                data,
                onSelect: (item) => onSelectSuggestion({ item, trigger }),
                queryText: query,
              });
            }
          },
          {
            limit: autoCompleteSuggestionsLimit,
            mentionAllAppUsersEnabled,
            mentionAllAppUsersQuery,
          },
        );
      }
    } else if (isCommandTrigger(trigger)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        await triggerSetting.dataProvider(
          query as SuggestionCommand<ErmisChatGenerics>['name'],
          text,
          (data, queryCallback) => {
            if (query !== queryCallback) {
              return;
            }

            updateSuggestionsContext({
              data,
              onSelect: (item) => onSelectSuggestion({ item, trigger }),
              queryText: query,
            });
          },
          {
            limit: autoCompleteSuggestionsLimit,
          },
        );
      }
    } else {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        await triggerSetting.dataProvider(query as Emoji['name'], text, (data, queryCallback) => {
          if (query !== queryCallback) {
            return;
          }

          updateSuggestionsContext({
            data,
            onSelect: (item) => onSelectSuggestion({ item, trigger }),
            queryText: query,
          });
        });
      }
    }
  };

  const handleSelectionChange: TextInputProps['onSelectionChange'] = ({
    nativeEvent: {
      selection: { end },
    },
  }) => {
    selectionEnd.current = end;
  };

  const onSelectSuggestion = ({
    item,
    trigger,
  }: {
    item: Suggestion<ErmisChatGenerics>;
    trigger: Trigger;
  }) => {
    if (!trigger || !triggerSettings[trigger]) {
      return;
    }

    let newTokenString = '';
    if (isCommandTrigger(trigger) && isSuggestionCommand(item)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        newTokenString = `${triggerSetting.output(item).text} `;
      }
    }
    if (isEmojiTrigger(trigger) && isSuggestionEmoji(item)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        newTokenString = `${triggerSetting.output(item).text} `;
      }
    }
    if (isMentionTrigger(trigger) && isSuggestionUser(item)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        newTokenString = `${triggerSetting.output(item).text} `;
      }
    }

    const textToModify = text.slice(0, selectionEnd.current);

    const startOfTokenPosition = textToModify.lastIndexOf(trigger, selectionEnd.current);

    const newCaretPosition = computeCaretPosition(newTokenString, startOfTokenPosition);

    const modifiedText = `${textToModify.substring(0, startOfTokenPosition)}${newTokenString}`;

    stopTracking();

    const newText = text.replace(textToModify, modifiedText);

    if (giphyEnabled && newText.startsWith('/giphy ')) {
      onChange(newText.slice(7)); // 7 because of '/giphy ' length
      setGiphyActive(true);
    } else {
      onChange(newText);
    }

    selectionEnd.current = newCaretPosition || 0;

    if (isMentionTrigger(trigger) && isSuggestionUser(item)) {
      const triggerSetting = triggerSettings[trigger];
      if (triggerSetting) {
        triggerSetting.callback(item);
      }
    }
  };

  const handleCommand = async (text: string) => {
    if (!isCommand(text)) {
      return false;
    }

    if (!isTrackingStarted.current) {
      startTracking('/');
    }
    const actualToken = text.trim().slice(1);
    await updateSuggestions({ query: actualToken, trigger: '/' });

    return true;
  };

  const handleMentions = async ({ tokenMatch }: { tokenMatch: RegExpMatchArray | null }) => {
    const lastToken = tokenMatch?.[tokenMatch.length - 1];
    const handleMentionsTrigger =
      (lastToken && Object.keys(triggerSettings).find((trigger) => trigger === lastToken[0])) ||
      null;

    /*
      if we lost the trigger token or there is no following character we want to close
      the autocomplete
    */
    if (!lastToken || lastToken.length <= 0) {
      stopTracking();
      return;
    }

    const actualToken = lastToken.slice(1);

    // if trigger is not configured step out from the function, otherwise proceed
    if (!handleMentionsTrigger) {
      return;
    }

    if (!isTrackingStarted.current) {
      startTracking('@');
    }

    await updateSuggestions({ query: actualToken, trigger: '@' });
  };

  const handleEmojis = async ({ tokenMatch }: { tokenMatch: RegExpMatchArray | null }) => {
    const lastToken = tokenMatch?.[tokenMatch.length - 1].trim();
    const handleEmojisTrigger =
      (lastToken && Object.keys(triggerSettings).find((trigger) => trigger === lastToken[0])) ||
      null;

    /*
      if we lost the trigger token or there is no following character we want to close
      the autocomplete
    */
    if (!lastToken || lastToken.length <= 0) {
      stopTracking();
      return;
    }

    const actualToken = lastToken.slice(1);

    // if trigger is not configured step out from the function, otherwise proceed
    if (!handleEmojisTrigger) {
      return;
    }

    if (!isTrackingStarted.current) {
      startTracking(':');
    }

    await updateSuggestions({ query: actualToken, trigger: ':' });
  };

  const handleSuggestions = async (text: string) => {
    if (text === undefined) return;
    if (
      /\s/.test(text.slice(selectionEnd.current - 1, selectionEnd.current)) &&
      isTrackingStarted.current
    ) {
      stopTracking();
    } else if (!(await handleCommand(text))) {
      const mentionTokenMatch = text
        .slice(0, selectionEnd.current)
        .match(/(?!^|\W)?@[^\s@]*\s?[^\s@]*$/g);
      if (mentionTokenMatch) {
        await handleMentions({ tokenMatch: mentionTokenMatch });
      } else {
        const emojiTokenMatch = text
          .slice(0, selectionEnd.current)
          .match(/(?!^|\W)?:\w{2,}[^\s]*\s?[^\s]*$/g);
        await handleEmojis({ tokenMatch: emojiTokenMatch });
      }
    }
  };

  const placeholderText = giphyActive
    ? t('Search GIFs')
    : cooldownActive
      ? t('Slow mode ON')
      : t('Send a message');

  const handleSuggestionsThrottled = throttle(handleSuggestions, 100, {
    leading: false,
  });

  return (
    <TextInput
      autoFocus={giphyActive}
      maxLength={maxMessageLength}
      multiline
      onChangeText={async (newText) => {
        if (giphyEnabled && newText && newText.startsWith('/giphy ')) {
          await handleChange(newText.slice(7)); // 7 because of '/giphy' length
          setGiphyActive(true);
        } else {
          await handleChange(newText);
        }
      }}
      onContentSizeChange={({
        nativeEvent: {
          contentSize: { height },
        },
      }) => {
        if (!textHeight) {
          setTextHeight(height);
        }
      }}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholderText}
      placeholderTextColor={grey}
      ref={setInputBoxRef}
      style={[
        styles.inputBox,
        {
          color: black,
          maxHeight: (textHeight || 17) * numberOfLines,
          textAlign: I18nManager.isRTL ? 'right' : 'left',
        },
        inputBox,
      ]}
      testID='auto-complete-text-input'
      value={text}
      {...additionalTextInputProps}
    />
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: AutoCompleteInputPropsWithContext<ErmisChatGenerics>,
  nextProps: AutoCompleteInputPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    cooldownActive: prevCooldownActive,
    giphyActive: prevGiphyActive,
    t: prevT,
    text: prevText,
  } = prevProps;
  const {
    cooldownActive: nextCooldownActive,
    giphyActive: nextGiphyActive,
    t: nextT,
    text: nextText,
  } = nextProps;

  const giphyActiveEqual = prevGiphyActive === nextGiphyActive;
  if (!giphyActiveEqual) return false;

  const tEqual = prevT === nextT;
  if (!tEqual) return false;

  const textEqual = prevText === nextText;
  if (!textEqual) return false;

  const cooldownActiveEqual = prevCooldownActive === nextCooldownActive;
  if (!cooldownActiveEqual) return false;

  return true;
};

const MemoizedAutoCompleteInput = React.memo(
  AutoCompleteInputWithContext,
  areEqual,
) as typeof AutoCompleteInputWithContext;

export const AutoCompleteInput = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AutoCompleteInputProps<ErmisChatGenerics>,
) => {
  const { giphyEnabled } = useChannelContext<ErmisChatGenerics>();
  const {
    additionalTextInputProps,
    autoCompleteSuggestionsLimit,
    giphyActive,
    maxMessageLength,
    mentionAllAppUsersEnabled,
    mentionAllAppUsersQuery,
    numberOfLines,
    onChange,
    setGiphyActive,
    setInputBoxRef,
    text,
    triggerSettings,
  } = useMessageInputContext<ErmisChatGenerics>();
  const { closeSuggestions, openSuggestions, updateSuggestions } =
    useSuggestionsContext<ErmisChatGenerics>();
  const { t } = useTranslationContext();

  return (
    <MemoizedAutoCompleteInput
      {...{
        additionalTextInputProps,
        autoCompleteSuggestionsLimit,
        closeSuggestions,
        giphyActive,
        giphyEnabled,
        maxMessageLength,
        mentionAllAppUsersEnabled,
        mentionAllAppUsersQuery,
        numberOfLines,
        onChange,
        openSuggestions,
        setGiphyActive,
        setInputBoxRef,
        t,
        text,
        triggerSettings,
        updateSuggestions,
      }}
      {...props}
    />
  );
};

AutoCompleteInput.displayName = 'AutoCompleteInput{messageInput{inputBox}}';
