import type { ChannelFilters, ChannelSort } from 'ermis-chat-sdk-test';

import type { DefaultErmisChatGenerics } from '../../../types/types';

export const convertFilterSortToQuery = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  filters,
  sort,
}: {
  filters?: ChannelFilters<ErmisChatGenerics>;
  sort?: ChannelSort<ErmisChatGenerics>;
}) =>
  JSON.stringify(`${filters ? JSON.stringify(filters) : ''}-${sort ? JSON.stringify(sort) : ''}`);
