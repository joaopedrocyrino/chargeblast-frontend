'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CloseIcon } from '../../icons/icons';
import { cx } from '../../utils/cx';
import { IconButton } from '../IconButton/IconButton';
import { PortalContainerContext } from '../Portal/Portal';
import styles from './Dialog.module.css';

export interface DialogProps {
  readonly open: boolean;
  /** Called on Escape, the close button or a backdrop click. */
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children?: ReactNode;
  /** Actions row, right-aligned below the body. */
  readonly footer?: ReactNode;
  /** Panel width in px (capped by the viewport). Default 520. */
  readonly width?: number;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * Modal dialog built on the native `<dialog>` element, which provides the
 * focus trap, inert background, top-layer stacking and Escape handling.
 * Content is only mounted while open, so form state resets on every open.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 520,
  className,
  'data-testid': testId,
}: DialogProps): ReactNode {
  const titleId = useId();
  const descriptionId = useId();
  // State rather than a ref so portalled children re-render into the dialog.
  const [element, setElement] = useState<HTMLDialogElement | null>(null);
  // A drag that starts inside the panel (e.g. selecting text) and ends on the
  // backdrop must not close the dialog, so both ends must be on the backdrop.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    if (!element) return;
    if (open && !element.open) {
      if (typeof element.showModal === 'function') element.showModal();
      else element.setAttribute('open', '');
    } else if (!open && element.open) {
      if (typeof element.close === 'function') element.close();
      else element.removeAttribute('open');
    }
  }, [open, element]);

  return (
    <dialog
      ref={setElement}
      className={cx(styles.dialog, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-testid={testId}
      onCancel={(event) => {
        // Keep React in charge of `open`: the browser must not close it alone.
        event.preventDefault();
        onClose();
      }}
      // The panel fills the dialog box, so an event on the dialog itself is the backdrop.
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
        pressedBackdrop.current = false;
      }}
    >
      {open ? (
        <PortalContainerContext value={element}>
          <div className={styles.panel} style={{ width }}>
            <header className={styles.header}>
              <div>
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className={styles.description}>
                    {description}
                  </p>
                ) : null}
              </div>
              <IconButton aria-label="Close" icon={<CloseIcon size={14} />} onClick={onClose} />
            </header>
            <div className={styles.body}>{children}</div>
            {footer ? <footer className={styles.footer}>{footer}</footer> : null}
          </div>
        </PortalContainerContext>
      ) : null}
    </dialog>
  );
}
