import type { ReadResponse } from 'ermis-chat-sdk';

import { mapDateTimeToStorable } from './mapDateTimeToStorable';

import type { DefaultErmisChatGenerics } from '../../types/types';
import type { TableRow } from '../types';

export const mapReadToStorable = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  cid,
  read,
}: {
  cid: string;
  read: ReadResponse<ErmisChatGenerics>;
}): TableRow<'reads'> => {
  const { last_read, unread_messages, user } = read;

  return {
    cid,
    lastRead: mapDateTimeToStorable(last_read),
    unreadMessages: unread_messages,
    userId: user?.id,
  };
};
