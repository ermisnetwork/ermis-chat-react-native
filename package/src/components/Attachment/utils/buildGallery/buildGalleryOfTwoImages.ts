import type { Attachment } from 'ermis-chat-sdk';

import { buildThumbnailGrid } from './buildThumbnailGrid';

import type { GallerySizeAndThumbnailGrid, GallerySizeConfig } from './types';

import type { DefaultErmisChatGenerics } from '../../../../types/types';
import { getAspectRatio } from '../getAspectRatio';

export function buildGalleryOfTwoImages<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  images,
  sizeConfig,
}: {
  images: Attachment<ErmisChatGenerics>[];
  sizeConfig: GallerySizeConfig;
}): GallerySizeAndThumbnailGrid {
  const aspectRatio1 = getAspectRatio(images[0]);
  const aspectRatio2 = getAspectRatio(images[1]);

  // check if one image is landscape and other is portrait or vice versa
  const isLandscape1 = aspectRatio1 > 1;
  const isLandscape2 = aspectRatio2 > 1;

  // Both the images are landscape
  if (isLandscape1 && isLandscape2) {
    /**
     * ----------
     * |        |
     * ----------
     * |        |
     * ----------
     */
    return buildThumbnailGrid({
      grid: [[1], [1]],
      images,
      invertedDirections: true,
      sizeConfig,
    });
  }

  if (!isLandscape1 && !isLandscape2) {
    /**
     * -----------
     * |    |    |
     * |    |    |
     * |    |    |
     * |    |    |
     * -----------
     */
    return buildThumbnailGrid({
      grid: [[1, 1]],
      images,
      invertedDirections: true,
      sizeConfig,
    });
  }

  return buildThumbnailGrid({
    grid: [[2, 1]],
    images: isLandscape1 ? images : images.reverse(),
    invertedDirections: true,
    sizeConfig,
  });
}
