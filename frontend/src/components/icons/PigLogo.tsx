import React from 'react';

export function PigLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 8c-1.1 0-2-.9-2-2a2 2 0 0 0-4 0c0 1.1-.9 2-2 2H6c-2.2 0-4 1.8-4 4v7h2v-2h2v2h2v-7h4v7h2v-2h2v2h2v-7c0-2.2-1.8-4-4-4Z"/>
      <path d="M19 12h-2"/>
      <path d="M7 11v.01"/>
      <path d="M11 11v.01"/>
      <path d="M15 11v.01"/>
    </svg>
  );
}
