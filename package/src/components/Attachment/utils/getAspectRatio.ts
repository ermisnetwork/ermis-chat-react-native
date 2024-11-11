import type { Attachment } from 'ermis-chat-sdk';

import type { DefaultErmisChatGenerics } from '../../../types/types';

/**
 * Returns the aspect ratio of an image attachment.
 *
 * @param image Image attachment.
 * @returns {number}
 */
export function getAspectRatio<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(attachment: Attachment<ErmisChatGenerics>) {
  if (!(attachment.type === 'image' || attachment.type === 'video')) {
    throw new Error(
      'getAspectRatio() can only be called on an image attachment or video thumbnail',
    );
  }

  if (!attachment.original_width || !attachment.original_height) return 1;

  return attachment.original_width / attachment.original_height;
}
