import uniqBy from 'lodash/uniqBy';
import type { Channel, ErmisChat } from 'ermis-chat-sdk-test';

import type { DefaultErmisChatGenerics } from '../../types/types';

type MoveParameters<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  channels: Channel<ErmisChatGenerics>[];
  cid: string;
};

export const moveChannelUp = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channels = [],
  cid,
}: MoveParameters<ErmisChatGenerics>) => {
  // get channel from channels
  const index = channels.findIndex((c) => c.cid === cid);
  if (index <= 0) return channels;
  const channel = channels[index];

  // remove channel from current position and add to start
  channels.splice(index, 1);
  channels.unshift(channel);

  return uniqBy([channel, ...channels], 'cid');
};

type GetParameters<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  client: ErmisChat<ErmisChatGenerics>;
  id: string;
  type: string;
};

export const getChannel = async <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  client,
  id,
  type,
}: GetParameters<ErmisChatGenerics>) => {
  const channel = client.channel(type, id);
  await channel.watch();
  return channel;
};

export const DEFAULT_QUERY_CHANNELS_LIMIT = 10;
export const MAX_QUERY_CHANNELS_LIMIT = 30;
