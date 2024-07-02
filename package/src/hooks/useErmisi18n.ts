import { useEffect, useState } from 'react';

import Dayjs from 'dayjs';

import { useIsMountedRef } from './useIsMountedRef';

import type { TranslatorFunctions } from '../contexts/translationContext/TranslationContext';
import { Ermisi18n } from '../utils/i18n/Ermisi18n';

export const useErmisi18n = (i18nInstance?: Ermisi18n) => {
  const [translators, setTranslators] = useState<TranslatorFunctions>({
    t: (key: string) => key,
    tDateTimeParser: (input?: string | number | Date) => Dayjs(input),
  });
  const isMounted = useIsMountedRef();

  useEffect(() => {
    let ermisi18n: Ermisi18n;

    if (i18nInstance instanceof Ermisi18n) {
      ermisi18n = i18nInstance;
    } else {
      ermisi18n = new Ermisi18n({ language: 'en' });
    }

    const updateTFunction = (t: TranslatorFunctions['t']) => {
      setTranslators((prevTranslator) => ({ ...prevTranslator, t }));
    };

    const { unsubscribe: unsubscribeOnLanguageChangeListener } =
      ermisi18n.addOnLanguageChangeListener((t) => {
        updateTFunction(t);
      });

    const { unsubscribe: unsubscribeOnTFuncOverrideListener } =
      ermisi18n.addOnTFunctionOverrideListener((t) => {
        updateTFunction(t);
      });

    ermisi18n.getTranslators().then((translator) => {
      if (translator && isMounted.current) setTranslators(translator);
    });

    return () => {
      unsubscribeOnTFuncOverrideListener();
      unsubscribeOnLanguageChangeListener();
    };
  }, [i18nInstance]);

  return translators;
};
