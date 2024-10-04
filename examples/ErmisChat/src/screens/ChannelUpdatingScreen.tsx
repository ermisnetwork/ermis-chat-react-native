import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParamList } from "../types";
import { RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScreenHeader } from "../components/ScreenHeader";
import { Avatar, ChannelAvatar } from "ermis-chat-react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
type ChannelUpdatingScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'ChannelUpdatingScreen'>;
type ChannelUpdatingScreenRouteProp = RouteProp<StackNavigatorParamList, 'ChannelUpdatingScreen'>;
type ChannelUpdatingScreenProps = {
    navigation: ChannelUpdatingScreenNavigationProp;
    route: ChannelUpdatingScreenRouteProp;
};

export const ChannelUpdatingScreen: React.FC<ChannelUpdatingScreenProps> = ({
    navigation,
    route: {
        params: { channel },
    },
}) => {
    const [avatar, setAvatar] = useState(channel?.data?.image || '');
    return (
        <View style={styles.container}>
            <ScreenHeader titleText="Edit Channel" />
            <Avatar image={avatar}
                size={200}
                upload={true}
                onPress={() => handleSnapPress(0)} />
        </View>
    )
}
