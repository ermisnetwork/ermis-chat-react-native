import { useEffect, useMemo, useState } from 'react';

import type { Channel } from 'ermis-chat-sdk';

import {
  allOwnCapabilities,
  OwnCapabilitiesContextValue,
  OwnCapability,
} from '../../../contexts/ownCapabilitiesContext/OwnCapabilitiesContext';
import type { DefaultErmisChatGenerics } from '../../../types/types';

export const useCreateOwnCapabilitiesContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>({
  channel,
  overrideCapabilities,
}: {
  channel: Channel<ErmisChatGenerics>;
  overrideCapabilities?: Partial<OwnCapabilitiesContextValue>;
}) => {
  const [own_capabilities, setOwnCapabilites] = useState(
    JSON.stringify(channel.data?.own_capabilities as Array<string>),
  );
  const overrideCapabilitiesStr = overrideCapabilities
    ? JSON.stringify(Object.values(overrideCapabilities))
    : null;

  // Effect to watch for changes in channel.data?.own_capabilities and update the own_capabilties state accordingly.
  useEffect(() => {
    setOwnCapabilites(JSON.stringify(channel.data?.own_capabilities as Array<string>));
  }, [channel.data?.own_capabilities]);

  // Effect to listen to the `capabilities.changed` event.
  useEffect(() => {
    const listener = channel.on('capabilities.changed', (event) => {
      if (event.own_capabilities) {
        setOwnCapabilites(JSON.stringify(event.own_capabilities as Array<string>));
      }
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  const ownCapabilitiesContext: OwnCapabilitiesContextValue = useMemo(() => {
    const capabilities = (own_capabilities || []) as Array<string>;
    const ownCapabilitiesContext = Object.keys(allOwnCapabilities).reduce(
      (result, capability) => ({
        ...result,
        [capability]:
          overrideCapabilities?.[capability as OwnCapability] ??
          !!capabilities.includes(allOwnCapabilities[capability as OwnCapability]),
      }),
      {} as OwnCapabilitiesContextValue,
    );

    return ownCapabilitiesContext;
  }, [channel.id, overrideCapabilitiesStr, own_capabilities]);

  return ownCapabilitiesContext;
};
