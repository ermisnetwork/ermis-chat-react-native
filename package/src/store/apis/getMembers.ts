import type { ChannelMemberResponse } from 'ermis-chat-sdk';

import { selectMembersForChannels } from './queries/selectMembersForChannels';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { mapStorableToMember } from '../mappers/mapStorableToMember';
import { QuickSqliteClient } from '../QuickSqliteClient';

export const getMembers = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channelIds,
}: {
  channelIds: string[];
}) => {
  QuickSqliteClient.logger?.('info', 'getMembers', { channelIds });
  const memberRows = selectMembersForChannels(channelIds);
  const cidVsMembers: Record<string, ChannelMemberResponse<ErmisChatGenerics>[]> = {};
  memberRows.forEach((member) => {
    if (!cidVsMembers[member.cid]) {
      cidVsMembers[member.cid] = [];
    }

    cidVsMembers[member.cid].push(mapStorableToMember<ErmisChatGenerics>(member));
  });

  return cidVsMembers;
};
