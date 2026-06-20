import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Sidebar - responsive overlay on mobile, fixed on desktop */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Viewport content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
