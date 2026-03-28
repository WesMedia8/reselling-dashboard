import { useState } from 'react';
import { STATUSES } from '../store';

export default function ItemForm({ item, onSave, onClose, categories = [], platforms = [] }) {
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || '',
    platform: item?.platform || '',
    source: item?.source || '',
    costPrice: item?.costPrice || '',
    listPrice: item?.listPrice || '',
    salePrice: item?.salePrice || '',
    shippingCost: item?.shippingCost || '',
    platformFees: item?.platformFees || '',
    status: item?.status || 'unlisted',
    notes: item?.notes || '',
    location: item?.location || '',
    dateAcquired: item?.dateAcquired || new Date().toISOString().slice(0, 10),
    dateListed: item?.dateListed || '',
    dateSold: item?.dateSold || '',
    imageUrl: item?.imageUrl || '',
  });

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Item Name *</label>
            <input required value={form.name} onChange={set('name')} className={inputClass} placeholder="e.g. Nike Air Max 90" />
          </div>

          {/* Row: Category, Platform, Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              {addingCategory ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCategory.trim()) {
                          setForm((f) => ({ ...f, category: newCategory.trim() }));
                          setNewCategory('');
                          setAddingCategory(false);
                        }
                      } else if (e.key === 'Escape') {
                        setAddingCategory(false);
                        setNewCategory('');
                      }
                    }}
                    className={inputClass}
                    placeholder="New category..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim()) {
                        setForm((f) => ({ ...f, category: newCategory.trim() }));
                        setNewCategory('');
                        setAddingCategory(false);
                      }
                    }}
                    className="px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <select value={form.category} onChange={set('category')} className={inputClass}>
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="px-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-lg cursor-pointer shrink-0 leading-none"
                    title="Add new category"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Platform</label>
              {addingPlatform ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPlatform.trim()) {
                          setForm((f) => ({ ...f, platform: newPlatform.trim() }));
                          setNewPlatform('');
                          setAddingPlatform(false);
                        }
                      } else if (e.key === 'Escape') {
                        setAddingPlatform(false);
                        setNewPlatform('');
                      }
                    }}
                    className={inputClass}
                    placeholder="New platform..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPlatform.trim()) {
                        setForm((f) => ({ ...f, platform: newPlatform.trim() }));
                        setNewPlatform('');
                        setAddingPlatform(false);
                      }
                    }}
                    className="px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <select value={form.platform} onChange={set('platform')} className={inputClass}>
                    <option value="">Select...</option>
                    {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddingPlatform(true)}
                    className="px-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-lg cursor-pointer shrink-0 leading-none"
                    title="Add new platform"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={set('status')} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Source, Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Source</label>
              <input value={form.source} onChange={set('source')} className={inputClass} placeholder="e.g. Goodwill, Garage Sale" />
            </div>
            <div>
              <label className={labelClass}>Storage Location</label>
              <input value={form.location} onChange={set('location')} className={inputClass} placeholder="e.g. Bin A3, Shelf 2" />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className={labelClass}>Cost $</label>
              <input type="number" step="0.01" min="0" value={form.costPrice} onChange={set('costPrice')} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>List Price $</label>
              <input type="number" step="0.01" min="0" value={form.listPrice} onChange={set('listPrice')} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Sale Price $</label>
              <input type="number" step="0.01" min="0" value={form.salePrice} onChange={set('salePrice')} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Shipping $</label>
              <input type="number" step="0.01" min="0" value={form.shippingCost} onChange={set('shippingCost')} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Fees $</label>
              <input type="number" step="0.01" min="0" value={form.platformFees} onChange={set('platformFees')} className={inputClass} placeholder="0.00" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date Acquired</label>
              <input type="date" value={form.dateAcquired} onChange={set('dateAcquired')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date Listed</label>
              <input type="date" value={form.dateListed} onChange={set('dateListed')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date Sold</label>
              <input type="date" value={form.dateSold} onChange={set('dateSold')} className={inputClass} />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className={labelClass}>Image URL</label>
            <input value={form.imageUrl} onChange={set('imageUrl')} className={inputClass} placeholder="https://..." />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputClass} placeholder="Any additional notes..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium cursor-pointer transition-colors">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
