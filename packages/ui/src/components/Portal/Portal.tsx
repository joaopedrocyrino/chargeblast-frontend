'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsMounted } from '../../hooks/useIsomorphicMounted';

/**
 * Where portalled overlays mount. Defaults to `document.body`; a modal
 * `<dialog>` provides itself, because anything outside an open modal dialog
 * is inert and rendered beneath the top layer (a Select's listbox would be
 * hidden behind the dialog and unclickable).
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

/** Renders children into the nearest portal container (client only; SSR renders nothing). */
export function Portal({ children }: { readonly children: ReactNode }): ReactNode {
  const mounted = useIsMounted();
  const container = useContext(PortalContainerContext);
  return mounted ? createPortal(children, container ?? document.body) : null;
}
