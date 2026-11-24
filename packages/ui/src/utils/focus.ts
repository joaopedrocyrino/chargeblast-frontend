const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
  );
}

/** Focuses the element marked `data-autofocus`, else the first focusable, else the container. */
export function focusInitial(container: HTMLElement): void {
  const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
  const target = preferred ?? getFocusableElements(container)[0] ?? container;
  target.focus({ preventScroll: true });
}
