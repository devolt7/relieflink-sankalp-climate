import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PinGateProps {
  onAuthenticated: () => void;
}

export function PinGate({ onAuthenticated }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const SHARED_PIN = import.meta.env.VITE_COORDINATOR_PIN || '1234';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SHARED_PIN) {
      onAuthenticated();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-md w-full mx-auto my-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center justify-center mb-5">
          <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Coordinator Verification</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Enter the access PIN to manage relief camp inventories.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="pin" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Access PIN
              </label>
              <span className="text-[11px] font-semibold text-slate-400">PIN: 1234</span>
            </div>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors text-lg text-center tracking-[0.5em] font-bold"
              placeholder="••••"
              autoFocus
            />
            {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{error}</motion.p>}
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors shadow-xs"
          >
            <span>Enter Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
