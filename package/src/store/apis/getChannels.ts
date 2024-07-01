import type { ChannelAPIResponse } from 'ermis-chat-sdk-test';

import { getChannelMessages } from './getChannelMessages';
import { getMembers } from './getMembers';
import { getReads } from './getReads';
import { selectChannels } from './queries/selectChannels';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { mapStorableToChannel } from '../mappers/mapStorableToChannel';
import { QuickSqliteClient } from '../QuickSqliteClient';

/**
 * Returns the list of channels with state enriched for given channel ids.
 *
 * @param {Object} param
 * @param {Array} param.channelIds List of channel ids to fetch.
 * @param {Array} param.currentUserId Id of the current logged in user.
 *
 * @returns {Array} Channels with enriched state.
 */
export const getChannels = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channelIds,
  currentUserId,
}: {
  channelIds: string[];
  currentUserId: string;
}): Omit<ChannelAPIResponse<ErmisChatGenerics>, 'duration'>[] => {
  QuickSqliteClient.logger?.('info', 'getChannels', { channelIds, currentUserId });
  const channels = selectChannels({ channelIds });

  const cidVsMembers = getMembers<ErmisChatGenerics>({ channelIds });
  const cidVsReads = getReads<ErmisChatGenerics>({ channelIds });
  const cidVsMessages = getChannelMessages<ErmisChatGenerics>({
    channelIds,
    currentUserId,
  });

  // Enrich the channels with state
  return channels.map((c) => ({
    ...mapStorableToChannel<ErmisChatGenerics>(c),
    members: cidVsMembers[c.cid],
    messages: cidVsMessages[c.cid],
    pinned_messages: [],
    read: cidVsReads[c.cid],
  }));
};
