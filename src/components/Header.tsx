import React from 'react';

export const Header: React.FC = () => {
  return (
    <header id="app-header" className="bg-white border-b-2 border-neutral-900 shadow-3xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-center text-center">
        <h1 className="text-base sm:text-xl font-black text-neutral-950 font-display tracking-tight truncate">
          MBS Budget Calculator
        </h1>
      </div>
    </header>
  );
};


