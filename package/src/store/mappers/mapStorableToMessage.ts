import type { MessageResponse } from 'ermis-chat-sdk';

import { mapStorableToReaction } from './mapStorableToReaction';

import { mapStorableToUser } from './mapStorableToUser';

import type { DefaultErmisChatGenerics } from '../../types/types';

import type { TableRowJoinedUser } from '../types';

export const mapStorableToMessage = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  currentUserId,
  messageRow,
  reactionRows,
}: {
  currentUserId: string;
  messageRow: TableRowJoinedUser<'messages'>;
  reactionRows: TableRowJoinedUser<'reactions'>[];
}): MessageResponse<ErmisChatGenerics> => {
  const {
    createdAt,
    deletedAt,
    extraData,
    messageTextUpdatedAt,
    reactionCounts,
    updatedAt,
    user,
    ...rest
  } = messageRow;
  const latestReactions =
    reactionRows?.map((reaction) => mapStorableToReaction<ErmisChatGenerics>(reaction)) || [];

  const ownReactions = latestReactions.filter((reaction) => reaction.user?.id === currentUserId);

  return {
    ...rest,
    attachments: messageRow.attachments ? JSON.parse(messageRow.attachments) : [],
    created_at: createdAt,
    deleted_at: deletedAt,
    latest_reactions: latestReactions,
    message_text_updated_at: messageTextUpdatedAt,
    own_reactions: ownReactions,
    reaction_counts: reactionCounts ? JSON.parse(reactionCounts) : {},
    updated_at: updatedAt,
    user: mapStorableToUser(user),
    ...(extraData ? JSON.parse(extraData) : {}),
  };
};
