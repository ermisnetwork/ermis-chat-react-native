import React from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, CircleProps } from 'react-native-svg';

import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useLoadingImage } from '../../hooks/useLoadingImage';
import { getResizedImageUrl } from '../../utils/getResizedImageUrl';
import { Camera } from '../../icons';

const randomImageBaseUrl = '';
const randomSvgBaseUrl = '';
const ermisCDN = '';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presenceIndicatorContainer: {
    height: 12,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 4,

  }
});

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join(' ');

export type AvatarProps = {
  /** size in pixels */
  size: number;
  containerStyle?: StyleProp<ViewStyle>;
  /** image url */
  image?: string;
  ImageComponent?: React.ComponentType<ImageProps>;
  /** name of the picture, used for fallback */
  imageStyle?: StyleProp<ImageStyle>;
  name?: string;
  online?: boolean;
  presenceIndicator?: CircleProps;
  presenceIndicatorContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  upload?: boolean;
  onPress?: () => void;
  id?: string;
};

/**
 * Avatar - A round avatar image with fallback to user's initials.
 */
export const Avatar = (props: AvatarProps) => {
  const {
    containerStyle,
    image: imageProp,
    ImageComponent = Image,
    imageStyle,
    name,
    online,
    presenceIndicator: presenceIndicatorProp,
    presenceIndicatorContainerStyle,
    size,
    testID,
    upload = false,
    onPress,
    id
  } = props;
  const {
    theme: {
      avatar: { container, image, presenceIndicator, presenceIndicatorContainer },
      colors: { accent_green, white, grey },
    },
  } = useTheme();

  const { isLoadingImageError, setLoadingImageError } = useLoadingImage();

  const initialFirstNameChar = name ? name?.charAt(0).toUpperCase() : id?.charAt(0).toUpperCase();

  const getRandomColor = () => {
    const colors = ['#FF5733', '#3357FF', '#FF33A1', '#FFC300', '#C70039', '#900C3F'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  return (
    <TouchableOpacity disabled={!upload} activeOpacity={0.8} onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            borderRadius: size / 2,
            height: size,
            width: size,
          },
          container,
          containerStyle,
        ]}
      >
        {isLoadingImageError ? (
          <View
            style={{
              backgroundColor: getRandomColor(),
              borderRadius: size / 2,
              height: size,
              width: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: size / 2,
              textAlign: 'center',
            }}>{initialFirstNameChar}</Text>
          </View>
        ) : (
          <ImageComponent
            accessibilityLabel={testID || 'Avatar Image'}
            onError={() => setLoadingImageError(true)}
            source={{
              uri:
                !imageProp ||
                  imageProp.includes(randomImageBaseUrl) ||
                  imageProp.includes(randomSvgBaseUrl)
                  ? imageProp?.includes(ermisCDN)
                    ? imageProp
                    : `${randomImageBaseUrl}${name ? `?name=${getInitials(name)}&size=${size}` : ''
                    }`
                  : getResizedImageUrl({
                    height: size,
                    url: imageProp,
                    width: size,
                  }),
            }}
            style={[
              image,
              size
                ? {
                  backgroundColor: '#ececec',
                  borderRadius: size / 2,
                  height: size,
                  width: size,
                }
                : {},
              imageStyle,
            ]}
            testID={testID || 'avatar-image'}
          />
        )}
      </View>
      {online && (
        <View
          style={[
            styles.presenceIndicatorContainer,
            presenceIndicatorContainer,
            presenceIndicatorContainerStyle,
          ]}
        >
          <Svg>
            <Circle
              fill={accent_green}
              stroke={white}
              {...presenceIndicator}
              {...presenceIndicatorProp}
            />
          </Svg>
        </View>
      )}
      {
        upload && (
          <View style={[{
            backgroundColor: white,
          }, styles.camera]}>
            <Svg>
              <Camera
                pathFill={grey}
                width={40}
                height={40}
              />
            </Svg>
          </View>
        )
      }
    </TouchableOpacity>
  );
};

Avatar.displayName = 'Avatar{avatar}';
