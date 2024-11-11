import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';

import { VideoThumbnail } from '../../../components/Attachment/VideoThumbnail';
import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useViewport } from '../../../hooks/useViewport';
import type { DefaultErmisChatGenerics } from '../../../types/types';

import type { Photo } from '../ImageGallery';

const styles = StyleSheet.create({
  avatarImage: {
    borderRadius: 22,
    height: 22,
    width: 22,
  },
  avatarImageWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    height: 24,
    margin: 8,
    width: 24,
  },
  contentContainer: {
    flexGrow: 1,
  },
  image: {
    margin: 1,
  },
});

export type ImageGalleryGridImageComponent<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = ({
  item,
}: {
  item: Photo<ErmisChatGenerics> & {
    selectAndClose: () => void;
    numberOfImageGalleryGridColumns?: number;
  };
}) => React.ReactElement | null;

export type ImageGalleryGridImageComponents<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = {
  avatarComponent?: ImageGalleryGridImageComponent<ErmisChatGenerics>;
  imageComponent?: ImageGalleryGridImageComponent<ErmisChatGenerics>;
};

export type GridImageItem<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Photo<ErmisChatGenerics> &
  ImageGalleryGridImageComponents<ErmisChatGenerics> & {
    selectAndClose: () => void;
    numberOfImageGalleryGridColumns?: number;
  };

const GridImage = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  item,
}: {
  item: GridImageItem<ErmisChatGenerics>;
}) => {
  const {
    theme: {
      imageGallery: {
        grid: { gridImage },
      },
    },
  } = useTheme();
  const { vw } = useViewport();
  const { imageComponent, ...restItem } = item;

  const { numberOfImageGalleryGridColumns, selectAndClose, thumb_url, type, uri } = restItem;

  const size = vw(100) / (numberOfImageGalleryGridColumns || 3) - 2;

  if (imageComponent) {
    return imageComponent({ item: restItem });
  }

  return (
    <TouchableOpacity accessibilityLabel='Grid Image' onPress={selectAndClose}>
      {type === 'video' ? (
        <View style={[styles.image, { height: size, width: size }, gridImage]}>
          <VideoThumbnail thumb_url={thumb_url} />
        </View>
      ) : (
        <Image source={{ uri }} style={[styles.image, { height: size, width: size }]} />
      )}
    </TouchableOpacity>
  );
};

const renderItem = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  item,
}: {
  item: GridImageItem<ErmisChatGenerics>;
}) => <GridImage item={item} />;

export type ImageGridType<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = ImageGalleryGridImageComponents<ErmisChatGenerics> & {
  closeGridView: () => void;
  photos: Photo<ErmisChatGenerics>[];
  setSelectedMessage: React.Dispatch<
    React.SetStateAction<
      | {
        messageId?: string | undefined;
        url?: string | undefined;
      }
      | undefined
    >
  >;
  numberOfImageGalleryGridColumns?: number;
};

export const ImageGrid = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: ImageGridType<ErmisChatGenerics>,
) => {
  const {
    avatarComponent,
    closeGridView,
    imageComponent,
    numberOfImageGalleryGridColumns,
    photos,
    setSelectedMessage,
  } = props;

  const {
    theme: {
      colors: { white },
      imageGallery: {
        grid: { container, contentContainer },
      },
    },
  } = useTheme();

  const imageGridItems = photos.map((photo) => ({
    ...photo,
    avatarComponent,
    imageComponent,
    numberOfImageGalleryGridColumns,
    selectAndClose: () => {
      setSelectedMessage({ messageId: photo.messageId, url: photo.uri });
      closeGridView();
    },
  }));

  return (
    <BottomSheetFlatList<GridImageItem<ErmisChatGenerics>>
      accessibilityLabel='Image Grid'
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: white },
        contentContainer,
      ]}
      data={imageGridItems as GridImageItem<ErmisChatGenerics>[]}
      keyExtractor={(item, index) => `${item.uri}-${index}`}
      numColumns={numberOfImageGalleryGridColumns || 3}
      renderItem={renderItem}
      style={container}
    />
  );
};

ImageGrid.displayName = 'ImageGrid{imageGallery{grid}}';
