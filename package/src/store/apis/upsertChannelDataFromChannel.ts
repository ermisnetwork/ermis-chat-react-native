import type { Channel } from 'ermis-chat-sdk-test';

import { DefaultErmisChatGenerics } from '../../types/types';
import { mapChannelToStorable } from '../mappers/mapChannelToStorable';
import { QuickSqliteClient } from '../QuickSqliteClient';
import { createUpsertQuery } from '../sqlite-utils/createUpsertQuery';

export const upsertChannelDataFromChannel = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channel,
  flush = true,
}: {
  channel: Channel<ErmisChatGenerics>;
  flush?: boolean;
}) => {
  const storableChannel = mapChannelToStorable(channel);
  if (!storableChannel) return;
  const query = createUpsertQuery('channels', storableChannel);
  if (flush) {
    QuickSqliteClient.executeSqlBatch([query]);
  }

  return [query];
};
