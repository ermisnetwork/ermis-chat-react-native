import type { ReadResponse } from 'ermis-chat-sdk';

import { selectReadsForChannels } from './queries/selectReadsForChannels';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { mapStorableToRead } from '../mappers/mapStorableToRead';
import { QuickSqliteClient } from '../QuickSqliteClient';

export const getReads = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channelIds,
}: {
  channelIds: string[];
}) => {
  QuickSqliteClient.logger?.('info', 'getReads', { channelIds });
  const reads = selectReadsForChannels(channelIds);
  const cidVsReads: Record<string, ReadResponse<ErmisChatGenerics>[]> = {};

  reads.forEach((read) => {
    if (!cidVsReads[read.cid]) {
      cidVsReads[read.cid] = [];
    }
    cidVsReads[read.cid].push(mapStorableToRead<ErmisChatGenerics>(read));
  });

  return cidVsReads;
};
