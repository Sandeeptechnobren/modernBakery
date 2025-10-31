"use client";

import { useEffect } from 'react';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

export function CountryFlagPolyfill() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Running country-flag-emoji-polyfill...');
      polyfillCountryFlagEmojis();
    }
  }, []);
  return null; 
}