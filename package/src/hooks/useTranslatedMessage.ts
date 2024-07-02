import type { FormatMessageResponse, MessageResponse, TranslationLanguages } from 'ermis-chat-sdk';

import { useMessageOverlayContext } from '../contexts/messageOverlayContext/MessageOverlayContext';
import { useTranslationContext } from '../contexts/translationContext/TranslationContext';
import type { DefaultErmisChatGenerics } from '../types/types';

type TranslationKey = `${TranslationLanguages}_text`;

export const useTranslatedMessage = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  message?: MessageResponse<ErmisChatGenerics> | FormatMessageResponse<ErmisChatGenerics>,
) => {
  const { userLanguage: translationContextUserLanguage } = useTranslationContext();
  const messageOverlayContextValue = useMessageOverlayContext<ErmisChatGenerics>();

  const userLanguage =
    messageOverlayContextValue.data?.userLanguage || translationContextUserLanguage;

  const translationKey: TranslationKey = `${userLanguage}_text`;

  if (!message) return undefined;

  if (message.i18n && translationKey in message.i18n && message.type !== 'deleted') {
    return {
      ...message,
      text: message.i18n[translationKey],
    };
  }

  return { ...message };
};
