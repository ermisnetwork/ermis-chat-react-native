import type { ChannelFilters, ChannelSort } from 'ermis-chat-sdk';

import type { DefaultErmisChatGenerics } from '../../../types/types';
import { QuickSqliteClient } from '../../QuickSqliteClient';
import { createSelectQuery } from '../../sqlite-utils/createSelectQuery';

import { convertFilterSortToQuery } from '../utils/convertFilterSortToQuery';

/**
 * Gets the channel ids from database for given filter and sort query.
 *
 * @param {Object} param
 * @param {Object} param.filters Filters for channels
 * @param {Object} param.sort Sort for channels
 *
 * @returns Array of channel ids corresponding to filters & sort. Returns null if filters + sort query doesn't exist in "channelQueries" table.
 */

export const selectChannelIdsForFilterSort = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  filters,
  sort,
}: {
  filters?: ChannelFilters<ErmisChatGenerics>;
  sort?: ChannelSort<ErmisChatGenerics>;
}): string[] | null => {
  const query = convertFilterSortToQuery({ filters, sort });

  QuickSqliteClient.logger?.('info', 'selectChannelIdsForFilterSort', {
    query,
  });

  const results = QuickSqliteClient.executeSql.apply(
    null,
    createSelectQuery('channelQueries', ['*'], {
      id: query,
    }),
  );

  const channelIdsStr = results?.[0]?.cids;
  return channelIdsStr ? JSON.parse(channelIdsStr) : null;
};
