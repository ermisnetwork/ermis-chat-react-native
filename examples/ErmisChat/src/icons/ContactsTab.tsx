import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'ermis-chat-react-native';

import { IconProps } from '../utils/base';

export const ContactsTab: React.FC<IconProps> = ({ active, height = 24, width = 24 }) => {
    const {
        theme: {
            colors: { black, grey },
        },
    } = useTheme();

    return (
        <Svg fill='none' height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
            <Path
                d="M8.84 11.59C10.92 11.59 12.61 9.89998 12.61 7.81998C12.61 5.73998 10.92 4.04999 8.84 4.04999C6.76 4.04999 5.07001 5.73998 5.07001 7.81998C5.07001 9.89998 6.76 11.59 8.84 11.59Z"
                fill={active ? black : grey}
            />
            <Path
                d="M16.16 17.48V19.2C16.16 19.61 15.83 19.95 15.41 19.95H2.75C2.34 19.95 2 19.61 2 19.2V17.48C2 15.07 3.96 13.11 6.37 13.11H11.79C12.28 13.11 12.75 13.19 13.19 13.35C13.19 13.35 13.19 13.34 13.2 13.35C14.92 13.93 16.16 15.56 16.16 17.48Z"
                fill={active ? black : grey}
            />
            <Path
                d="M22 16.62V18.03C22 18.36 21.73 18.63 21.4 18.63H17.66V17.48C17.66 16.47 17.4 15.51 16.95 14.68C16.76 14.34 16.55 14.02 16.31 13.73C16.14 13.54 15.97 13.35 15.79 13.19H18.57C18.68 13.19 18.78 13.19 18.88 13.21C19.01 13.22 19.14 13.24 19.27 13.27C20.03 13.43 20.69 13.85 21.18 14.41C21.26 14.5 21.34 14.6 21.41 14.71C21.42 14.71 21.42 14.71 21.41 14.72C21.6 15 21.75 15.3 21.85 15.63C21.88 15.74 21.91 15.85 21.93 15.96C21.98 16.17 22 16.39 22 16.62Z"
                fill={active ? black : grey}
            />
            <Path
                d="M16.38 11.45C18.0314 11.45 19.37 10.1113 19.37 8.45997C19.37 6.80864 18.0314 5.46997 16.38 5.46997C14.7287 5.46997 13.39 6.80864 13.39 8.45997C13.39 10.1113 14.7287 11.45 16.38 11.45Z"
                fill={active ? black : grey}
            />
        </Svg>
    );
};