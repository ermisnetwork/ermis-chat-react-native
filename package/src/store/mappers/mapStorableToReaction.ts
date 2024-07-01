import type { ReactionResponse } from 'ermis-chat-sdk-test';

import { mapStorableToUser } from './mapStorableToUser';

import type { DefaultErmisChatGenerics } from '../../types/types';

import type { TableRowJoinedUser } from '../types';

export const mapStorableToReaction = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  reactionRow: TableRowJoinedUser<'reactions'>,
): ReactionResponse<ErmisChatGenerics> => {
  const { createdAt, extraData, messageId, score, type, updatedAt, user } = reactionRow;

  return {
    created_at: createdAt,
    message_id: messageId,
    score,
    type,
    updated_at: updatedAt,
    user: mapStorableToUser(user),
    ...(extraData ? JSON.parse(extraData) : {}),
  };
};
