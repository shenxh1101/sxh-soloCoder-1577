import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function InventoryPage() {
  const { flowers, lowStockFlowers, fetchInventory, fetchLowStock, restockFlower } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [restockModal, setRestockModal] = useState<{ id: number; name: string } | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, [fetchInventory, fetchLowStock]);

  const filteredFlowers = flowers.filter(f => {
    if (showLowStockOnly && f.stock > f.warning_threshold) return false;
    if (searchQuery && !f.name.includes(searchQuery)) return false;
    return true;
  });

  const handleRestock = async () => {
    if (!restockModal || !restockQuantity) return;
    const qty = parseInt(restockQuantity);
    if (qty <= 0) return;

    await restockFlower(restockModal.id, qty);
    setRestockModal(null);
    setRestockQuantity('');
  };

  const getStockStatus = (flower: typeof flowers[0]) => {
    if (flower.stock <= flower.warning_threshold / 2) {
      return { label: '严重不足', className: 'bg-red-100 text-red-600' };
    }
    if (flower.stock <= flower.warning_threshold) {
      return { label: '库存偏低', className: 'bg-amber-100 text-amber-600' };
    }
    return { label: '库存充足', className: 'bg-sage-100 text-sage-600' };
  };

  const totalValue = flowers.reduce((sum, f) => sum + f.cost_price * f.stock, 0);
  const lowStockCount = lowStockFlowers.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            库存管理
          </h1>
          <p className="text-cocoa-500 mt-1">
            共 {flowers.length} 种花材，库存总价值 ¥{totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-sage-500" />
            </div>
            <div>
              <p className="text-sm text-cocoa-500">花材种类</p>
              <p className="text-2xl font-semibold text-cocoa-800">{flowers.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-cocoa-500">库存预警</p>
              <p className="text-2xl font-semibold text-amber-600">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-cocoa-500">库存价值</p>
              <p className="text-2xl font-semibold text-primary-500">
                ¥{totalValue.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
            <input
              type="text"
              placeholder="搜索花材名称..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={e => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-cocoa-600">只看库存不足</span>
          </label>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-cocoa-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-cocoa-600">花材名称</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-cocoa-600">当前库存</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-cocoa-600">预警线</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-cocoa-600">成本价</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-cocoa-600">状态</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-cocoa-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-100">
            {filteredFlowers.map((flower, index) => {
              const status = getStockStatus(flower);
              const isLow = flower.stock <= flower.warning_threshold;
              return (
                <tr
                  key={flower.id}
                  className={`hover:bg-cocoa-50/50 transition-colors animate-slide-up ${
                    isLow ? 'bg-amber-50/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isLow ? 'bg-amber-100' : 'bg-sage-100'
                        }`}
                      >
                        <Leaf
                          className={`w-5 h-5 ${isLow ? 'text-amber-500' : 'text-sage-500'}`}
                        />
                      </div>
                      <span className="font-medium text-cocoa-800">{flower.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        isLow ? 'text-amber-600' : 'text-cocoa-800'
                      } ${isLow ? 'animate-pulse-soft' : ''}`}
                    >
                      {flower.stock}
                    </span>
                    <span className="text-cocoa-500 text-sm ml-1">{flower.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-cocoa-600">
                    {flower.warning_threshold}
                    <span className="text-cocoa-400 text-sm ml-1">{flower.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-cocoa-700">
                    ¥{flower.cost_price}/{flower.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setRestockModal({ id: flower.id, name: flower.name });
                        setRestockQuantity('');
                      }}
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium inline-flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      进货
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredFlowers.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-cocoa-300 mx-auto mb-3" />
            <p className="text-cocoa-400">没有找到匹配的花材</p>
          </div>
        )}
      </div>

      {restockModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setRestockModal(null)}
        >
          <div
            className="card p-6 w-full max-w-sm animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
              进货登记
            </h3>
            <p className="text-cocoa-600 mb-4">
              花材：<span className="font-medium">{restockModal.name}</span>
            </p>
            <div className="mb-6">
              <label className="text-sm text-cocoa-600 mb-1.5 block">进货数量</label>
              <input
                type="number"
                min="1"
                value={restockQuantity}
                onChange={e => setRestockQuantity(e.target.value)}
                placeholder="请输入数量"
                className="input-field"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleRestock()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRestockModal(null)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleRestock}
                disabled={!restockQuantity || parseInt(restockQuantity) <= 0}
                className="btn-sage flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认进货
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
