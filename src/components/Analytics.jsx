import { useMemo } from 'react';
import { getProfit, getROI } from '../store';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function BarChart({ data, label, valueKey, formatValue = (v) => v }) {
  if (data.length === 0) return <p className="text-gray-500 text-sm">No data</p>;
  const max = Math.max(...data.map((d) => Math.abs(d[valueKey])), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d[label]} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-28 truncate text-right">{d[label]}</span>
          <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden relative">
            <div
              className={`h-full rounded ${d[valueKey] >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}
              style={{ width: `${(Math.abs(d[valueKey]) / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-20 text-right">{formatValue(d[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics({ items }) {
  const sold = items.filter((i) => i.status === 'sold' || i.status === 'shipped');

  // Profit by category
  const byCategory = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const cat = i.category || 'Uncategorized';
      if (!map[cat]) map[cat] = { category: cat, profit: 0, count: 0, revenue: 0 };
      map[cat].profit += getProfit(i) || 0;
      map[cat].revenue += i.salePrice || 0;
      map[cat].count++;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [sold]);

  // Profit by platform
  const byPlatform = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const plat = i.platform || 'Unknown';
      if (!map[plat]) map[plat] = { platform: plat, profit: 0, count: 0, revenue: 0 };
      map[plat].profit += getProfit(i) || 0;
      map[plat].revenue += i.salePrice || 0;
      map[plat].count++;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [sold]);

  // Profit by source
  const bySource = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const src = i.source || 'Unknown';
      if (!map[src]) map[src] = { source: src, profit: 0, count: 0, revenue: 0 };
      map[src].profit += getProfit(i) || 0;
      map[src].revenue += i.salePrice || 0;
      map[src].count++;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [sold]);

  // Monthly profit trend
  const monthly = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      if (!i.dateSold) return;
      const month = i.dateSold.slice(0, 7); // YYYY-MM
      if (!map[month]) map[month] = { month, profit: 0, revenue: 0, count: 0, cost: 0 };
      map[month].profit += getProfit(i) || 0;
      map[month].revenue += i.salePrice || 0;
      map[month].cost += i.costPrice || 0;
      map[month].count++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [sold]);

  // Top performers
  const topItems = useMemo(() => {
    return [...sold]
      .map((i) => ({ ...i, profit: getProfit(i) || 0, roi: getROI(i) || 0 }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
  }, [sold]);

  const totalFees = sold.reduce((s, i) => s + (i.platformFees || 0), 0);
  const totalShipping = sold.reduce((s, i) => s + (i.shippingCost || 0), 0);

  return (
    <div className="space-y-6">
      {sold.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No sold items yet. Analytics will appear once you have sales data.</p>
        </div>
      ) : (
        <>
          {/* Fee breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Total Fees Paid</p>
              <p className="text-2xl font-bold text-red-400">{fmt(totalFees)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Total Shipping Costs</p>
              <p className="text-2xl font-bold text-red-400">{fmt(totalShipping)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Avg Profit / Item</p>
              <p className="text-2xl font-bold text-emerald-400">
                {fmt(sold.reduce((s, i) => s + (getProfit(i) || 0), 0) / sold.length)}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Avg ROI</p>
              <p className="text-2xl font-bold text-emerald-400">
                {(sold.reduce((s, i) => s + (getROI(i) || 0), 0) / sold.length).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Monthly trend */}
          {monthly.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Monthly Profit Trend</h2>
              <BarChart data={monthly} label="month" valueKey="profit" formatValue={fmt} />
            </div>
          )}

          {/* Charts grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Profit by Category</h2>
              <BarChart data={byCategory} label="category" valueKey="profit" formatValue={fmt} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Profit by Platform</h2>
              <BarChart data={byPlatform} label="platform" valueKey="profit" formatValue={fmt} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Profit by Source</h2>
              <BarChart data={bySource} label="source" valueKey="profit" formatValue={fmt} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
              {topItems.length > 0 ? (
                <div className="space-y-2">
                  {topItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 w-6">{idx + 1}.</span>
                      <span className="flex-1 truncate text-gray-200">{item.name}</span>
                      <span className={`font-medium ml-3 ${item.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(item.profit)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 w-14 text-right">{item.roi.toFixed(0)}% ROI</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
