import type { ChannelMemberResponse } from 'ermis-chat-sdk';

import { mapDateTimeToStorable } from './mapDateTimeToStorable';

import type { DefaultErmisChatGenerics } from '../../types/types';
import type { TableRow } from '../types';

export const mapMemberToStorable = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  cid,
  member,
}: {
  cid: string;
  member: ChannelMemberResponse<ErmisChatGenerics>;
}): TableRow<'members'> => {
  const {
    banned,
    channel_role,
    created_at,
    invite_accepted_at,
    invite_rejected_at,
    invited,
    is_moderator,
    role,
    shadow_banned,
    updated_at,
    user_id,
  } = member;

  return {
    banned,
    channelRole: channel_role,
    cid,
    createdAt: mapDateTimeToStorable(created_at),
    inviteAcceptedAt: invite_accepted_at,
    invited,
    inviteRejectedAt: invite_rejected_at,
    isModerator: is_moderator,
    role,
    shadowBanned: shadow_banned,
    updatedAt: mapDateTimeToStorable(updated_at),
    userId: user_id,
  };
};
