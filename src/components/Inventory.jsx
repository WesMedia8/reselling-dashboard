import { useState, useMemo } from 'react';
import { getProfit, getROI, getDaysListed, STATUSES, getUniqueValues } from '../store';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Inventory({ items, onEdit, onDelete, onUpdate }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dateAcquired');
  const [sortDir, setSortDir] = useState('desc');

  const categories = useMemo(() => getUniqueValues(items, 'category'), [items]);
  const platforms = useMemo(() => getUniqueValues(items, 'platform'), [items]);

  const filtered = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q) ||
        i.source?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter((i) => i.status === filterStatus);
    if (filterPlatform !== 'all') result = result.filter((i) => i.platform === filterPlatform);
    if (filterCategory !== 'all') result = result.filter((i) => i.category === filterCategory);

    result.sort((a, b) => {
      let va, vb;
      if (sortBy === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sortBy === 'costPrice' || sortBy === 'listPrice' || sortBy === 'salePrice') { va = a[sortBy]; vb = b[sortBy]; }
      else if (sortBy === 'profit') { va = getProfit(a) || 0; vb = getProfit(b) || 0; }
      else if (sortBy === 'daysListed') { va = getDaysListed(a) || 0; vb = getDaysListed(b) || 0; }
      else { va = a[sortBy] || ''; vb = b[sortBy] || ''; }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, search, filterStatus, filterPlatform, filterCategory, sortBy, sortDir]);

  function toggleSort(field) {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('desc'); }
  }

  function handleQuickStatus(item, newStatus) {
    const updates = { status: newStatus };
    if (newStatus === 'listed' && !item.dateListed) updates.dateListed = new Date().toISOString().slice(0, 10);
    if (newStatus === 'sold' && !item.dateSold) updates.dateSold = new Date().toISOString().slice(0, 10);
    onUpdate(item.id, updates);
  }

  const selectClass = "bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500";
  const thClass = "px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 select-none";

  const sortIcon = (field) => sortBy === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 w-64 focus:outline-none focus:border-emerald-500"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className={selectClass}>
          <option value="all">All Platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={selectClass}>
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className={thClass} onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th className={thClass} onClick={() => toggleSort('category')}>Category{sortIcon('category')}</th>
                <th className={thClass} onClick={() => toggleSort('platform')}>Platform{sortIcon('platform')}</th>
                <th className={thClass} onClick={() => toggleSort('costPrice')}>Cost{sortIcon('costPrice')}</th>
                <th className={thClass} onClick={() => toggleSort('listPrice')}>List{sortIcon('listPrice')}</th>
                <th className={thClass} onClick={() => toggleSort('salePrice')}>Sold{sortIcon('salePrice')}</th>
                <th className={thClass} onClick={() => toggleSort('profit')}>Profit{sortIcon('profit')}</th>
                <th className={thClass}>Status</th>
                <th className={thClass} onClick={() => toggleSort('daysListed')}>Days{sortIcon('daysListed')}</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">No items found</td></tr>
              ) : (
                filtered.map((item) => {
                  const profit = getProfit(item);
                  const roi = getROI(item);
                  const days = getDaysListed(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-3 py-2">
                        <button onClick={() => onEdit(item)} className="text-sm font-medium text-left hover:text-emerald-400 cursor-pointer bg-transparent border-none text-gray-100 p-0">
                          {item.name}
                        </button>
                        {item.source && <p className="text-xs text-gray-500">{item.source}</p>}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-400">{item.category}</td>
                      <td className="px-3 py-2 text-sm text-gray-400">{item.platform}</td>
                      <td className="px-3 py-2 text-sm">{fmt(item.costPrice)}</td>
                      <td className="px-3 py-2 text-sm">{item.listPrice ? fmt(item.listPrice) : '—'}</td>
                      <td className="px-3 py-2 text-sm">{item.salePrice ? fmt(item.salePrice) : '—'}</td>
                      <td className={`px-3 py-2 text-sm font-medium ${profit !== null ? (profit >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
                        {profit !== null ? fmt(profit) : '—'}
                        {roi !== null && <span className="text-xs text-gray-500 ml-1">({roi.toFixed(0)}%)</span>}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleQuickStatus(item, e.target.value)}
                          className="bg-transparent border border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-400">
                        {days !== null ? `${days}d` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => onEdit(item)} className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 cursor-pointer transition-colors text-gray-300">
                            Edit
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this item?')) onDelete(item.id); }}
                            className="text-xs px-2 py-1 bg-gray-800 hover:bg-red-900/50 hover:border-red-800 rounded border border-gray-700 cursor-pointer transition-colors text-gray-300 hover:text-red-400"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
