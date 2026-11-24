import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered width and height in px. Default 16. */
  readonly size?: number;
  /**
   * Accessible label. When omitted the icon is decorative (`aria-hidden`),
   * which is correct whenever adjacent text already conveys the meaning.
   */
  readonly title?: string;
  /** Stroke width in viewBox units (16×16 grid). Defaults to the icon's own weight (usually 1.5). */
  readonly strokeWidth?: number;
}

export type IconComponent = ((props: IconProps) => ReactNode) & { displayName: string };

/**
 * Builds a stroke-based 16×16 icon that inherits `currentColor`, so icons
 * follow the surrounding text colour unless `color` is set explicitly.
 */
export function createIcon(
  displayName: string,
  body: ReactNode,
  options: { readonly strokeWidth?: number } = {},
): IconComponent {
  const defaultStrokeWidth = options.strokeWidth ?? 1.5;
  function Icon({ size = 16, title, strokeWidth = defaultStrokeWidth, ...rest }: IconProps): ReactNode {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        data-icon={displayName}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {body}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}
