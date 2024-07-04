import React from 'react';

import type { ErmisChat } from 'ermis-chat-sdk';

import type { LoginConfig, ErmisChatGenerics } from '../types';

type AppContextType = {
  chatClient: ErmisChat<ErmisChatGenerics> | null;
  loginUser: (config: LoginConfig) => void;
  logout: () => void;
  switchUser: (config?: LoginConfig) => void;
  unreadCount: number | undefined;
};

export const AppContext = React.createContext({} as AppContextType);

export const useAppContext = () => React.useContext(AppContext);
