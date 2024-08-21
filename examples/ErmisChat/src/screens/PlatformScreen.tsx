import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ErmisPlatform } from "../icons/ErmisPlatform";
import { useAppContext } from "../context/AppContext";
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { useTheme } from 'ermis-chat-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackNavigatorParamList } from '../types';
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    descriptionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    description: {
        padding: 20,
        alignItems: 'center',
        // justifyContent: 'center',
        borderColor: '#D9D9D9',
        borderWidth: 2,
        borderRadius: 20

    },
    tabView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D9D9D9',
        margin: 10,
        padding: 10,
    },
    upsideTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabTitle: {
        fontSize: 22.4,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    tabDesciption: {
        fontSize: 16,
        color: '#6E8597',
        fontWeight: 'normal',
        marginTop: 10,
        textAlign: 'center',
    },
    platformButton: {
        backgroundColor: '#57B77D',
        padding: 10,
        borderRadius: 10,
    },
    platformButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
})
type PlatformTabProps = {
    title: string;
    onPress?: () => void;
}

const PlatformTab: React.FC<PlatformTabProps> = ({ title, onPress }) => {
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (title === 'sdk') {
            setDescription('Chats on platforms integrated through the SDK')
        }
        else {
            setDescription('Chats on Ermis App')
        }
    }, []);
    return (
        <View style={styles.tabView}>
            <View style={styles.upsideTab}>
                <ErmisPlatform width={92} height={96} />
                <Text style={styles.tabDesciption}>{description}</Text>
            </View>
            <TouchableOpacity style={styles.platformButton} onPress={onPress}>
                <Text style={styles.platformButtonText}>Go to {title.toUpperCase()}</Text>
            </TouchableOpacity>
        </View>
    )
}
type PlatformScreenNavigationProp = StackNavigationProp<
    StackNavigatorParamList,
    'PlatformScreen'
>;

export const PlatformScreen: React.FC = () => {
    const { chatClient } = useAppContext();
    const navigation = useNavigation<PlatformScreenNavigationProp>();
    const {
        theme: {
            colors: { black, grey, grey_gainsboro, grey_whisper, white, white_snow },
        },
    } = useTheme();
    const ermisTitle = 'ermis';
    const sdkTitle = "sdk";
    const platformTitle = "Please choose one of the two platforms to proceed."

    const navToSDK = () => {
        navigation.navigate('SdkScreen');
    };
    const navToErmis = () => {
        chatClient?._updateProjectID("6fbdecb0-1ec8-4e32-99d7-ff2683e308b7");//this is the project id for the Ermis App
        navigation.navigate('ErmisScreen');
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.descriptionContainer}>
                <View style={styles.description}>
                    <Text style={styles.tabTitle}>Select a platform</Text>
                    <Text style={styles.tabDesciption}>{platformTitle}</Text>
                </View>
            </View>
            <View style={styles.tabContainer}>
                <PlatformTab title={sdkTitle} onPress={navToSDK} />
                <PlatformTab title={ermisTitle} onPress={navToErmis} />
            </View>
        </SafeAreaView>
    )
};