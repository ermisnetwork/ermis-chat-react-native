import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, I18nManager, TextInputProps, TouchableOpacity, Alert } from "react-native"
import { ScreenHeader } from '../components/ScreenHeader';
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParamList } from "../types";
import { Avatar, LoadingIndicator, useTheme } from "ermis-chat-react-native";
import { useAppContext } from "../context/AppContext";
import { TextInput } from "react-native-gesture-handler";
import ImagePicker from 'react-native-image-crop-picker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
    inputBox: {
        includeFontPadding: false, // for android vertical text centering
        padding: 0, // removal of default text input padding on android
        paddingTop: 0, // removal of iOS top padding for weird centering
        textAlignVertical: 'center', // for android vertical text centering
        fontSize: 16,
        fontWeight: '400',
        marginTop: 16,
    },
    inputBoxContainer: {
        marginTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 32,
        width: '100%',
    },
    title: {
        marginTop: 16,
        width: '95%',
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
    },
    sheetContainer: {
        flex: 1,
        alignItems: 'center',
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

})
const onBack = () => {

}
export type ProfileScreenNavigationProp = StackNavigationProp<StackNavigatorParamList, 'ProfileScreen'>;
export type ProfileScreenProps = {
    navigation: ProfileScreenNavigationProp;
}
const ProfileScreen: React.FC<ProfileScreenProps> = () => {
    const [textHeight, setTextHeight] = useState(0);
    const { chatClient } = useAppContext();
    const [name, setName] = useState(chatClient?.user?.name || '');
    const [avatar, setAvatar] = useState(chatClient?.user?.avatar || '');
    const [aboutMe, setAboutMe] = useState(chatClient?.user?.about_me || '');
    const [loading, setLoading] = useState(false);
    const isTrackingStarted = useRef(false);
    const selectionEnd = useRef(0);

    const {
        theme: {
            colors: { black, grey, white, accent_blue },
            messageInput: { inputBox },
        },
    } = useTheme();

    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["20%"], []);

    const handleSnapPress = useCallback((index) => {
        bottomSheetRef.current?.snapToIndex(index);
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const handleClosePress = useCallback(() => {
        bottomSheetRef.current?.close()
    }, []);

    const handleSelectionChange: TextInputProps['onSelectionChange'] = ({
        nativeEvent: {
            selection: { end },
        },
    }) => {
        selectionEnd.current = end;
    };
    const handleSelectImage = () => {
        console.log("----------------before user: ", chatClient?.user?.avatar);
        return ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            let file = {
                uri: image.path,
                type: image.mime,
                name: "avatar.jpg"
            }
            chatClient?.uploadFile(file).then((res) => {
                Alert.alert('Success', 'Image uploaded successfully');
                console.log("response: ", res);
            }).catch((err) => {
                setAvatar(chatClient?.user?.avatar || '');
                Alert.alert('Error', err.message);
            });
            console.log("----------------after user: ", chatClient?.user?.avatar);
            setAvatar(image.path);
            handleClosePress();
        }).catch(err => {
            console.error(err);
            Alert.alert('Error', err.message);
            handleClosePress
        })
    };
    const handleTakePhoto = () => {
        return ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            let file = {
                uri: image.path,
                type: image.mime,
                name: "avatar.jpg"
            }
            chatClient?.uploadFile(file).then((res) => {
                Alert.alert('Success', 'Image uploaded successfully');
            }).catch((err) => {
                setAvatar(chatClient?.user?.avatar || '');
                Alert.alert('Error', err.message);
            });
            setAvatar(image.path);
            handleClosePress
        }).catch(err => {
            console.error(err);
            Alert.alert('Error', err.message);
            handleClosePress
        })
    };

    const handleCleanUp = () => {
        return ImagePicker.clean().then(() => {
            console.log('removed all tmp images from tmp directory');
        }).catch(err => {
            console.error(err);
        })
    };

    const handleSave = async () => {
        setLoading(true);
        await chatClient?.updateProfile(name, aboutMe).then((res) => {
            setLoading(false);
            Alert.alert('Success', 'Profile updated successfully');
        }).catch((err) => {
            setName(chatClient?.user?.name || '');
            setAboutMe(chatClient?.user?.about_me || '');
            setLoading(false);
            Alert.alert('Error', err.message);
        }).finally(() => {
            setLoading(false);
        });

    };

    useEffect(() => {
        setAvatar(chatClient?.user?.avatar || '');
        setName(chatClient?.user?.name || '');
        setAboutMe(chatClient?.user?.about_me || '');
        handleSnapPress(-1);
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
                <Avatar
                    image={avatar}
                    size={200}
                    upload={true}
                    onPress={() => handleSnapPress(0)}
                />
                <View style={{
                    marginTop: 16,
                    width: '95%',
                }}>
                    <Text style={styles.text}>Name:</Text>
                </View>
                <View style={[styles.inputBoxContainer, {
                    borderColor: grey,
                }]}>
                    <TextInput
                        // autoFocus={true}
                        placeholder={name}
                        placeholderTextColor={grey}
                        style={[styles.inputBox, {
                            color: black,
                            maxHeight: (textHeight || 17) * 1,
                            textAlign: I18nManager.isRTL ? 'right' : 'left',
                        },
                            inputBox]}
                        onContentSizeChange={({
                            nativeEvent: {
                                contentSize: { height },
                            },
                        }) => {
                            if (!textHeight) {
                                setTextHeight(height);
                            }
                        }}
                        onSelectionChange={handleSelectionChange}
                        maxLength={100}
                        onChangeText={setName}
                        value={name}
                    />
                </View>
                <View style={{
                    marginTop: 16,
                    width: '95%',
                }}>
                    <Text style={styles.text}>About me:</Text>
                </View>
                <View style={[styles.inputBoxContainer, {
                    borderColor: grey,
                }]}>
                    <TextInput
                        autoFocus={false}
                        placeholder={aboutMe}
                        placeholderTextColor={grey}
                        style={[styles.inputBox, {
                            color: black,
                            maxHeight: (textHeight || 17) * 1,
                            textAlign: I18nManager.isRTL ? 'right' : 'left',
                        },
                            inputBox]}
                        onContentSizeChange={({
                            nativeEvent: {
                                contentSize: { height },
                            },
                        }) => {
                            if (!textHeight) {
                                setTextHeight(height);
                            }
                        }}
                        onSelectionChange={handleSelectionChange}
                        maxLength={100}
                        onChangeText={setAboutMe}
                        value={aboutMe}
                    />
                </View>
            </View>
            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{
                    alignItems: 'center',
                    backgroundColor: accent_blue,
                    borderRadius: 32,
                    justifyContent: 'center',
                    paddingVertical: 16,
                    marginHorizontal: 16,
                }}>
                <Text style={{
                    color: white,
                    fontSize: 18,
                    fontWeight: '600',
                }}>Save</Text>
                {loading &&
                    <View style={{
                        position: 'absolute',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        opacity: 0.5,
                        backgroundColor: 'transparent',
                    }}>
                        <LoadingIndicator />
                    </View>}
            </TouchableOpacity>
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
                <BottomSheetView style={styles.sheetContainer}>
                    <TouchableOpacity style={styles.sheetButton} onPress={handleTakePhoto}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '400',
                        }}>Take a photo</Text>
                    </TouchableOpacity>
                    <View style={[styles.underline, { borderColor: grey }]} />
                    <TouchableOpacity style={styles.sheetButton} onPress={handleSelectImage}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '400',
                        }}>Select Gallery</Text>
                    </TouchableOpacity>
                    <View style={[styles.underline, { borderColor: grey }]} />
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    )
}
export default ProfileScreen;