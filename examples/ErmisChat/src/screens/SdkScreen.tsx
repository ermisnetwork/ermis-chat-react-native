import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, Dimensions, useWindowDimensions, StatusBar, StyleSheet, TextInputProps } from "react-native";
import { useAppContext } from "../context/AppContext";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ChainProjectResponse, UserWithProjectsResponse, Project } from 'ermis-chat-sdk';
import { ChatScreenHeader } from "../components/ChatScreenHeader";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from "ermis-chat-react-native";
import { SdkClient } from "../components/SdkClient";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scene: {
        flex: 1,
    },
    sheetContainer: {
        flex: 1,
        // alignItems: 'center',
        padding: 16
    },
    underline: {
        borderBottomWidth: 0.5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetButton: {
        padding: 16,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',

    }
});

const renderTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: 'white' }}
        style={{ backgroundColor: 'pink' }}

        renderTabBarItem={(props) => {
            let { route } = props;
            return <Text style={{}}>
                {route.title}
            </Text>
        }}
    />
);
type Chain = {
    chainId: number,
    name: string,
    image: string,
    currency: string
}
const sampleChain: Chain[] = [
    { chainId: 1, name: "Ethereum Mainnet", image: "", currency: "ETH" },
    { chainId: 42161, name: "Arbitrum One", image: "", currency: "ETH" },
    { chainId: 137, name: "Polygon Mainnet", image: "", currency: "MATIC" },
    { chainId: 43114, name: "Avalanche C-Chain", image: "", currency: "AVAX" },
    { chainId: 56, name: "BNB Smart Chain Mainnet", image: "", currency: "BNB" },
    { chainId: 10, name: "OP Mainnet", image: "", currency: "ETH" },
    { chainId: 100, name: "Gnosis", image: "", currency: "XDAI" },
    { chainId: 324, name: "zkSync Mainnet", image: "", currency: "ETH" },
    { chainId: 7777777, name: "Zora", image: "", currency: "ETH" },
    { chainId: 8453, name: "Base", image: "", currency: "ETH" },
    { chainId: 42220, name: "Celo Mainnet", image: "", currency: "CELO" },
    { chainId: 1313161554, name: "Aurora Mainnet", image: "", currency: "ETH" },
]
const selectChain = (chain_id: number) => {
    return sampleChain.find((chain) => chain.chainId === chain_id) || sampleChain[0];
}
const MiddleContent: React.FC<{ chain_id: number, onPress: () => void }> = ({ chain_id, onPress }) => {
    const [chain, setChain] = React.useState<Chain>(sampleChain[0]);
    useEffect(() => {
        let chain = selectChain(chain_id);
        setChain(chain || sampleChain[0]);
    }, [chain_id]);
    return (
        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={onPress}>
            <Text>{chain.name}</Text>
        </TouchableOpacity>
    )
}
export const SdkScreen: React.FC = () => {
    const navigation = useNavigation();
    const { chatClient } = useAppContext();
    const [chains, setChains] = React.useState<number[]>([]);
    const [chain, setChain] = React.useState<number>(0);
    const [joinedClients, setJoinedClients] = React.useState<UserWithProjectsResponse[]>([]);
    const [notJoinedClients, setNotJoinedClients] = React.useState<UserWithProjectsResponse[]>([]);

    const [index, setIndex] = React.useState(0);

    const [routes] = React.useState([
        { key: 'joined', title: 'Your Projects' },
        { key: 'notJoined', title: 'New Projects' },
    ]);
    const {
        theme: {
            colors: { black, grey, white, accent_blue },
            messageInput: { inputBox },
        },
    } = useTheme();

    useEffect(() => {
        if (chatClient) {
            setChains(chatClient.chains?.chains.slice(1) || []);
            setChain(chatClient.chains?.chains[1] || 1);
            let joinedClients = chatClient.chains?.joined.find((chain) => chain.chain_id === chatClient.chains?.chains[1]);
            let newClients = chatClient.chains?.not_joined.find((chain) => chain.chain_id === chatClient.chains?.chains[1]);
            setJoinedClients(joinedClients?.clients || []);
            setNotJoinedClients(newClients?.clients || []);
        }
        handleSnapPress(-1);
    }, []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["30%"], []);
    const handleSnapPress = useCallback((index) => {
        bottomSheetRef.current?.snapToIndex(index);
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        // console.log('handleSheetChanges', index);
    }, []);

    const handleClosePress = useCallback(() => {
        bottomSheetRef.current?.close()
    }, []);
    const setChainHandler = (item: number) => {
        setChain(item);
        if (chatClient) {
            let joinedClients = chatClient.chains?.joined.find((chain) => chain.chain_id === chatClient.chains?.chains[item]);
            let newClients = chatClient.chains?.not_joined.find((chain) => chain.chain_id === chatClient.chains?.chains[item]);
            setJoinedClients(joinedClients?.clients || []);
            setNotJoinedClients(newClients?.clients || []);
        }
        handleClosePress();
    }

    const renderSheetItem = useCallback((chain_id: number) => {
        const chain = selectChain(chain_id);
        return (
            <TouchableOpacity key={chain_id} style={styles.sheetButton} onPress={() => setChainHandler(chain_id)}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: '400',
                }}>{chain.name}</Text>
            </TouchableOpacity>
        )
    }, []);

    const renderScene = SceneMap({
        joined: () => { return <SdkClient clients={joinedClients} onPress={() => { }} /> },
        notJoined: () => { return <SdkClient clients={notJoinedClients} onPress={() => { }} /> },
    });

    return (
        <View style={styles.container}>
            <ChatScreenHeader MiddleContent={() => <MiddleContent chain_id={chain} onPress={() => handleSnapPress(0)} />} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
            // renderTabBar={renderTabBar}
            />
            <BottomSheet
                ref={bottomSheetRef}
                onChange={handleSheetChanges}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                index={-1}
                backgroundStyle={{
                    backgroundColor: '#f8f8f8',
                }}
            >
                <BottomSheetScrollView style={styles.sheetContainer}>
                    {
                        chains.map(renderSheetItem)
                    }
                </BottomSheetScrollView>
            </BottomSheet>
        </View >
    )
};