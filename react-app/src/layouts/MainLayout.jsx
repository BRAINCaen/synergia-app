// src/layouts/MainLayout.jsx
import React from 'react';
import Navigation from '../shared/components/Navigation';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
