import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Compass } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex overflow-x-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto">
          <div className="lg:hidden flex items-center justify-between mb-8 bg-white dark:bg-surface-900 p-4 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <Compass size={20} />
              </div>
              <span className="font-bold text-surface-900 dark:text-white">Venture Management</span>
            </div>
            <button onClick={() => setMobileOpen(true)} className="p-2 text-surface-500">
              <Menu size={24} />
            </button>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
