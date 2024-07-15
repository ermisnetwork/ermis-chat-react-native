import React, { useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native"
import { ScreenHeader } from '../components/ScreenHeader';
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParamList } from "../types";
import { Avatar, useTheme } from "ermis-chat-react-native";
import { useAppContext } from "../context/AppContext";
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },

})
const onBack = () => {
    console.log('Back button pressed');

}
export type ProfileScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'ProfileScreen'>;
export type ProfileScreenProps = {
    navigation: ProfileScreenNavigationProp;
}
const ProfileScreen: React.FC<ProfileScreenProps> = () => {
    const {
        theme: {
            colors: { white },
        },
    } = useTheme();
    const { chatClient } = useAppContext();

    useEffect(() => {
        console.log('channel client', chatClient?.user);

    }, []);
    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: white,
                },
            ]}
        >
            <ScreenHeader titleText="Profile" inSafeArea={true} onBack={onBack} />
            <View style={styles.contentContainer}>
                <Avatar image={chatClient?.user?.avatar || 'https://randomuser.me/api/portraits/thumb/women/10.jpg'}
                    size={200}
                    upload={true}
                />
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    marginTop: 16,
                }}>{chatClient?.user?.name}</Text>
            </View>
        </SafeAreaView>
    )
}
export default ProfileScreen;