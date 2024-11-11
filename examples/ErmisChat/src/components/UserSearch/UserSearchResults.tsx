import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Avatar, CheckSend, Close, useTheme, useViewport, Right } from 'ermis-chat-react-native';
import { useUserSearchContext } from '../../context/UserSearchContext';

import type { UserResponse } from 'ermis-chat-sdk';

import type { ErmisChatGenerics } from '../../types';
import { Search } from '../../icons/Search';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(calendar);

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  emptyResultIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
  },
  emptyResultIndicatorText: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
  },
  flex: { flex: 1 },
  gradient: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  matches: { fontSize: 12 },
  searchResultContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 12,
  },
  searchResultUserDetails: {
    flex: 1,
    paddingLeft: 8,
  },
  searchResultUserLastOnline: { fontSize: 12 },
  searchResultUserName: { fontSize: 14, fontWeight: '700' },
  sectionHeader: {
    fontSize: 14.5,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});

type UserSearchResultsProps = {
  groupedAlphabetically?: boolean;
  removeOnPressOnly?: boolean;
  results?: UserResponse<ErmisChatGenerics>[];
  showOnlineStatus?: boolean;
  toggleSelectedUser?: (user: UserResponse<ErmisChatGenerics>) => void;
};

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  groupedAlphabetically = true,
  removeOnPressOnly = false,
  results: resultsProp,
  showOnlineStatus = true,
  toggleSelectedUser,
}) => {
  const {
    loading,
    loadMore,
    results: resultsContext,
    contacts,
    searchText,
    selectedUserIds,
    toggleUser,
    fetchContacts
  } = useUserSearchContext();
  const [sections, setSections] = useState<
    Array<{
      data: UserResponse<ErmisChatGenerics>[];
      title: string;
    }>
  >([]);
  const [visibleItemCount, setVisibleItemCount] = useState(2);
  const {
    theme: {
      colors: {
        accent_blue,
        bg_gradient_end,
        bg_gradient_start,
        black,
        border,
        grey,
        grey_gainsboro,
        white_smoke,
        white_snow,
      },
      ermisColors
    },
  } = useTheme();
  const colorScheme = useColorScheme();
  const { vw } = useViewport();

  const handleViewMore = () => {
    setVisibleItemCount(prevCount => prevCount + 2);
  };
  const results = resultsProp || resultsContext;
  const contactsLength = contacts.length;

  useEffect(() => {
    const newSections: {
      [key: string]: {
        data: UserResponse<ErmisChatGenerics>[];
        title: string;
      };
    } = {};

    contacts.forEach((user) => {

      const initial = user.name ? user.name?.slice(0, 1).toUpperCase() : user.id.slice(0, 1).toUpperCase();

      if (!initial) {
        return;
      }

      if (!newSections[initial]) {
        newSections[initial] = {
          data: [user],
          title: initial,
        };
      } else {
        newSections[initial].data.push(user);
      }
    });

    setSections(Object.values(newSections).sort((a, b) => a.title.localeCompare(b.title)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactsLength]);
  useEffect(() => {

    if (contacts.length === 0) {
      fetchContacts();
    }
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: white_snow }]}>
      {searchText && <Text
        style={[
          styles.matches,
          {
            color: grey,
            paddingHorizontal: 8,
          },
        ]}
      >
        Suggested
      </Text>}
      {loading && searchText === '' ? (
        <ActivityIndicator size='small' />
      ) : (!results || results.length == 0) ? <></> : (
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
          data={results}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (toggleSelectedUser) {
                  toggleSelectedUser(item);
                } else {
                  toggleUser(item);
                }
              }}
              style={[
                styles.searchResultContainer,
                {
                  backgroundColor: white_snow,
                  borderBottomColor: border,
                },
              ]}
            >
              <Avatar image={item.avatar} name={item.name} size={40} id={item.id} />
              <View style={styles.searchResultUserDetails}>
                <Text
                  style={[
                    styles.searchResultUserName,
                    {
                      color: black,
                    },
                  ]}
                >
                  {item.name}
                </Text>
                {showOnlineStatus && (
                  <Text
                    style={[
                      styles.searchResultUserLastOnline,
                      {
                        color: grey,
                      },
                    ]}
                  >
                    Last online {dayjs(item.last_active).calendar()}
                  </Text>
                )}
              </View>
              {selectedUserIds.indexOf(item.id) > -1 ? (
                <>
                  {removeOnPressOnly ? (
                    <Close pathFill={black} />
                  ) : (
                    <CheckSend pathFill={accent_blue} />
                  )}
                </>
              ) : <Right />}
            </TouchableOpacity>
          )}
        />
      )}
      {contacts.length > 0 && <>
        {results.length > 0 && <Text
          style={[
            styles.matches,
            {
              color: grey,
              paddingHorizontal: 8,
            },
          ]}
        >
          Contacts
        </Text>}
        <SectionList
          keyboardDismissMode='interactive'
          keyboardShouldPersistTaps='handled'
          // eslint-disable-next-line react/no-unstable-nested-components
          ListEmptyComponent={() => (
            <View style={styles.emptyResultIndicator}>
              <Search fill={grey_gainsboro} scale={5} />
              <Text style={[{ color: grey }, styles.emptyResultIndicatorText]}>
                {loading ? 'Loading...' : 'No user matches these keywords...'}
              </Text>
            </View>
          )}
          // style={{ flex: 1 }}
          onEndReached={loadMore}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (toggleSelectedUser) {
                  toggleSelectedUser(item);
                } else {
                  toggleUser(item);
                }
              }}
              style={[
                styles.searchResultContainer,
                {
                  backgroundColor: white_snow,
                  borderBottomColor: border,
                },
              ]}
            >
              <Avatar image={item.avatar} name={item.name} size={40} id={item.id} />
              <View style={styles.searchResultUserDetails}>
                <Text
                  style={[
                    styles.searchResultUserName,
                    {
                      color: black,
                    },
                  ]}
                >
                  {item.name || item.id}
                </Text>
                {showOnlineStatus && (
                  <Text
                    style={[
                      styles.searchResultUserLastOnline,
                      {
                        color: grey,
                      },
                    ]}
                  >
                    Last online {dayjs(item.last_active).calendar()}
                  </Text>
                )}
              </View>
              {selectedUserIds.indexOf(item.id) > -1 ? (
                <>
                  {removeOnPressOnly ? (
                    <Close pathFill={black} />
                  ) : (
                    <CheckSend pathFill={ermisColors[colorScheme].Primary.primary} />
                  )}
                </>
              ) : <Right />}
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => {
            if (searchText || !groupedAlphabetically) {
              return null;
            }

            return (
              <Text
                key={title}
                style={[
                  styles.sectionHeader,
                  {
                    backgroundColor: white_smoke,
                    color: grey,
                  },
                ]}
              >
                {title}
              </Text>
            );
          }}
          sections={sections}
          stickySectionHeadersEnabled
        />
      </>
      }
    </View>
  );
};
