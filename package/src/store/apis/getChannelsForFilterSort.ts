import type { ChannelAPIResponse, ChannelFilters, ChannelSort } from 'ermis-chat-sdk-test';

import { getChannels } from './getChannels';
import { selectChannelIdsForFilterSort } from './queries/selectChannelIdsForFilterSort';

import type { DefaultErmisChatGenerics } from '../../types/types';

import { QuickSqliteClient } from '../QuickSqliteClient';

/**
 * Gets the channels from database for given filter and sort query.
 *
 * @param {Object} param
 * @param {string} param.currentUserId Id of current logged in user
 * @param {Object} param.filters Filters for channels https://getstream.io/chat/docs/javascript/query_channels/?language=javascript&q=su#query-parameters
 * @param {Object} param.sort Sort for channels https://getstream.io/chat/docs/javascript/query_channels/?language=javascript&q=su#query-parameters
 *
 * @returns Array of channels corresponding to filters & sort. Returns null if filters + sort query doesn't exist in "channelQueries" table.
 */
export const getChannelsForFilterSort = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  currentUserId,
  filters,
  sort,
}: {
  currentUserId: string;
  filters?: ChannelFilters<ErmisChatGenerics>;
  sort?: ChannelSort<ErmisChatGenerics>;
}): Omit<ChannelAPIResponse<ErmisChatGenerics>, 'duration'>[] | null => {
  if (!filters && !sort) {
    console.warn('Please provide the query (filters/sort) to fetch channels from DB');
    return null;
  }

  QuickSqliteClient.logger?.('info', 'getChannelsForFilterSort', { filters, sort });

  const channelIds = selectChannelIdsForFilterSort({ filters, sort });

  if (!channelIds) return null;

  if (channelIds.length === 0) {
    return [];
  }

  return getChannels({
    channelIds,
    currentUserId,
  });
};
