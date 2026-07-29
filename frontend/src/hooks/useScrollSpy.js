import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks the active section ID based on scroll position.
 * @param {string[]} sectionIds - Ordered array of section element IDs
 * @param {number} offset - Pixel offset from top (accounts for sticky navbar)
 * @returns {string} - ID of the currently active section
 */
export function useScrollSpy(sectionIds, offset = 100) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + offset;
    let currentActive = sectionIds[0] ?? '';

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        currentActive = id;
      }
    }

    setActiveId(currentActive);
  }, [sectionIds, offset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on mount to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return activeId;
}
