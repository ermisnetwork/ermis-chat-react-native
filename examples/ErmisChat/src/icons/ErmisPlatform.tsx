import React from 'react';
import Svg, { Ellipse, Rect, Path, G, Mask, Defs, ClipPath } from 'react-native-svg';
import { useTheme } from 'ermis-chat-react-native';

import { IconProps } from '../utils/base';

export const ErmisPlatform: React.FC<IconProps> = ({ fill, height, width }) => {
    const {
        theme: {
            colors: { grey },
        },
    } = useTheme();

    return (
        <Svg fill="none" height={height} width={width} viewBox={`0 0 ${height} ${width}`} >
            <Ellipse cx="48" cy="46" rx="48" ry="46" fill="#F5FBF7" />
            <Mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="92">
                <Ellipse cx="48" cy="46" rx="48" ry="46" fill="#F5FBF7" />
            </Mask>
            <G mask="url(#mask0)">
                <Ellipse cx="17.8535" cy="25.5244" rx="22.5366" ry="21.5976" fill="#E8F5ED" />
                <Ellipse cx="88.6831" cy="70.4024" rx="22.5366" ry="21.5976" fill="#E8F5ED" />
                <Rect x="14.6343" y="19.0732" width="66.7317" height="77.9756" rx="16" fill="white" />
                <Rect x="25.7561" y="63.9512" width="44.4878" height="3.36585" rx="1.68293" fill={fill || grey} />
                <Rect x="30.439" y="71.8049" width="35.122" height="3.36585" rx="1.68293" fill={fill || grey} />
                <Ellipse cx="48.5854" cy="41.5122" rx="14.0488" ry="13.4634" stroke="#EAEEF2" strokeWidth="4" />
                <Path
                    d="M36.4188 48.2439C37.574 50.1614 39.2048 51.7762 41.1667 52.9454C43.1286 54.1146 45.3612 54.802 47.6666 54.9468C49.972 55.0916 52.279 54.6893 54.3834 53.7755C56.4878 52.8618 58.3246 51.4648 59.731 49.7082C61.1375 47.9517 62.0702 45.8898 62.4465 43.7053C62.8229 41.5208 62.6312 39.2811 61.8886 37.1845C61.146 35.088 59.8753 33.1993 58.189 31.6857C56.5028 30.1722 54.4531 29.0806 52.2215 28.5076"
                    stroke={fill || grey}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M44.4878 45.439C44.4878 45.1292 44.7499 44.878 45.0732 44.878H52.0975C52.4208 44.878 52.6829 45.1292 52.6829 45.439C52.6829 45.7488 52.4208 46 52.0975 46H45.0732C44.7499 46 44.4878 45.7488 44.4878 45.439ZM46.4153 39.665C46.1867 39.4459 46.1867 39.0907 46.4153 38.8716L48.1714 37.1887C48.2812 37.0835 48.4301 37.0244 48.5854 37.0244C48.7406 37.0244 48.8895 37.0835 48.9993 37.1887L50.7554 38.8716C50.984 39.0907 50.984 39.4459 50.7554 39.665C50.5268 39.884 50.1561 39.884 49.9275 39.665L49.1707 38.9397L49.1707 43.1951C49.1707 43.5049 48.9086 43.7561 48.5854 43.7561C48.2621 43.7561 48 43.5049 48 43.1951L48 38.9397L47.2432 39.665C47.0146 39.884 46.6439 39.884 46.4153 39.665Z"
                    fill={fill || grey}
                />
            </G>
        </Svg>
    );
};