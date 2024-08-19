import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
import React from 'react'

export default function ConnectWallet() {
    const { open } = useWeb3Modal()

    return (
        <>
            <TouchableOpacity onPress={() => open({ view: 'Networks' })} style={styles.container}>
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
            backgroundColor: 'blue',
        },
    }
)