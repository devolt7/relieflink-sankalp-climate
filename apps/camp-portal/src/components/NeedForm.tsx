import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Plus } from 'lucide-react';

interface NeedFormProps {
  campId: string;
  onNeedAdded: () => void;
}

export function NeedForm({ campId, onNeedAdded }: NeedFormProps) {
  const [formData, setFormData] = useState({
    item: '',
    quantity_needed: '',
    urgency: 'high' as 'critical' | 'high' | 'moderate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { error: submitError } = await supabase
      .from('needs')
      .insert({
        camp_id: campId,
        item: formData.item,
        quantity_needed: parseInt(formData.quantity_needed, 10),
        urgency: formData.urgency
      })
      .select();

    if (submitError) {
      console.error(submitError);
      setError(submitError.message || 'Failed to post need');
    } else {
      setFormData({ item: '', quantity_needed: '', urgency: 'high' });
      onNeedAdded();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch relative">
      <div className="flex-1 w-full">
        <label className="sr-only">Item Needed</label>
        <input
          type="text"
          required
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
          placeholder="e.g. Clean Drinking Water, Blankets, Medicines"
        />
      </div>
      
      <div className="w-full sm:w-28">
        <label className="sr-only">Quantity</label>
        <input
          type="number"
          min="1"
          required
          value={formData.quantity_needed}
          onChange={(e) => setFormData({ ...formData, quantity_needed: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
          placeholder="Qty"
        />
      </div>

      <div className="w-full sm:w-36">
        <label className="sr-only">Urgency</label>
        <select
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
        >
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="moderate">🟡 Moderate</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs"
      >
        <Plus className="w-4 h-4" />
        <span>Add Requirement</span>
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </form>
  );
}
