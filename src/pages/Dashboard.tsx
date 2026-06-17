import { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Plus,
  AlertTriangle,
  MessageSquare,
  User,
  MapPin,
  Phone,
  Sparkles,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';
import { ordersApi, inventoryApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import type { Order, OrderStatus, Flower } from '../../shared/types';
import { useNavigate } from 'react-router';

type TimeGroup = 'morning' | 'afternoon' | 'evening' | 'night';

const timeGroupLabels: Record<TimeGroup, string> = {
  morning: '上午 (06:00-12:00)',
  afternoon: '下午 (12:00-17:00)',
  evening: '晚上 (17:00-21:00)',
  night: '夜间 (21:00-06:00)',
};

function getTimeGroup(time: string): TimeGroup {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const statusTabs: Array<{ status: OrderStatus | 'all'; label: string; icon: any; color: string }> = [
  { status: 'all', label: '全部', icon: Package, color: 'text-cocoa-600' },
  { status: 'pending', label: '待制作', icon: Clock, color: 'text-amber-600' },
  { status: 'preparing', label: '制作中', icon: Sparkles, color: 'text-blue-600' },
  { status: 'delivering', label: '配送中', icon: Truck, color: 'text-purple-600' },
  { status: 'delivered', label: '已送达', icon: CheckCircle, color: 'text-sage-600' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [lowStockFlowers, setLowStockFlowers] = useState<Flower[]>([]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [quickNoteOrder, setQuickNoteOrder] = useState<number | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNoteType, setQuickNoteType] = useState<'feedback' | 'recipient'>('feedback');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      ordersApi.getToday(),
      inventoryApi.getLowStock(),
    ]).then(([orders, lowStock]) => {
      setTodayOrders(orders);
      setLowStockFlowers(lowStock);
      setLoading(false);
    });
  };

  const filteredOrders = activeStatus === 'all'
    ? todayOrders
    : todayOrders.filter(o => o.status === activeStatus);

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const group = getTimeGroup(order.delivery_time);
    if (!acc[group]) acc[group] = [];
    acc[group].push(order);
    return acc;
  }, {} as Record<TimeGroup, Order[]>);

  // 按时段排序
  const sortedGroups: TimeGroup[] = ['morning', 'afternoon', 'evening', 'night'];

  // 各状态统计
  const statusCounts = {
    pending: todayOrders.filter(o => o.status === 'pending').length,
    preparing: todayOrders.filter(o => o.status === 'preparing').length,
    delivering: todayOrders.filter(o => o.status === 'delivering').length,
    delivered: todayOrders.filter(o => o.status === 'delivered').length,
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddQuickNote = async (orderId: number) => {
    if (!quickNoteText.trim()) return;
    try {
      const noteContent = quickNoteType === 'recipient'
        ? `代收人：${quickNoteText}`
        : quickNoteText;
      await ordersApi.addNote(orderId, noteContent);
      setQuickNoteOrder(null);
      setQuickNoteText('');
      loadData();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-cocoa-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 头部 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800 flex items-center gap-3">
            <Truck className="w-7 h-7 text-primary-500" />
            今日配送看板
          </h1>
          <p className="text-cocoa-500 mt-1">{todayStr} · 共 {todayOrders.length} 单待配送</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建订单
        </button>
      </div>

      {/* 状态概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusTabs.filter(t => t.status !== 'all').map(tab => {
          const Icon = tab.icon;
          const count = tab.status === 'pending' ? statusCounts.pending
            : tab.status === 'preparing' ? statusCounts.preparing
            : tab.status === 'delivering' ? statusCounts.delivering
            : statusCounts.delivered;
          const bgColors = {
            pending: 'bg-amber-50 border-amber-100',
            preparing: 'bg-blue-50 border-blue-100',
            delivering: 'bg-purple-50 border-purple-100',
            delivered: 'bg-sage-50 border-sage-100',
          }[tab.status as OrderStatus] || 'bg-cocoa-50 border-cocoa-100';

          return (
            <button
              key={tab.status}
              onClick={() => setActiveStatus(tab.status as OrderStatus)}
              className={`card p-4 text-left transition-all border-2 ${
                activeStatus === tab.status
                  ? `${bgColors} shadow-md scale-[1.02]`
                  : 'bg-white border-transparent hover:bg-cocoa-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bgColors.split(' ')[0]} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${tab.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cocoa-800">{count}</p>
                  <p className={`text-sm ${tab.color}`}>{tab.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 库存预警 */}
      {lowStockFlowers.length > 0 && (
        <div className="card p-4 bg-amber-50/50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">库存预警</h3>
              <p className="text-sm text-amber-700 mt-1">
                以下花材库存不足，请及时补货：
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockFlowers.map(f => (
                  <span key={f.id} className="px-2 py-1 bg-white rounded-lg text-xs text-amber-700 border border-amber-200">
                    {f.name} · 剩 {f.stock} 支
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              去补货 →
            </button>
          </div>
        </div>
      )}

      {/* 时段分组订单 */}
      <div className="space-y-6">
        {sortedGroups.map(group => {
          const orders = groupedOrders[group] || [];
          if (orders.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-cocoa-700 text-lg">
                  {timeGroupLabels[group]}
                </h2>
                <span className="px-2 py-0.5 bg-cocoa-100 rounded-full text-xs text-cocoa-600">
                  {orders.length} 单
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .sort((a, b) => a.delivery_time.localeCompare(b.delivery_time))
                  .map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onQuickNote={(id) => {
                        setQuickNoteOrder(id);
                        setQuickNoteType('feedback');
                      }}
                      onQuickRecipient={(id) => {
                        setQuickNoteOrder(id);
                        setQuickNoteType('recipient');
                      }}
                      isNoteOpen={quickNoteOrder === order.id}
                      noteText={quickNoteText}
                      setNoteText={setQuickNoteText}
                      noteType={quickNoteType}
                      onSubmitNote={() => handleAddQuickNote(order.id)}
                      onCloseNote={() => setQuickNoteOrder(null)}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="card p-12 text-center">
            <Package className="w-12 h-12 text-cocoa-300 mx-auto mb-3" />
            <p className="text-cocoa-500">当前状态暂无订单</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: number, status: OrderStatus) => void;
  onQuickNote: (id: number) => void;
  onQuickRecipient: (id: number) => void;
  isNoteOpen: boolean;
  noteText: string;
  setNoteText: (text: string) => void;
  noteType: 'feedback' | 'recipient';
  onSubmitNote: () => void;
  onCloseNote: () => void;
  onClick: () => void;
}

function OrderCard({
  order,
  onStatusChange,
  onQuickNote,
  onQuickRecipient,
  isNoteOpen,
  noteText,
  setNoteText,
  noteType,
  onSubmitNote,
  onCloseNote,
  onClick,
}: OrderCardProps) {
  const nextStatuses: Record<OrderStatus, { status: OrderStatus; label: string }[]> = {
    pending: [{ status: 'preparing', label: '开始制作' }],
    preparing: [{ status: 'delivering', label: '开始配送' }],
    delivering: [{ status: 'delivered', label: '已送达' }],
    delivered: [],
    cancelled: [],
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-cocoa-800">
            {order.delivery_time}
          </span>
          <StatusBadge status={order.status} size="sm" />
        </div>
        <span className="text-sm text-primary-500 font-medium">
          ¥{order.total_price}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-cocoa-600">
          <User className="w-4 h-4 text-cocoa-400" />
          <span className="truncate">{order.customer_name}</span>
          <span className="text-cocoa-400">{order.customer_phone}</span>
        </div>
        <div className="flex items-start gap-2 text-cocoa-600">
          <MapPin className="w-4 h-4 text-cocoa-400 flex-shrink-0 mt-0.5" />
          <span className="truncate line-clamp-1">{order.delivery_address}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-cocoa-100">
        <p className="text-sm text-cocoa-500 truncate">
          {order.items.map(i => `${i.template_name}×${i.quantity}`).join('、')}
        </p>
        {order.addons && order.addons.length > 0 && (
          <p className="text-xs text-cocoa-400 mt-1">
            加购：{order.addons.map(a => a.name).join('、')}
          </p>
        )}
      </div>

      {/* 快速操作按钮 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {nextStatuses[order.status]?.map(next => (
          <button
            key={next.status}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, next.status);
            }}
            className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            {next.label}
          </button>
        ))}
        {order.status === 'delivering' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickRecipient(order.id);
            }}
            className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            记代收人
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickNote(order.id);
          }}
          className="px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg text-sm font-medium hover:bg-sage-100 transition-colors"
        >
          记反馈
        </button>
      </div>

      {/* 快速记录输入框 */}
      {isNoteOpen && (
        <div
          className="mt-3 p-3 bg-cocoa-50 rounded-xl"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs text-cocoa-500 mb-2">
            {noteType === 'recipient' ? '记录代收人' : '记录客户反馈'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={noteType === 'recipient' ? '代收人姓名' : '客户反馈内容...'}
              className="flex-1 px-3 py-2 bg-white border border-cocoa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmitNote();
              }}
            />
            <button
              onClick={onSubmitNote}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={onCloseNote}
              className="p-2 text-cocoa-400 hover:text-cocoa-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 最新备注预览 */}
      {order.notes && order.notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-cocoa-100">
          <p className="text-xs text-cocoa-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span className="truncate">{order.notes[order.notes.length - 1].content}</span>
          </p>
        </div>
      )}
    </div>
  );
}
