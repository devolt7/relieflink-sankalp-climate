import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Need } from '../types';
import { Edit2, Check, X, AlertTriangle, Trash2, PartyPopper, Sparkles } from 'lucide-react';

interface NeedsListProps {
  campId: string;
}

export function NeedsList({ campId }: NeedsListProps) {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    item: '',
    quantity_needed: 0,
    urgency: 'high' as 'critical' | 'high' | 'moderate'
  });
  const [updateError, setUpdateError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [reachedBanner, setReachedBanner] = useState<string | null>(null);

  const fetchNeeds = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const { data, error } = await supabase
        .from('needs')
        .select('*')
        .eq('camp_id', campId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching needs:', error);
        setFetchError(error.message);
      } else {
        setNeeds(data || []);
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      setFetchError(err.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
    
    const handleNeedAdded = () => fetchNeeds();
    window.addEventListener('need-added', handleNeedAdded);
    return () => window.removeEventListener('need-added', handleNeedAdded);
  }, [campId]);

  const isFulfilled = (need: Need) =>
    need.status === 'fulfilled' || need.quantity_fulfilled >= need.quantity_needed;

  // Soft-delete: a need with an existing donor claim can't be hard-deleted
  // (the claims table references it), and hard-deleting would destroy that
  // donation record anyway. Archiving hides it from both portals while
  // keeping the row — and the claim history attached to it — intact.
  const archiveNeed = async (needId: string) => {
    setUpdateError('');
    setDeletingId(needId);
    const { error } = await supabase.from('needs').update({ archived: true }).eq('id', needId);

    if (error) {
      console.error(error);
      setUpdateError(error.message);
    } else {
      setNeeds((prev) => prev.filter((n) => n.id !== needId));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const clearFulfilled = async () => {
    setUpdateError('');
    const fulfilledIds = needs.filter(isFulfilled).map((n) => n.id);
    if (fulfilledIds.length === 0) {
      setConfirmClearAll(false);
      return;
    }
    const { error } = await supabase.from('needs').update({ archived: true }).in('id', fulfilledIds);
    if (error) {
      console.error(error);
      setUpdateError(error.message);
    } else {
      setNeeds((prev) => prev.filter((n) => !fulfilledIds.includes(n.id)));
    }
    setConfirmClearAll(false);
  };

  // Coordinator's explicit confirmation that a need has been fully supplied —
  // shows a celebratory banner, then archives it off the active requirements list.
  const markFullyReached = async (need: Need) => {
    setReachedBanner(need.item);
    await archiveNeed(need.id);
    setTimeout(() => setReachedBanner(null), 3200);
  };

  const startEditing = (need: Need) => {
    setUpdateError('');
    setEditingId(need.id);
    setEditForm({
      item: need.item,
      quantity_needed: need.quantity_needed,
      urgency: need.urgency
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (needId: string) => {
    setUpdateError('');
    const { data, error } = await supabase
      .from('needs')
      .update({
        item: editForm.item,
        quantity_needed: editForm.quantity_needed,
        urgency: editForm.urgency
      })
      .eq('id', needId)
      .select();

    if (error) {
      console.error(error);
      setUpdateError(error.message);
    } else if (data) {
      setEditingId(null);
      setNeeds(needs.map(n => n.id === needId ? (data[0] as Need) : n));
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 font-semibold';
      case 'high': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 font-semibold';
      case 'moderate': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 font-semibold';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold';
    }
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'fulfilled') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 font-semibold';
    if (status === 'partially_fulfilled') return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 font-semibold';
    return 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 font-semibold';
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">Loading requirements...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-6 text-center flex flex-col items-center">
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 max-w-sm text-xs">
          <p className="font-bold">Error loading needs</p>
          <p className="mt-1 opacity-80">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (needs.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">No requirements posted</p>
        <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-xs text-xs font-medium">Use the requirement form above to post urgent camp demands.</p>
      </div>
    );
  }

  const fulfilledCount = needs.filter(isFulfilled).length;

  return (
    <div className="flex flex-col space-y-2.5 p-2 sm:p-3">
      <AnimatePresence>
        {reachedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-500/30 text-sm font-bold"
          >
            <PartyPopper className="w-4 h-4 shrink-0" />
            <span>Your supplies are fully reached! “{reachedBanner}” has been cleared from the list.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {updateError && (
        <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 text-xs font-medium">
          Failed to update: {updateError}
        </div>
      )}

      {needs.length > 0 && (
        <div className="flex items-center justify-end">
          {confirmClearAll ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Clear {fulfilledCount} fulfilled item{fulfilledCount === 1 ? '' : 's'}?</span>
              <button onClick={clearFulfilled} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Yes, clear</button>
              <button onClick={() => setConfirmClearAll(false)} className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-lg">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClearAll(true)}
              disabled={fulfilledCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Remove all fulfilled requirements from this list"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Clear fulfilled ({fulfilledCount})
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="popLayout">
      {needs.map((need, index) => {
        const isEditing = editingId === need.id;

        return (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            key={need.id}
            className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
          >
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editForm.item}
                  onChange={e => setEditForm({ ...editForm, item: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                />
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Urgency</label>
                    <select
                      value={editForm.urgency}
                      onChange={e => setEditForm({ ...editForm, urgency: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="moderate">Moderate</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Qty Needed</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.quantity_needed}
                      onChange={e => setEditForm({ ...editForm, quantity_needed: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={cancelEditing} className="px-3.5 py-1.5 text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs">
                    Cancel
                  </button>
                  <button onClick={() => saveEdit(need.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs">
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border tracking-tight ${getUrgencyColor(need.urgency)}`}>
                      {need.urgency}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border tracking-tight ${getStatusColor(need.status || 'pending')}`}>
                      {need.status || 'pending'}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{need.item}</h4>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5 sm:w-auto w-full border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 pt-2.5 sm:pt-0">
                  <div className="flex items-center gap-5">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Needed</p>
                      <p className="font-bold text-slate-900 dark:text-white text-base">{need.quantity_needed}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fulfilled</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{need.quantity_fulfilled || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditing(need)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:opacity-100"
                      title="Edit Need"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === need.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => archiveNeed(need.id)}
                          disabled={deletingId === need.id}
                          className="px-2 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-[11px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(need.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Need"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {isFulfilled(need) && (
                  <div className="pt-1">
                    <button
                      onClick={() => markFullyReached(need)}
                      disabled={deletingId === need.id}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm — supplies fully reached
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
}
