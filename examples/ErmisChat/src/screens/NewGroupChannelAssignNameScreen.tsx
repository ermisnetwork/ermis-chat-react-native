import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, useColorScheme, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Check, genenrateChannelId, useTheme, useViewport, Avatar, Right, Camera } from 'ermis-chat-react-native';

import { RoundButton } from '../components/RoundButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserSearchResults } from '../components/UserSearch/UserSearchResults';
import { useAppContext } from '../context/AppContext';
import { useUserSearchContext } from '../context/UserSearchContext';

import type { StackNavigationProp } from '@react-navigation/stack';

import type { StackNavigatorParamList } from '../types';
import calendar from 'dayjs/plugin/calendar';
import dayjs from 'dayjs';
import ImagePicker from 'react-native-image-crop-picker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';


dayjs.extend(calendar);

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  container: {
    flex: 1,
  },
  gradient: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  header: {
    borderBottomWidth: 0,
  },
  inputBox: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false, // for android vertical text centering
    padding: 8, // removal of default text input padding on android
    paddingHorizontal: 16,
    paddingTop: 8, // removal of iOS top padding for weird centering
    textAlignVertical: 'center', // for android vertical text centering
    borderWidth: 1,
    borderColor: "#EAEEF2",
    borderRadius: 16
  },
  inputBoxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  descriptionBoxContainer: {
    paddingHorizontal: 16,
  },
  descriptionHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: "#1F3C51",
    lineHeight: 21
  },
  descriptionBox: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false, // for android vertical text centering
    padding: 8, // removal of default text input padding on android
    paddingHorizontal: 16,
    paddingTop: 8, // removal of iOS top padding for weird centering
    textAlignVertical: 'center', // for android vertical text centering
    borderWidth: 1,
    borderColor: "#EAEEF2",
    borderRadius: 16,
    marginVertical: 8,
  },
  memberLength: { fontSize: 12 },
  nameText: {
    fontSize: 12,
    textAlignVertical: 'center',
  },
  memberContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 12,
  },
  memberDetail: {
    flex: 1,
    paddingLeft: 8,
  },
  memberLastOnline: { fontSize: 12 },
  memberName: { fontSize: 14, fontWeight: '700' },
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
});

type ConfirmButtonProps = {
  disabled?: boolean;
  onPress?: () => void;
};

const ConfirmButton: React.FC<ConfirmButtonProps> = (props) => {
  const { disabled, onPress } = props;
  const {
    theme: {
      colors: { accent_blue, grey },
    },
  } = useTheme();

  return (
    <RoundButton disabled={disabled} onPress={onPress}>
      <Check pathFill={!disabled ? accent_blue : grey} />
    </RoundButton>
  );
};

type NewGroupChannelAssignNameScreenNavigationProp = StackNavigationProp<
  StackNavigatorParamList,
  'NewGroupChannelAssignNameScreen'
>;

export type NewGroupChannelAssignNameScreenProps = {
  navigation: NewGroupChannelAssignNameScreenNavigationProp;
};

export const NewGroupChannelAssignNameScreen: React.FC<NewGroupChannelAssignNameScreenProps> = ({
  navigation,
}) => {
  const { chatClient } = useAppContext();
  const { selectedUserIds, selectedUsers, channelType, reset } = useUserSearchContext();

  const {
    theme: {
      colors: { bg_gradient_end, bg_gradient_start, black, border, grey, white_snow },
      ermisColors
    },
  } = useTheme();
  const colorScheme = useColorScheme();
  const { vw } = useViewport();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [channelAvatar, setChannelAvatar] = useState('');
  const selectionEnd = useRef(0);
  if (!chatClient) {
    return null;
  }
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["20%"], []);

  const handleSnapPress = useCallback((index) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
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
    return ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {

      // TODO: KhoaKheu: can't upload from oneplus android 13
      let file = {
        uri: image.path,
        type: image.mime,
        name: "avatar.jpg"
      }
      chatClient?.uploadFile(file).then((res) => {
        setChannelAvatar(res.avatar);
        Alert.alert('Success', 'Image uploaded successfully');
      }).catch((err) => {
        setChannelAvatar('');
        Alert.alert('Error', err.message);
      });
      handleClosePress();
    }).catch(err => {
      console.error(err);
      Alert.alert('Error', err.message);
      handleClosePress()
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
        setChannelAvatar(res.avatar);
        Alert.alert('Success', 'Image uploaded successfully');
      }).catch((err) => {
        setChannelAvatar('');
        Alert.alert('Error', err.message);
      });
      handleClosePress()
    }).catch(err => {
      console.error(err);
      Alert.alert('Error', err.message);
      handleClosePress()
    })
  };
  const onConfirm = () => {
    if (!chatClient.user || !selectedUsers || !groupName) {
      return;
    }

    const channelId = genenrateChannelId(chatClient.projectId);

    const channel = chatClient.channel(channelType, channelId, {
      members: [...selectedUserIds, chatClient.user?.id],
      name: groupName,
      description,
      image: channelAvatar
    });

    // TODO: Maybe there is a better way to do this.
    navigation.pop(2);
    navigation.replace('ChannelScreen', {
      channel,
    });
    reset();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        // eslint-disable-next-line react/no-unstable-nested-components
        RightContent={() => <ConfirmButton disabled={!groupName} onPress={onConfirm} />}
        style={styles.header}
        titleText='Create new Channel'
      />
      <View style={styles.container}>
        <View
          style={[
            styles.inputBoxContainer,
            {
              backgroundColor: white_snow,
              borderColor: border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSnapPress(0)}
          >
            {
              (channelAvatar.length === 0)
                ? <View style={{
                  backgroundColor: ermisColors[colorScheme].Primary.primaryContainerLight,
                  padding: 16,
                  marginRight: 12,
                  borderRadius: 100
                }}>
                  <Camera pathFill={ermisColors[colorScheme].Primary.primary} />
                </View>
                : <Image source={{ uri: channelAvatar }} style={{ marginRight: 12, width: 50, height: 50, borderRadius: 100 }}
                />}
          </TouchableOpacity>
          <TextInput
            autoFocus
            onChangeText={setGroupName}
            placeholder='Name of Group Chat'
            placeholderTextColor={grey}
            style={[
              styles.inputBox,
              {
                color: black,
                borderColor: ermisColors[colorScheme].Primary.primaryContainerLight,
              },
            ]}
            value={groupName}
          />
        </View>
        <View style={styles.descriptionBoxContainer}>
          <Text style={styles.descriptionHeader}>Description
            <Text style={[styles.descriptionHeader, {
              color: "#6E8597"
            }]}>(Optional)</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: ermisColors[colorScheme].Primary.primary }}>
            <TextInput
              autoFocus
              onChangeText={setDescription}
              placeholder='Add a description'
              placeholderTextColor={grey}
              multiline
              numberOfLines={3}
              style={[
                styles.descriptionBox,
                {
                  color: black,
                  borderColor: ermisColors[colorScheme].Primary.primary,
                  backgroundColor: ermisColors[colorScheme].Primary.primaryContainerLight,
                  textAlignVertical: 'top',
                  height: 56
                },
              ]}
              value={description}
            />
          </View>
        </View>
        <View style={styles.gradient}>
          <Svg height={24} style={styles.absolute} width={vw(100)}>
            <Rect fill='url(#gradient)' height={24} width={vw(100)} x={0} y={0} />
            <Defs>
              <LinearGradient
                gradientUnits='userSpaceOnUse'
                id='gradient'
                x1={0}
                x2={0}
                y1={0}
                y2={24}
              >
                <Stop offset={1} stopColor={bg_gradient_start} stopOpacity={1} />
                <Stop offset={0} stopColor={bg_gradient_end} stopOpacity={1} />
              </LinearGradient>
            </Defs>
          </Svg>
          <Text
            style={[
              styles.memberLength,
              {
                color: grey,
              },
            ]}
          >
            Members
          </Text>
        </View>
        <FlatList
          keyboardDismissMode='interactive'
          keyboardShouldPersistTaps='handled'
          // eslint-disable-next-line react/no-unstable-nested-components
          // ListEmptyComponent={() => (
          //   <View style={styles.emptyResultIndicator}>
          //     <Search fill={grey_gainsboro} scale={5} />
          //     <Text style={[{ color: grey }, styles.emptyResultIndicatorText]}>
          //       {loading ? 'Loading...' : 'No user matches these keywords...'}
          //     </Text>
          //   </View>
          // )}
          // onEndReached={loadMore}
          data={selectedUsers}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <View
              key={item.id}
              style={[
                styles.memberContainer,
                {
                  backgroundColor: white_snow,
                  borderBottomColor: border,
                },
              ]}
            >
              <Avatar image={item.avatar} name={item.name} size={40} id={item.id} />
              <View style={styles.memberDetail}>
                <Text
                  style={[
                    styles.memberName,
                    {
                      color: black,
                    },
                  ]}
                >
                  {item.name || item.id}
                </Text>
                <Text
                  style={[
                    styles.memberLastOnline,
                    {
                      color: grey,
                    },
                  ]}
                >
                  Last online {dayjs(item.last_active).calendar()}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
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
    </View>
  );
};
