import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from './ResponsiveLayout';
import ConverterAppWithSuggestions from './ConverterAppWithSuggestions';
import './ResponsiveConverterApp.css';

export const ResponsiveConverterApp: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mediaQuery.matches);
    };

    checkIsMobile();
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const layoutClass = isMobile ? 'mobile-layout' : 'desktop-layout';

  return (
    <ResponsiveLayout>
      <div
        data-testid="responsive-converter"
        className={`responsive-converter ${layoutClass}`}
      >
        <ConverterAppWithSuggestions />
      </div>
    </ResponsiveLayout>
  );
};
