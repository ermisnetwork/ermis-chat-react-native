import Dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { ErmisChatGenerics } from '../types';

import type { Immutable } from 'seamless-immutable';
import type { UserResponse } from 'ermis-chat-sdk';

Dayjs.extend(relativeTime);

export const getUserActivityStatus = (
  user?: Immutable<UserResponse<ErmisChatGenerics>> | UserResponse<ErmisChatGenerics>,
) => {
  if (!user) {
    return '';
  }

  if (user.online) {
    return 'Online';
  }

  if (Dayjs(user.last_active).isBefore(Dayjs())) {
    return `Last seen ${Dayjs(user?.last_active).fromNow()}`;
  }

  return '';
};
