import React, { useContext } from 'react';

import { Keyboard } from 'react-native';

import type { DefaultErmisChatGenerics } from '../../types/types';
import { getDisplayName } from '../utils/getDisplayName';

export type KeyboardContextValue = {
  dismissKeyboard: () => void;
};

export const KeyboardContext = React.createContext({
  dismissKeyboard: Keyboard.dismiss,
});

type Props = React.PropsWithChildren<{
  value: KeyboardContextValue;
}>;

export const KeyboardProvider = ({ children, value }: Props) => (
  <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>
);

export const useKeyboardContext = () => useContext(KeyboardContext);

/**
 * @deprecated
 *
 * This will be removed in the next major version.
 *
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withKeyboardContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withKeyboardContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  Component: React.ComponentType<ErmisChatGenerics>,
): React.ComponentType<Omit<ErmisChatGenerics, keyof KeyboardContextValue>> => {
  const WithKeyboardContextComponent = (
    props: Omit<ErmisChatGenerics, keyof KeyboardContextValue>,
  ) => {
    const keyboardContext = useKeyboardContext();

    return <Component {...(props as ErmisChatGenerics)} {...keyboardContext} />;
  };
  WithKeyboardContextComponent.displayName = `WithKeyboardContext${getDisplayName(
    Component as React.ComponentType,
  )}`;
  return WithKeyboardContextComponent;
};
