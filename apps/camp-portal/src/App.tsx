/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PinGate } from './components/PinGate';
import { CampPortal } from './components/CampPortal';
import { Moon, Sun, HeartHandshake } from 'lucide-react';

// Where the donor-facing app lives. Set VITE_DONOR_PORTAL_URL in .env once
// it's deployed; falls back to the local dev port (5173) in the meantime.
const DONOR_PORTAL_URL = import.meta.env.VITE_DONOR_PORTAL_URL || 'http://localhost:5173';

export default function App() {
  // Stay signed in across a page refresh — cleared when the browser tab closes.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('relieflink_authenticated') === 'true'
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleAuthenticated = () => {
    sessionStorage.setItem('relieflink_authenticated', 'true');
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // Check initial preference
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedPref = localStorage.getItem('theme');
    const shouldBeDark = storedPref === 'dark' || (!storedPref && isDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 relative z-20 transition-colors duration-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0 shadow-xs">
            <img src="/logo.svg" alt="ReliefLink Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">SANKALP <span className="text-red-600 dark:text-red-400">· ReliefLink</span></h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-500/20">
                Crisis Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Climate Edition · Predict, Prepare, Recover</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
              <span className="hidden sm:inline">Live Sync Active</span>
              <span className="sm:hidden">Live</span>
            </div>
          )}
          <a
            href={DONOR_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
            title="Open the Donor Portal in a new tab"
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">Donor Portal</span>
          </a>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/60 dark:border-slate-700/60"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 relative z-10 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div 
              key="pingate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-center items-center p-2"
            >
              <PinGate onAuthenticated={handleAuthenticated} />
            </motion.div>
          ) : (
            <motion.div 
              key="portal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <CampPortal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {isAuthenticated && (
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 text-center shrink-0 relative z-20 text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
           ReliefLink Coordination Engine • Authorized Field Access Only
        </footer>
      )}
    </div>
  );
}
