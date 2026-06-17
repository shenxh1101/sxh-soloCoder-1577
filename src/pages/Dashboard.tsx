import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Flower2,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const {
    todayOrders,
    lowStockFlowers,
    customers,
    fetchTodayOrders,
    fetchLowStock,
    fetchCustomers,
    updateOrderStatus,
  } = useAppStore();

  useEffect(() => {
    fetchTodayOrders();
    fetchLowStock();
    fetchCustomers();
  }, [fetchTodayOrders, fetchLowStock, fetchCustomers]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const pendingCount = todayOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredCount = todayOrders.filter(o => o.status === 'delivered').length;
  const totalRevenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_price, 0);

  const statsCards = [
    {
      label: '今日待配送',
      value: pendingCount,
      icon: Clock,
      color: 'from-amber-400 to-orange-400',
      bg: 'bg-amber-50',
    },
    {
      label: '今日已送达',
      value: deliveredCount,
      icon: CheckCircle,
      color: 'from-sage-400 to-emerald-400',
      bg: 'bg-sage-50',
    },
    {
      label: '今日营业额',
      value: `¥${totalRevenue}`,
      icon: DollarSign,
      color: 'from-primary-400 to-rose-400',
      bg: 'bg-primary-50',
    },
    {
      label: '客户总数',
      value: customers.length,
      icon: Users,
      color: 'from-blue-400 to-indigo-400',
      bg: 'bg-blue-50',
    },
  ];

  const handleMarkDelivered = async (id: number) => {
    await updateOrderStatus(id, 'delivered');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            早上好，花店老板 🌿
          </h1>
          <p className="text-cocoa-500 mt-1">{dateStr}</p>
        </div>
        <Link to="/orders/new" className="btn-primary flex items-center gap-2">
          <Flower2 className="w-5 h-5" />
          新建订单
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-cocoa-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-semibold text-cocoa-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800">
              今日配送订单
            </h2>
            <Link
              to="/orders"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todayOrders.length === 0 ? (
            <div className="text-center py-12">
              <Flower2 className="w-12 h-12 text-cocoa-300 mx-auto mb-3" />
              <p className="text-cocoa-400">今天还没有配送订单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-cocoa-50/50 rounded-xl hover:bg-cocoa-50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <Flower2 className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-cocoa-800">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-cocoa-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {order.delivery_time}
                        <span className="mx-1">·</span>
                        <MapPin className="w-3.5 h-3.5" />
                        {order.delivery_address.slice(0, 15)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-cocoa-700">
                      ¥{order.total_price}
                    </span>
                    <StatusBadge status={order.status} />
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        className="px-3 py-1.5 text-sm bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
                      >
                        已送达
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-display font-semibold text-cocoa-800">
              库存预警
            </h2>
          </div>

          {lowStockFlowers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-sage-400 mx-auto mb-2" />
              <p className="text-cocoa-400 text-sm">库存充足，状态良好</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockFlowers.map((flower) => (
                <div
                  key={flower.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
                >
                  <div>
                    <p className="font-medium text-cocoa-800 text-sm">
                      {flower.name}
                    </p>
                    <p className="text-xs text-cocoa-500">
                      预警线：{flower.warning_threshold}
                      {flower.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">
                      {flower.stock}
                      <span className="text-xs font-normal">{flower.unit}</span>
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/inventory"
                className="block text-center text-sm text-primary-500 hover:text-primary-600 pt-2"
              >
                去进货 →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-cocoa-800">
            快速操作
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders/new"
            className="flex flex-col items-center gap-3 p-5 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flower2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-cocoa-700">新建订单</span>
          </Link>
          <Link
            to="/templates"
            className="flex flex-col items-center gap-3 p-5 bg-sage-50 rounded-xl hover:bg-sage-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-sage-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-cocoa-700">花束模板</span>
          </Link>
          <Link
            to="/customers"
            className="flex flex-col items-center gap-3 p-5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-cocoa-700">客户管理</span>
          </Link>
          <Link
            to="/stats"
            className="flex flex-col items-center gap-3 p-5 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-cocoa-700">数据统计</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
