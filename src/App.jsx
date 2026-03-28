import { useState, useEffect, useMemo } from 'react';
import { loadData, saveData, addItem, updateItem, deleteItem, getUniqueValues } from './store';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ItemForm from './components/ItemForm';
import Analytics from './components/Analytics';

const TABS = ['Dashboard', 'Inventory', 'Analytics'];

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = useMemo(() => getUniqueValues(data.items, 'category'), [data.items]);
  const platforms = useMemo(() => getUniqueValues(data.items, 'platform'), [data.items]);

  useEffect(() => {
    saveData(data);
  }, [data]);

  function handleAdd(item) {
    setData((d) => addItem(d, item));
    setShowForm(false);
  }

  function handleUpdate(id, updates) {
    setData((d) => updateItem(d, id, updates));
    setEditingItem(null);
    setShowForm(false);
  }

  function handleDelete(id) {
    setData((d) => deleteItem(d, id));
  }

  function handleEdit(item) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleExportCSV() {
    if (data.items.length === 0) return;
    const headers = ['Name','Category','Platform','Source','Cost','List Price','Sale Price','Shipping','Fees','Status','Location','Date Acquired','Date Listed','Date Sold','Notes'];
    const rows = data.items.map(i => [
      `"${(i.name || '').replace(/"/g, '""')}"`,
      i.category, i.platform, i.source, i.costPrice, i.listPrice, i.salePrice,
      i.shippingCost, i.platformFees, i.status, i.location, i.dateAcquired,
      i.dateListed, i.dateSold, `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reselling-inventory-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">Reselling Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors cursor-pointer"
            >
              Export CSV
            </button>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gray-950 text-white border-t border-x border-gray-800'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'Dashboard' && <Dashboard items={data.items} onEdit={handleEdit} />}
        {activeTab === 'Inventory' && (
          <Inventory items={data.items} onEdit={handleEdit} onDelete={handleDelete} onUpdate={handleUpdate} />
        )}
        {activeTab === 'Analytics' && <Analytics items={data.items} />}
      </main>

      {showForm && (
        <ItemForm
          item={editingItem}
          onSave={editingItem ? (updates) => handleUpdate(editingItem.id, updates) : handleAdd}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          categories={categories}
          platforms={platforms}
        />
      )}
    </div>
  );
}
