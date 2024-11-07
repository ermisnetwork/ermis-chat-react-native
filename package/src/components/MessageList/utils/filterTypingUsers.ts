import type { ChatContextValue } from '../../../contexts/chatContext/ChatContext';
import type { ThreadContextValue } from '../../../contexts/threadContext/ThreadContext';
import type { TypingContextValue } from '../../../contexts/typingContext/TypingContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

type FilterTypingUsersParams<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<TypingContextValue<ErmisChatGenerics>, 'typing'> &
  Pick<ChatContextValue<ErmisChatGenerics>, 'client'> &
  Pick<ThreadContextValue<ErmisChatGenerics>, 'thread'>;

export const filterTypingUsers = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  client,
  thread,
  typing,
}: FilterTypingUsersParams<ErmisChatGenerics>) => {
  const nonSelfUsers: string[] = [];

  if (!client || !client.user || !typing) return nonSelfUsers;

  const typingKeys = Object.keys(typing);

  typingKeys.forEach((typingKey) => {

    if (!typing[typingKey]) return;
    const typingKeyUserId = typing[typingKey].user?.id || typingKey;

    /** removes own typing events */
    if (client.user?.id === typingKeyUserId) {
      return;
    }

    const isRegularEvent = !typing[typingKey].parent_id && !thread?.id;
    const isCurrentThreadEvent = typing[typingKey].parent_id === thread?.id;

    /** filters different threads events */
    if (!isRegularEvent && !isCurrentThreadEvent) {
      return;
    }

    //! Khoakheu: Done!!. Dont need update user info on typing event. just compare typing user id with user id on client state.
    const userName = client?.state?.users[typingKeyUserId]?.name || typing[typingKey].user?.name || typing[typingKey].user?.id;
    // const user = typing[typingKey].user?.name || typing[typingKey].user?.id;
    if (userName) {
      nonSelfUsers.push(userName);
    }
  });

  return nonSelfUsers;
};
