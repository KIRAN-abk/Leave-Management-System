import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - fixed and sticky */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        
        {/* Viewport content */}
        <main className="flex-1 p-8 overflow-y-auto fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
