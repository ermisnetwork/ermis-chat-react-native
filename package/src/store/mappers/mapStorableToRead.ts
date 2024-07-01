import type { ReadResponse } from 'ermis-chat-sdk-test';

import { mapStorableToUser } from './mapStorableToUser';

import type { DefaultErmisChatGenerics } from '../../types/types';

import type { TableRowJoinedUser } from '../types';

export const mapStorableToRead = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  row: TableRowJoinedUser<'reads'>,
): ReadResponse<ErmisChatGenerics> => {
  const { lastRead, unreadMessages, user } = row;

  return {
    last_read: lastRead,
    unread_messages: unreadMessages,
    user: mapStorableToUser(user),
  };
};
