import { useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';

import type { UserFilters, UserResponse } from 'ermis-chat-sdk';

import type { ErmisChatGenerics, ContactResponse } from '../types';

export type PaginatedUsers = {
  clearText: () => void;
  initialResults: UserResponse<ErmisChatGenerics>[] | null;
  loading: boolean;
  loadMore: () => void;
  onChangeSearchText: (newText: string) => void;
  onFocusInput: () => void;
  removeUser: (index: number) => void;
  reset: () => void;
  results: UserResponse<ErmisChatGenerics>[];
  searchText: string;
  selectedUserIds: string[];
  selectedUsers: UserResponse<ErmisChatGenerics>[];
  setInitialResults: React.Dispatch<
    React.SetStateAction<UserResponse<ErmisChatGenerics>[] | null>
  >;
  setResults: React.Dispatch<React.SetStateAction<UserResponse<ErmisChatGenerics>[]>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserResponse<ErmisChatGenerics>[]>>;
  toggleUser: (user: UserResponse<ErmisChatGenerics>) => void;
  channelType: string;
  setChannelType: React.Dispatch<React.SetStateAction<string>>;
  getContacts: () => Promise<UserResponse<ErmisChatGenerics>[]>;
};

export const usePaginatedUsers = (): PaginatedUsers => {
  const { chatClient } = useAppContext();

  const [initialResults, setInitialResults] = useState<UserResponse<ErmisChatGenerics>[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<UserResponse<ErmisChatGenerics>[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResponse<ErmisChatGenerics>[]>([]);
  const [channelType, setChannelType] = useState<string>('messaging'); // ['messaging', 'team'
  const hasMoreResults = useRef(true);
  const offset = useRef(0);
  const queryInProgress = useRef(false);
  const reset = () => {
    setSearchText('');
    fetchUsers('');
    setSelectedUserIds([]);
    setSelectedUsers([]);
    setChannelType('messaging');
  };

  const addUser = (user: UserResponse<ErmisChatGenerics>) => {
    setSelectedUsers([...selectedUsers, user]);
    setSelectedUserIds((prevSelectedUserIds) => {
      prevSelectedUserIds.push(user.id);
      return prevSelectedUserIds;
    });
    setSearchText('');
    setResults(initialResults || []);
  };

  const removeUser = (index: number) => {
    if (index < 0) {
      return;
    }

    setSelectedUserIds((prevSelectedUserIds) => {
      const newSelectedUserIds = prevSelectedUserIds.slice();
      newSelectedUserIds.splice(index, 1);
      return newSelectedUserIds;
    });

    setSelectedUsers((prevSelectedUsers) => {
      const newSelectedUsers = prevSelectedUsers.slice();
      newSelectedUsers.splice(index, 1);
      return newSelectedUsers;
    });
  };

  const toggleUser = (user: UserResponse<ErmisChatGenerics>) => {
    if (!user.id) {
      return;
    }

    const existingIndex = selectedUserIds.indexOf(user.id);

    if (existingIndex > -1) {
      removeUser(existingIndex);
    } else {
      addUser(user);
    }
  };

  const onFocusInput = () => {
    if (!searchText) {
      setResults(initialResults || []);
      setLoading(false);
    } else {
      fetchUsers(searchText);
    }
  };

  const onChangeSearchText = (newText: string) => {
    setSearchText(newText);
    if (!newText) {
      setResults(initialResults || []);
      setLoading(false);
    } else {
      fetchUsers(newText);
    }
  };
  // Initial load users.
  // const getListUser = async () => {
  //   setLoading(true);
  //   const usersResponse = await chatClient?.queryUsers();
  //   console.log("data users : ", usersResponse?.data);

  //   setInitialResults(usersResponse?.data || []);
  //   setLoading(false);
  // }
  // TODO: KhoaKheu need to store in local storage, just update new user when select user or load channel when start app
  const fetchUsers = async (query = '') => {
    if (queryInProgress.current || !chatClient?.userID) {
      return;
    }
    setLoading(true);
    /*
    ** response always return array, so we don't need to check res?.data
    */
    // if (query == "") {
    //   queryInProgress.current = false;
    //   setLoading(false);
    //   return;
    // }

    try {
      const page = 1;
      const page_size = 25;

      const res = await chatClient?.searchUsers(
        page,
        page_size,
        query
      );

      // Dumb check to avoid duplicates
      if (query === searchText && res?.data.length !== 0 && results.findIndex((r) => res?.data[0].id === r.id) > -1) {
        queryInProgress.current = false;
        return;
      }

      setResults((r) => {
        if (query !== searchText) {
          return res?.data;
        }
        return r.concat(res?.data || []);
      });

      if (res?.data.length < 10 && (offset.current === 0 || query === searchText)) {
        hasMoreResults.current = false;
      }

      if (!query && offset.current === 0) {
        setInitialResults(res?.data || []);
      }
    } catch (e) {
      console.error('search users error : ', e);
    }
    queryInProgress.current = false;
    setLoading(false);
  };

  const loadMore = () => {
    fetchUsers(searchText);
  };
  const getContacts = async (): Promise<UserResponse<ErmisChatGenerics>[]> => {
    const users: UserResponse<ErmisChatGenerics>[] = [];
    try {
      const contactResponse: ContactResponse = await chatClient?.queryContacts();
      if (contactResponse) {
        console.log('contactResponse:', contactResponse);

        const userIDs: string[] = contactResponse.project_id_user_ids[chatClient?.projectId] || [];
        console.log('userIDs:', userIDs);

        userIDs.forEach((userID) => {
          const user = chatClient?.state.users[userID];
          if (user) {
            users.push(user);
          }
        });
      }
    } catch (e) {
      console.error('getContacts error:', e);
    }
    return users;
  }
  useEffect(() => {
    fetchUsers();
    // getListUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    clearText: () => {
      setSearchText('');
      fetchUsers('');
    },
    initialResults,
    loading,
    loadMore,
    onChangeSearchText,
    onFocusInput,
    removeUser,
    reset,
    results,
    searchText,
    selectedUserIds,
    selectedUsers,
    setInitialResults,
    setResults,
    setSearchText,
    setSelectedUsers,
    toggleUser,
    channelType,
    setChannelType,
    getContacts
  };
};
