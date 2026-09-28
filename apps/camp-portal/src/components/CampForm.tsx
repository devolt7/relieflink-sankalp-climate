import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camp } from '../types';

interface CampFormProps {
  onCancel: () => void;
  onSuccess: (camp: Camp) => void;
}

export function CampForm({ onCancel, onSuccess }: CampFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    district: '',
    lat: '',
    lng: '',
    contact_phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { data, error: submitError } = await supabase
      .from('camps')
      .insert({
        name: formData.name,
        state: formData.state,
        district: formData.district,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        contact_phone: formData.contact_phone
      })
      .select();

    if (submitError) {
      console.error(submitError);
      setError(submitError.message || 'Failed to add camp');
      setIsSubmitting(false);
    } else if (data && data.length > 0) {
      onSuccess(data[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Camp Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="e.g. Majuli Relief Camp A"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">State</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="e.g. Assam, Kerala"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">District</label>
          <input
            type="text"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="e.g. Majuli"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Latitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="e.g. 26.98"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Longitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="e.g. 94.63"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Contact Phone</label>
          <input
            type="tel"
            required
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors"
            placeholder="+91..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-xs shadow-xs"
        >
          {isSubmitting ? 'Registering...' : 'Register Camp'}
        </button>
      </div>
    </form>
  );
}
