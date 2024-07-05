import { useEffect, useRef, useState } from 'react';

import { useAppContext } from '../context/AppContext';

import type { UserFilters, UserResponse } from 'ermis-chat-sdk';

import type { ErmisChatGenerics } from '../types';

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

  const hasMoreResults = useRef(true);
  const offset = useRef(0);
  const queryInProgress = useRef(false);

  const reset = () => {
    setSearchText('');
    fetchUsers('');
    setSelectedUserIds([]);
    setSelectedUsers([]);
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

  const fetchUsers = async (query = '') => {
    if (queryInProgress.current || !chatClient?.userID) {
      return;
    }
    setLoading(true);

    try {
      const limit = 100;

      const res = await chatClient?.queryUsers(
        limit
      );

      if (!res?.results) {
        queryInProgress.current = false;
        return;
      }

      // Dumb check to avoid duplicates
      if (query === searchText && results.findIndex((r) => res?.results[0].id === r.id) > -1) {
        queryInProgress.current = false;
        return;
      }

      setResults((r) => {
        if (query !== searchText) {
          return res?.results;
        }
        return r.concat(res?.results || []);
      });

      if (res?.results.length < 10 && (offset.current === 0 || query === searchText)) {
        hasMoreResults.current = false;
      }

      if (!query && offset.current === 0) {
        setInitialResults(res?.results || []);
      }
    } catch (e) {
      // do nothing;
    }
    queryInProgress.current = false;
    setLoading(false);
  };

  const loadMore = () => {
    fetchUsers(searchText);
  };

  useEffect(() => {
    fetchUsers();
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
  };
};
