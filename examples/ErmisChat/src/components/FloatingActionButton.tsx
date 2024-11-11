import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import React, { PropsWithChildren, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Pressable, Text, useColorScheme } from 'react-native';
import Animated, {
    withDelay,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { DrawerNavigatorParamList, StackNavigatorParamList } from '../types';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChatIcon, Group, useTheme } from 'ermis-chat-react-native';

const styles = StyleSheet.create({
    button: {
        // backgroundColor: '#ffffff',
        position: 'absolute',
        borderRadius: 16,
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'center',
        zIndex: -2,
        flexDirection: 'row',
        width: 'auto',
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    shadow: {
        shadowColor: '#171717',
        shadowOffset: { width: -0.5, height: 3.5 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});
const mainButtonStyles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        bottom: 24,
        right: 24,
    },
    button: {
        zIndex: 1,
        height: 56,
        width: 56,
        borderRadius: 100,
        backgroundColor: '#b58df1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        fontSize: 24,
        color: '#f8f9ff',
    }
})
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    duration: 1200,
    overshootClamping: true,
    dampingRatio: 0.8,
};

const OFFSET = 50;
export const FloatingActionButton = ({ isExpanded, index, children, onPress, containStyles }) => {
    const animatedStyles = useAnimatedStyle(() => {
        const moveXValue = isExpanded.value ? OFFSET * index : 0;
        const moveYValue = isExpanded.value ? OFFSET * 1.5 : 0;
        const translateXValue = withSpring(-moveXValue, SPRING_CONFIG);
        const translateYValue = withSpring(-moveYValue, SPRING_CONFIG);
        const delay = index * 100;

        const scaleValue = isExpanded.value ? 1 : 0;

        return {
            transform: [
                { translateY: translateXValue },
                { translateX: translateYValue },
                {
                    scale: withDelay(delay, withTiming(scaleValue)),
                },
            ],
            width: OFFSET * 2.5,
        };
    });

    return (
        <AnimatedPressable style={[animatedStyles, styles.shadow, styles.button, containStyles]} onPress={onPress}>
            {children}
        </AnimatedPressable>
    );
};

type FloatingActionButtonProps = CompositeNavigationProp<
    DrawerNavigationProp<DrawerNavigatorParamList>,
    StackNavigationProp<StackNavigatorParamList>
>;

export const FloatingActionButtons: React.FC = () => {
    const navigation = useNavigation<FloatingActionButtonProps>();

    const {
        theme: {
            colors: { accent_blue, black, border, grey, white },
            ermisColors
        },
    } = useTheme();
    const colorScheme = useColorScheme();

    // Floating action button
    const isExpanded = useSharedValue(false);
    let countDownToCollapse: NodeJS.Timeout;
    const handlePress = () => {
        if (countDownToCollapse) {
            clearTimeout(countDownToCollapse);
        }
        isExpanded.value = !isExpanded.value;

        if (!isExpanded.value) {
            setTimeout(() => {
                isExpanded.value = false;
            }, 5000);
        }
    };

    const plusIconStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
        const translateValue = withTiming(moveValue);
        const rotateValue = isExpanded.value ? '45deg' : '0deg';

        return {
            transform: [
                { translateX: translateValue },
                { rotate: withTiming(rotateValue) },
            ],
        };
    });
    return (
        <View style={mainButtonStyles.buttonContainer}>
            <AnimatedPressable
                onPress={handlePress}
                style={[styles.shadow, mainButtonStyles.button, { backgroundColor: ermisColors[colorScheme].Primary.primaryLight }]}>
                <Animated.Text style={[plusIconStyle, mainButtonStyles.content]}>
                    +
                </Animated.Text>
            </AnimatedPressable>
            <FloatingActionButton
                isExpanded={isExpanded}
                index={2}
                onPress={() => {
                    navigation.navigate('NewDirectMessagingScreen');
                    handlePress();
                }}
                containStyles={{ backgroundColor: ermisColors[colorScheme].Primary.primaryContainerLight }}
            >
                <ChatIcon pathFill={ermisColors[colorScheme].Primary.primary} width={24} height={24} />
                <Animated.Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '400', color: grey }} numberOfLines={1}>New Chat</Animated.Text>
            </FloatingActionButton>
            <FloatingActionButton
                isExpanded={isExpanded}
                index={1}
                onPress={() => {
                    navigation.navigate('NewGroupChannelAddMemberScreen');
                    handlePress();
                }}
                containStyles={{ backgroundColor: ermisColors[colorScheme].Primary.primaryContainerLight }}
            >
                <Group pathFill={ermisColors[colorScheme].Primary.primary} width={24} height={24} />
                <Animated.Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '400', color: grey }} numberOfLines={1}>New Channel</Animated.Text>
            </FloatingActionButton>
        </View >
    )
}