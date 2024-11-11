import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { ErmisChatGenerics } from "../../types";
import type { Channel, ChannelMemberResponse, UserResponse } from 'ermis-chat-sdk';
import { Avatar, useChatContext } from "ermis-chat-react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    membersContainer: {
        backgroundColor: '#EAEEF2',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addButtonText: {
        color: '#17B26A',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 21,
    },
    memberRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
    },
    memberInfo: {
        marginLeft: 8,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
    memberRole: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
        color: '#6E8597'
    }
})

type MemberProps = {
    channel: Channel<ErmisChatGenerics>;
};

export const Member: React.FC<MemberProps> = ({ channel }) => {
    const { client } = useChatContext<ErmisChatGenerics>();
    const channelMembers = Object.values(channel.state.members);

    const [members, setMembers] = useState([] as ChannelMemberResponse<ErmisChatGenerics>[]);
    const allMembersLength = channelMembers.length;
    useEffect(() => {
        const members = channelMembers.map((member) => {
            if (member.user?.id) {
                const user = client.state?.users[member.user?.id];
                if (user) {
                    member.user = user;
                }
            }
            return member;
        });
        setMembers(members);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allMembersLength]);
    const channelCreatorId =
        channel.data && (channel.data.created_by_id || (channel.data.created_by as UserResponse)?.id);
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+Add Members</Text>
            </TouchableOpacity>
            <ScrollView style={styles.membersContainer}>
                {members.map((member) => {
                    return (
                        <View key={member.user?.id} style={styles.memberRow}>
                            <Avatar
                                channelId={channel.id}
                                id={member.user?.id}
                                image={member.user?.avatar}
                                name={member.user?.name}
                                online={member.user?.online}
                                size={40}
                            />
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.user?.name}</Text>
                                <Text style={styles.memberRole}>{member.channel_role}</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    )
}