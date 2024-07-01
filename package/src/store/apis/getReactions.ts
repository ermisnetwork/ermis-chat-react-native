import type { ReactionResponse } from 'ermis-chat-sdk-test';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { mapStorableToReaction } from '../mappers/mapStorableToReaction';
import { QuickSqliteClient } from '../QuickSqliteClient';
import { TableRowJoinedUser } from '../types';

export const getReactions = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  reactions,
}: {
  reactions: TableRowJoinedUser<'reactions'>[];
}): ReactionResponse<ErmisChatGenerics>[] => {
  QuickSqliteClient.logger?.('info', 'getReactions', { reactions });

  // Enrich the channels with state
  return reactions.map((reaction) => ({
    ...mapStorableToReaction<ErmisChatGenerics>(reaction),
  }));
};
