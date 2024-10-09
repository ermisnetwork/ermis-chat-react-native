import { useEffect, useState } from 'react';

import type { Channel, UserResponse } from 'ermis-chat-sdk';

import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useViewport } from '../../../hooks/useViewport';

import type { DefaultErmisChatGenerics } from '../../../types/types';

const ELLIPSIS = `...`;

const getMemberName = (member: UserResponse) => member.name || member.id || 'Unknown User';

export const getChannelPreviewDisplayName = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channelName,
  characterLimit,
  currentUserId,
  members,
}: {
  characterLimit: number;
  channelName?: string;
  currentUserId?: string;
  members?: UserResponse<ErmisChatGenerics>[];
}): string => {
  if (channelName) return channelName;
  if (!members) return 'Unknown Channel';

  const otherMembers = members.filter((member) => member.id !== currentUserId);

  otherMembers.sort((prevUser, nextUser) =>
    (prevUser?.name ?? '')
      .toLowerCase()
      .localeCompare((nextUser?.name ?? '').toLocaleUpperCase()),
  );
  const createChannelNameSuffix = (remainingNumberOfMembers: number) =>
    remainingNumberOfMembers <= 1 ? `${ELLIPSIS}` : `,${ELLIPSIS}+${remainingNumberOfMembers}`;

  if (otherMembers.length === 1) {
    const name = getMemberName(otherMembers[0]);
    return name.length > characterLimit
      ? `${name.slice(0, characterLimit - ELLIPSIS.length)}${ELLIPSIS}`
      : name;
  }

  const name = otherMembers.reduce((result, currentMember, index, originalArray) => {
    if (result.length >= characterLimit) {
      return result;
    }

    const currentMemberName = getMemberName(currentMember);

    const resultHasSpaceForCurrentMemberName =
      result.length + (currentMemberName.length + ELLIPSIS.length) < characterLimit;

    if (resultHasSpaceForCurrentMemberName) {
      return result.length > 0 ? `${result}, ${currentMemberName}` : `${currentMemberName}`;
    } else {
      const remainingNumberOfMembers = originalArray.length - index;
      const truncateLimit = characterLimit - (ELLIPSIS.length + result.length);
      const truncatedCurrentMemberName = `, ${currentMemberName.slice(0, truncateLimit)}`;

      const channelNameSuffix = createChannelNameSuffix(remainingNumberOfMembers);

      return `${result}${truncatedCurrentMemberName}${channelNameSuffix}`;
    }
  }, '');

  return name;
};

export const useChannelPreviewDisplayName = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  channel?: Channel<ErmisChatGenerics>,
  characterLength?: number,
) => {
  const { client } = useChatContext<ErmisChatGenerics>();
  const { vw } = useViewport();

  const DEFAULT_MAX_CHARACTER_LENGTH = (vw(100) - 16) / 6;
  // TODO: tối ưu get displayName(code lại hoàn toàn)
  const currentUserId = client?.userID;
  const channelName = channel?.data?.name;
  const characterLimit = characterLength || DEFAULT_MAX_CHARACTER_LENGTH;
  const channelMembers = Object.values(channel?.state?.members || {});
  const numOfMembers = channelMembers.length;

  const members = channelMembers.map((member) => {
    if (member.user?.id) {
      const user = client.state?.users[member.user?.id];
      if (user) {
        return user
      }
    }
    return member.user || { id: member.user_id } as UserResponse<ErmisChatGenerics>;
  });

  const [displayName, setDisplayName] = useState(
    getChannelPreviewDisplayName({
      channelName,
      characterLimit,
      currentUserId,
      members,
    }),
  );

  useEffect(() => {
    setDisplayName(
      getChannelPreviewDisplayName({
        channelName,
        characterLimit,
        currentUserId,
        members,
      }),
    );
  }, [channelName, currentUserId, characterLimit, numOfMembers]);

  return displayName;
};
