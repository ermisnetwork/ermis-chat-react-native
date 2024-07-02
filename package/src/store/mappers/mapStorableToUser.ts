import type { UserResponse } from 'ermis-chat-sdk';

import type { DefaultErmisChatGenerics } from '../../types/types';
import type { TableRow } from '../types';

export const mapStorableToUser = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  userRow: TableRow<'users'>,
): UserResponse<ErmisChatGenerics> => {
  const { banned, createdAt, extraData, id, lastActive, online, role, updatedAt } = userRow;

  return {
    banned: Boolean(banned),
    created_at: createdAt,
    id,
    last_active: lastActive,
    online: Boolean(online),
    role,
    updated_at: updatedAt,
    ...(extraData ? JSON.parse(extraData) : {}),
  };
};
