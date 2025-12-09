'use client';

import { useEffect } from 'react';

export function ViewportMeta() {
  useEffect(() => {
    // Ensure viewport-fit=cover is set for iOS devices
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    
    const content = viewport.getAttribute('content') || '';
    if (!content.includes('viewport-fit=cover')) {
      let updatedContent = content;
      
      if (content.includes('viewport-fit')) {
        updatedContent = content.replace(/viewport-fit=[^,\s]+/g, 'viewport-fit=cover');
      } else {
        updatedContent = content ? `${content}, viewport-fit=cover` : 'width=device-width, initial-scale=1, viewport-fit=cover';
        updatedContent = updatedContent.replace(/,\s*,/g, ',').replace(/^,\s*/, '');
      }
      
      viewport.setAttribute('content', updatedContent);
    }
  }, []);

  return null;
}

