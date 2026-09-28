import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camp } from '../types';
import { CampForm } from './CampForm';
import { NeedsList } from './NeedsList';
import { NeedForm } from './NeedForm';
import { MapPin, Plus, Tent, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CampPortal() {
  const [camps, setCamps] = useState<Camp[]>([]);
  // Remember which camp was open so a page refresh lands back on it instead
  // of the camp list.
  const [selectedCampId, setSelectedCampId] = useState<string | null>(
    () => sessionStorage.getItem('relieflink_selected_camp')
  );
  const [isAddingCamp, setIsAddingCamp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  useEffect(() => {
    if (selectedCampId) {
      sessionStorage.setItem('relieflink_selected_camp', selectedCampId);
    } else {
      sessionStorage.removeItem('relieflink_selected_camp');
    }
  }, [selectedCampId]);

  const fetchCamps = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching camps:', error);
        setFetchError(error.message);
      } else {
        setCamps(data || []);
        // Don't auto-select on mobile to ensure they see the list first
        if (data && data.length > 0 && !selectedCampId && window.innerWidth >= 1024) {
          setSelectedCampId(data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      setFetchError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampAdded = (camp: Camp) => {
    setCamps([camp, ...camps]);
    setSelectedCampId(camp.id);
    setIsAddingCamp(false);
  };

  const selectedCamp = camps.find(c => c.id === selectedCampId);
  const showMainContent = selectedCamp || isAddingCamp;

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Sidebar for Camp Selection */}
      <aside className={`w-full lg:w-80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden shrink-0 ${showMainContent ? 'hidden lg:flex' : 'flex flex-1 lg:flex-none'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded-xl border border-red-100 dark:border-red-500/20">
              <Tent className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Relief Camps
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{camps.length} active locations</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingCamp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Add New Camp"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {fetchError ? (
              <div className="p-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
                <p className="font-bold mb-1">Connection Error</p>
                <p className="opacity-80 mb-2">{fetchError}</p>
                <button onClick={fetchCamps} className="px-3 py-1 bg-red-600 text-white rounded-lg font-semibold text-[11px]">Retry</button>
              </div>
            ) : camps.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tent className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No relief camps created yet.</p>
              </div>
            ) : (
              camps.map(camp => {
                const isSelected = selectedCampId === camp.id;
                return (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setSelectedCampId(camp.id);
                      setIsAddingCamp(false);
                    }}
                    className={`w-full group flex items-center justify-between p-3.5 rounded-xl transition-all border text-left ${
                      isSelected
                        ? 'bg-red-50/80 dark:bg-red-500/10 border-red-200/80 dark:border-red-500/30 text-red-950 dark:text-red-200 shadow-2xs'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className={`w-3 h-3 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-red-700 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {camp.district}, {camp.state}
                        </span>
                      </div>
                      <p className={`font-bold text-sm truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {camp.name}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-red-600 dark:text-red-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`} />
                  </button>
                );
              })
            )}
          </nav>
        )}
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col gap-5 overflow-hidden min-h-0 ${!showMainContent ? 'hidden lg:flex' : 'flex'}`}>
        <AnimatePresence mode="wait">
          {isAddingCamp ? (
            <motion.div 
              key="adding"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs p-5 sm:p-8 flex-1 overflow-y-auto"
            >
              <button 
                onClick={() => setIsAddingCamp(false)}
                className="lg:hidden flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 font-bold uppercase text-xs tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Camps
              </button>
              <div className="mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Register Relief Camp</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Add a new relief camp location to track urgent supplies and field requirements.</p>
              </div>
              <CampForm onCancel={() => setIsAddingCamp(false)} onSuccess={handleCampAdded} />
            </motion.div>
          ) : selectedCamp ? (
            <motion.div 
              key={selectedCamp.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="flex-1 flex flex-col gap-5 overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs p-5 sm:p-6 shrink-0">
                 <button 
                   onClick={() => setSelectedCampId(null)}
                   className="lg:hidden flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 font-bold uppercase text-xs tracking-wider transition-colors"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Back to Camps
                 </button>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-500/20">
                         <MapPin className="w-3 h-3" />
                         {selectedCamp.district}, {selectedCamp.state}
                       </span>
                     </div>
                     <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{selectedCamp.name}</h2>
                   </div>
                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                     <span>📞</span>
                     <span>{selectedCamp.contact_phone}</span>
                   </div>
                 </div>
                 
                 <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-5">
                   <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Post Urgent Requirement</h3>
                   <NeedForm campId={selectedCamp.id} onNeedAdded={() => window.dispatchEvent(new Event('need-added'))} />
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Required Inventory & Supplies</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <NeedsList campId={selectedCamp.id} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs p-8 sm:p-12 flex-1 flex flex-col items-center justify-center text-center hidden lg:flex"
            >
              <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-100 dark:border-red-500/20">
                <Tent className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Relief Camp</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm font-medium">Choose a camp location from the sidebar or add a new camp to manage field demands.</p>
              <button
                onClick={() => setIsAddingCamp(true)}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Register New Camp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
