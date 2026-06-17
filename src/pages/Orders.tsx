import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import StatusBadge from '../components/StatusBadge';
import type { OrderStatus } from '../../shared/types';

const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待制作' },
  { key: 'preparing', label: '制作中' },
  { key: 'delivering', label: '配送中' },
  { key: 'delivered', label: '已送达' },
  { key: 'cancelled', label: '已取消' },
];

export default function OrdersPage() {
  const { orders, fetchOrders, updateOrderStatus } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchOrders({
      status: statusFilter === 'all' ? undefined : statusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }, [statusFilter, dateFrom, dateTo, fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_phone.includes(query) ||
      order.delivery_address.toLowerCase().includes(query)
    );
  });

  // 按日期分组
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const date = order.delivery_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {} as Record<string, typeof orders>);

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => b.localeCompare(a));

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const dateStrOnly = dateStr;
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStrOnly === todayStr) return `今天 (${dateStr})`;
    if (dateStrOnly === tomorrowStr) return `明天 (${dateStr})`;
    if (dateStrOnly === yesterdayStr) return `昨天 (${dateStr})`;

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[date.getDay()]} ${dateStr}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            订单管理
          </h1>
          <p className="text-cocoa-500 mt-1">
            共 {filteredOrders.length} 个订单
          </p>
        </div>
        <Link to="/orders/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建订单
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
            <input
              type="text"
              placeholder="搜索客户姓名、电话、地址..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cocoa-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field w-36 text-sm"
              placeholder="开始日期"
            />
            <span className="text-cocoa-400">至</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field w-36 text-sm"
              placeholder="结束日期"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-cocoa-100">
          {statusFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === filter.key
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-cocoa-500 hover:bg-cocoa-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList className="w-16 h-16 text-cocoa-300 mx-auto mb-4" />
            <p className="text-cocoa-500">暂无订单</p>
            <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" />
              创建第一个订单
            </Link>
          </div>
        ) : (
          sortedDates.map((date, dateIndex) => (
            <div key={date} className="animate-slide-up" style={{ animationDelay: `${dateIndex * 50}ms` }}>
              <h2 className="text-sm font-medium text-cocoa-500 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary-400 rounded-full" />
                {formatDateLabel(date)}
                <span className="text-xs">({groupedOrders[date].length}单)</span>
              </h2>
              <div className="space-y-3">
                {groupedOrders[date].map((order, index) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="card-hover p-4 flex items-center justify-between block"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-cocoa-800">
                            {order.customer_name}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-cocoa-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {order.delivery_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {order.customer_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {order.delivery_address.slice(0, 20)}
                            {order.delivery_address.length > 20 && '...'}
                          </span>
                        </p>
                        <p className="text-xs text-cocoa-400 mt-1">
                          {order.items.map(item => item.template_name).join('、')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-primary-500">
                        ¥{order.total_price}
                      </span>
                      <ChevronRight className="w-5 h-5 text-cocoa-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
