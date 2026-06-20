import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — fixed overlay on all screen sizes;
          on desktop it is always visible (translate-x-0).
          On mobile it slides in/out via isSidebarOpen. */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile backdrop — tap to close sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content — pushed right by the sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
