import { getProfit, getDaysListed, getROI } from '../store';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ items, onEdit }) {
  const totalItems = items.length;
  const listed = items.filter((i) => i.status === 'listed');
  const sold = items.filter((i) => i.status === 'sold' || i.status === 'shipped');
  const unlisted = items.filter((i) => i.status === 'unlisted');

  const totalCost = items.reduce((s, i) => s + i.costPrice, 0);
  const totalRevenue = sold.reduce((s, i) => s + i.salePrice, 0);
  const totalProfit = sold.reduce((s, i) => s + (getProfit(i) || 0), 0);
  const inventoryValue = items.filter((i) => i.status !== 'sold' && i.status !== 'shipped').reduce((s, i) => s + i.costPrice, 0);
  const potentialRevenue = listed.reduce((s, i) => s + i.listPrice, 0);

  const avgDaysToSell = sold.length > 0
    ? sold.reduce((s, i) => {
        if (i.dateListed && i.dateSold) {
          return s + Math.round((new Date(i.dateSold) - new Date(i.dateListed)) / 86400000);
        }
        return s;
      }, 0) / sold.filter(i => i.dateListed && i.dateSold).length || 0
    : 0;

  const avgROI = sold.length > 0
    ? sold.reduce((s, i) => s + (getROI(i) || 0), 0) / sold.length
    : 0;

  // Aging items (listed > 30 days)
  const aging = listed.filter((i) => (getDaysListed(i) || 0) > 30);

  // Recent activity (last 10 items by most recent date)
  const recent = [...items]
    .sort((a, b) => {
      const da = a.dateSold || a.dateListed || a.dateAcquired || '';
      const db = b.dateSold || b.dateListed || b.dateAcquired || '';
      return db.localeCompare(da);
    })
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={totalItems} sub={`${listed.length} listed, ${unlisted.length} unlisted`} />
        <StatCard label="Total Invested" value={fmt(totalCost)} sub={`${fmt(inventoryValue)} in current inventory`} />
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub={`${sold.length} items sold`} />
        <StatCard
          label="Total Profit"
          value={fmt(totalProfit)}
          color={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          sub={`${avgROI.toFixed(0)}% avg ROI`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Potential Revenue" value={fmt(potentialRevenue)} sub="from listed items" />
        <StatCard label="Avg Days to Sell" value={avgDaysToSell ? avgDaysToSell.toFixed(0) : '—'} />
        <StatCard label="Avg ROI" value={avgROI ? `${avgROI.toFixed(1)}%` : '—'} color={avgROI > 0 ? 'text-emerald-400' : 'text-white'} />
        <StatCard label="Aging Items" value={aging.length} sub="> 30 days listed" color={aging.length > 0 ? 'text-amber-400' : 'text-white'} />
      </div>

      {/* Recent activity + aging alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No items yet. Add your first item to get started.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEdit(item)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.platform || item.category}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {aging.length > 0 && (
          <div className="bg-gray-900 border border-amber-900/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-amber-400">Aging Inventory</h2>
            <p className="text-sm text-gray-400 mb-3">These items have been listed for over 30 days.</p>
            <div className="space-y-2">
              {aging.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEdit(item)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.platform}</p>
                  </div>
                  <span className="text-xs text-amber-400">{getDaysListed(item)}d</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    unlisted: 'bg-gray-700 text-gray-300',
    listed: 'bg-blue-900/50 text-blue-400',
    sold: 'bg-emerald-900/50 text-emerald-400',
    shipped: 'bg-purple-900/50 text-purple-400',
    returned: 'bg-red-900/50 text-red-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || colors.unlisted}`}>
      {status}
    </span>
  );
}
