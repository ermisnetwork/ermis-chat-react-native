import type { DefaultErmisChatGenerics } from '../../../types/types';
import { MessageStatusTypes } from '../../../utils/utils';

import type { MessageType } from '../hooks/useMessageList';

export const getLastReceivedMessage = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  messages: MessageType<ErmisChatGenerics>[],
) => {
  /**
   * There are no status on dates so they will be skipped
   */
  for (const message of messages) {
    if (
      message?.status === MessageStatusTypes.RECEIVED ||
      message?.status === MessageStatusTypes.SENDING
    ) {
      return message;
    }
  }

  return;
};
