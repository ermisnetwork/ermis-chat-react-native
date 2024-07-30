
import { SafeAreaView, View } from "react-native"
import { StackNavigatorParamList } from "../types"
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";


export type InviteScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'InviteScreen'>;
export type InviteScreenProps = {
    navigation: InviteScreenNavigationProp;
};
export const InviteScreen: React.FC<InviteScreenProps> = () => {
    return (<SafeAreaView>
        <View></View>
    </SafeAreaView>)
}