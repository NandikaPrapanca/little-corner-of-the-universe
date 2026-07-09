/**
 * Container.tsx
 * The universal content wrapper.
 * Centers content at max 720px with responsive horizontal padding.
 * Every section should wrap its content in this component.
 */

import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  /** Extra className on the wrapper */
  className?: string;
  /** HTML element to render as (default: 'div') */
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

export default function Container({
  children,
  className = '',
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag className={`content-wrapper ${className}`}>
      {children}
    </Tag>
  );
}
