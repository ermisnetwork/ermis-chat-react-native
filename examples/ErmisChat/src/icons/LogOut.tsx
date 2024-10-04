import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from 'ermis-chat-react-native';

import { IconProps } from '../utils/base';

export const LogOut: React.FC<IconProps> = ({ fill, height, width, scale = 1 }) => {
    const {
        theme: {
            colors: { grey },
        },
    } = useTheme();

    return (
        <Svg
            fill='none'
            height={height * scale}
            viewBox={`0 0 ${height * scale} ${width * scale}`}
            width={width * scale}>
            <G scale={scale}>
                <Path
                    d="M8.66667 5.33333L11.3333 8M11.3333 8L8.66667 10.6667M11.3333 8L2 8M5.33333 5.33333V4.66666C5.33333 3.56209 6.22876 2.66666 7.33333 2.66666H12C13.1046 2.66666 14 3.56209 14 4.66666V11.3333C14 12.4379 13.1046 13.3333 12 13.3333H7.33333C6.22876 13.3333 5.33333 12.4379 5.33333 11.3333V10.6667"
                    stroke={fill || grey}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
        </Svg>
    );
};