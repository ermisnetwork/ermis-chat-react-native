import React, { FC } from 'react';

import type { ErmisChat, WalletConnect } from 'ermis-chat-sdk';

import type { LoginConfig, ErmisChatGenerics } from '../types';

type AppContextType = {
  chatClient: ErmisChat<ErmisChatGenerics> | null;
  walletConnect: WalletConnect;
  loginUser: (config: LoginConfig) => void;
  logout: () => void;
  switchUser: (config?: LoginConfig) => void;
  unreadCount: number | undefined;
};

export const AppContext = React.createContext({} as AppContextType);

export const useAppContext = () => React.useContext(AppContext);
