import React, { useState, useEffect, ReactNode } from 'react';
import './ResponsiveLayout.css';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Handle case where matchMedia is not available (e.g., in tests)
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        setIsMobile(mediaQuery.matches);
      }
    };

    // Initial check
    checkIsMobile();

    // Listen for changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  const layoutClass = isMobile ? 'mobile-layout' : 'desktop-layout';

  const inlineStyles = {
    padding: isMobile ? '16px' : '24px',
    maxWidth: isMobile ? '100%' : '800px',
    margin: isMobile ? undefined : '0 auto',
  };

  return (
    <div
      data-testid="responsive-layout"
      className={`responsive-layout ${layoutClass}`}
      style={inlineStyles}
    >
      {children}
    </div>
  );
};
