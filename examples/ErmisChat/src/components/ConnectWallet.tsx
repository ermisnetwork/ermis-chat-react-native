import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native'
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
import React, { useEffect } from 'react'
import { useTheme } from 'ermis-chat-react-native'
export default function ConnectWallet() {
    const { open } = useWeb3Modal()
    const {
        theme: {
            ermisColors
        } } = useTheme();
    const colorScheme = useColorScheme();
    return (
        <>
            <TouchableOpacity onPress={() => open({ view: 'Networks' })} style={[styles.container, { backgroundColor: ermisColors[colorScheme].Primary.primary }]}>
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                    padding: 20,
                }}>Login via Wallet</Text>
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 50,
            // backgroundColor: 'blue',
        },
    }
)