import { useMemo } from 'react';

import type { TypingContextValue } from '../../../contexts/typingContext/TypingContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useCreateTypingContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  typing,
}: TypingContextValue<ErmisChatGenerics>) => {
  const typingValue = Object.keys(typing).join();

  const typingContext: TypingContextValue<ErmisChatGenerics> = useMemo(
    () => ({
      typing,
    }),
    [typingValue],
  );

  return typingContext;
};
