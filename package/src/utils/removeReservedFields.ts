import type { MessageResponse } from 'ermis-chat-sdk-test';

import type { MessageType } from '../components/MessageList/hooks/useMessageList';
import type { DefaultErmisChatGenerics } from '../types/types';

export const removeReservedFields = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  message: MessageType<ErmisChatGenerics> | MessageResponse<ErmisChatGenerics>,
): MessageType<ErmisChatGenerics> | MessageResponse<ErmisChatGenerics> => {
  const retryMessage = { ...message };
  const reserved = [
    'cid',
    'config',
    'created_at',
    'created_by',
    'deleted_at',
    'i18n',
    'latest_reactions',
    'own_reactions',
    'reaction_counts',
    'reaction_groups',
    'last_message_at',
    'member_count',
    'message_text_updated_at',
    'type',
    'updated_at',
    'reply_count',
  ];
  reserved.forEach((key) => {
    delete retryMessage[key];
  });

  return retryMessage;
};
