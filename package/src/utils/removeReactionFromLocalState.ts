import type { Channel, UserResponse } from 'ermis-chat-sdk';

import { deleteReaction } from '../store/apis/deleteReaction';

import type { DefaultErmisChatGenerics } from '../types/types';

export const removeReactionFromLocalState = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channel,
  messageId,
  reactionType,
  user,
}: {
  channel: Channel<ErmisChatGenerics>;
  messageId: string;
  reactionType: string;
  user: UserResponse<ErmisChatGenerics>;
}) => {
  const message = channel.state.messages.find(({ id }) => id === messageId);
  if (!message || !channel?.id || !user?.id) return;

  message.own_reactions = message.own_reactions?.filter(
    (reaction) => reaction.type !== reactionType,
  );
  message.latest_reactions = message.latest_reactions?.filter(
    (r) => !(r.user_id === user?.id && r.type === reactionType),
  );

  if (message.reaction_counts?.[reactionType]) {
    if (
      message.reaction_counts[reactionType] > 0
    ) {
      message.reaction_counts[reactionType] = Math.max(
        0,
        message.reaction_counts[reactionType] - 1,
      );
      if (
        message.reaction_counts[reactionType] === 0
      ) {
        delete message.reaction_counts[reactionType];
      }
    } else {
      delete message.reaction_counts[reactionType];
    }
  }

  deleteReaction({
    messageId,
    reactionType,
    userId: user.id,
  });
};
