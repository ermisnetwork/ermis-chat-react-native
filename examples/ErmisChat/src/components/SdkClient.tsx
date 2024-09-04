import { ChainProjectResponse, UserWithProjectsResponse, Project } from 'ermis-chat-sdk';
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, Dimensions, useWindowDimensions, StatusBar, StyleSheet, TextInputProps } from "react-native";

const styles = StyleSheet.create({
    scene: {
        flex: 1
    }
})

type SdkClientProps = {
    clients: UserWithProjectsResponse[];
    onPress: () => void;
}


export const SdkClient: React.FC<SdkClientProps> = ({ clients, onPress }) => (
    <View style={styles.scene} >
        {
            clients.map((client) => (
                <View key={client.client_id} style={{ padding: 16, borderBottomWidth: 0.5 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{client.client_id}</Text>
                    {
                        client.projects.map((project: Project) => (
                            <View key={project.project_id} style={{ padding: 16, borderBottomWidth: 0.5 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>{project.project_id}</Text>
                                <Text style={{ fontSize: 14, fontWeight: '400' }}>{project.project_name}</Text>
                                <Text style={{ fontSize: 14, fontWeight: '400' }}>{project.description}</Text>
                                <Text style={{ fontSize: 14, fontWeight: '400' }}>{project.display}</Text>
                            </View>
                        ))
                    }
                </View>
            ))
        }
    </View>
);