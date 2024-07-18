import { ComponentType, useMemo } from 'react';

import { ReactionResponse } from 'ermis-chat-sdk';

import {
  MessagesContextValue,
  useMessagesContext,
} from '../../../contexts/messagesContext/MessagesContext';
import { DefaultErmisChatGenerics } from '../../../types/types';
import { ReactionData } from '../../../utils/utils';
import { ReactionListProps } from '../MessageSimple/ReactionList';

export type ReactionSummary = {
  own: boolean;
  type: string;
  count?: number;
  firstReactionAt?: Date | null;
  Icon?: ComponentType | null;
  lastReactionAt?: Date | null;
  latestReactedUserNames?: string[];
  unlistedReactedUserCount?: number;
};

export type ReactionsComparator = (a: ReactionSummary, b: ReactionSummary) => number;

type UseProcessReactionsParams<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  ReactionListProps<ErmisChatGenerics>,
  'own_reactions' | 'reaction_counts' | 'latest_reactions'
> &
  Partial<Pick<MessagesContextValue<ErmisChatGenerics>, 'supportedReactions'>> & {
    sortReactions?: ReactionsComparator;
  };

export const defaultReactionsSort: ReactionsComparator = (a, b) => {
  if (a.firstReactionAt && b.firstReactionAt) {
    return +a.firstReactionAt - +b.firstReactionAt;
  }

  return a.type.localeCompare(b.type, 'en');
};

const isOwnReaction = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  reactionType: string,
  ownReactions?: ReactionResponse<ErmisChatGenerics>[] | null,
) => (ownReactions ? ownReactions.some((reaction) => reaction.type === reactionType) : false);

const isSupportedReaction = (reactionType: string, supportedReactions: ReactionData[]) =>
  supportedReactions
    ? supportedReactions.some((reactionOption) => reactionOption.type === reactionType)
    : false;

const getEmojiByReactionType = (reactionType: string, supportedReactions: ReactionData[]) =>
  supportedReactions.find(({ type }) => type === reactionType)?.Icon ?? null;

const getLatestReactedUserNames = (reactionType: string, latestReactions?: ReactionResponse[]) =>
  latestReactions
    ? latestReactions.flatMap((reaction) => {
      if (reactionType && reactionType === reaction.type) {
        const username = reaction.user?.name || reaction.user?.id;
        return username ? [username] : [];
      }
      return [];
    })
    : [];

/**
 * Custom hook to process reactions data from message and return a list of reactions with additional info.
 */
export const useProcessReactions = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: UseProcessReactionsParams<ErmisChatGenerics>,
) => {
  const { supportedReactions: contextSupportedReactions } = useMessagesContext();

  const {
    latest_reactions,
    own_reactions,
    reaction_counts,
    sortReactions = defaultReactionsSort,
    supportedReactions = contextSupportedReactions,
  } = props;

  return useMemo(() => {
    if (!reaction_counts)
      return { existingReactions: [], hasReactions: false, totalReactionCount: 0 };
    const unsortedReactions = Object.entries(reaction_counts).flatMap(
      ([reactionType, count]) => {
        if (count === 0 || !isSupportedReaction(reactionType, supportedReactions)) return [];

        const latestReactedUserNames = getLatestReactedUserNames(reactionType, latest_reactions);

        return {
          count,
          Icon: getEmojiByReactionType(reactionType, supportedReactions),
          latestReactedUserNames,
          own: isOwnReaction<ErmisChatGenerics>(reactionType, own_reactions),
          type: reactionType,
          unlistedReactedUserCount: count - latestReactedUserNames.length,
        };
      },
    );

    return {
      existingReactions: unsortedReactions.sort(sortReactions),
      hasReactions: unsortedReactions.length > 0,
      totalReactionCount: unsortedReactions.reduce((total, { count }) => total + count, 0),
    };
  }, [reaction_counts, own_reactions?.length, latest_reactions?.length, sortReactions]);
};
