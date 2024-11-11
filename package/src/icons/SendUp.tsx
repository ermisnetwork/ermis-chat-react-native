import React from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from './utils/base';

type Props = IconProps & {
  size: number;
};

export const SendUp = ({ size, ...rest }: Props) => (
  <Svg height={32} viewBox={`0 0 ${32} ${32}`} width={32} {...rest}>
    <Circle cx={32 / 2} cy={32 / 2} r={32 / 2} {...rest} />
    <Path
      clipRule='evenodd'
      d='M14.6673 16V22.6667H17.334V16H22.6673L16.0007 9.33337L9.33398 16H14.6673Z'
      fill={'white'}
      fillRule='evenodd'
    />
  </Svg>
);
