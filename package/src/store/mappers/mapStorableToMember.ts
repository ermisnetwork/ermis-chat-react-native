import type { ChannelMemberResponse } from 'ermis-chat-sdk';

import { mapStorableToUser } from './mapStorableToUser';

import type { DefaultErmisChatGenerics } from '../../types/types';
import type { TableRowJoinedUser } from '../types';

export const mapStorableToMember = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  memberRow: TableRowJoinedUser<'members'>,
): ChannelMemberResponse<ErmisChatGenerics> => {
  const {
    banned,
    channelRole,
    createdAt,
    inviteAcceptedAt,
    invited,
    inviteRejectedAt,
    isModerator,
    role,
    shadowBanned,
    updatedAt,
    user,
    userId,
  } = memberRow;

  return {
    banned,
    channel_role: channelRole,
    created_at: createdAt,
    invite_accepted_at: inviteAcceptedAt,
    invite_rejected_at: inviteRejectedAt,
    invited,
    is_moderator: isModerator,
    role,
    shadow_banned: shadowBanned,
    updated_at: updatedAt,
    user: mapStorableToUser(user),
    user_id: userId,
  };
};
