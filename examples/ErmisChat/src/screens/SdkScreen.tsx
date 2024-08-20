import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export const SdkScreen: React.FC = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView>
            <Text>SDK Screen</Text>
            <TouchableOpacity onPress={() => {
                navigation.navigate('ProfileScreen');
            }}>
                <Text>Request Notification Permission</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
};