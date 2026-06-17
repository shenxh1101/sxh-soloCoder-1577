import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  User,
  MessageSquare,
  Plus,
  ClipboardList,
  CheckCircle,
  Truck,
  XCircle,
  Flower2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import StatusBadge from '../components/StatusBadge';
import type { OrderStatus } from '../../shared/types';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { orders, fetchOrders, updateOrderStatus, addOrderNote } = useAppStore();
  const [noteInput, setNoteInput] = useState('');
  const [order, setOrder] = useState<typeof orders[0] | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchOrders().then(() => {
      const found = orders.find(o => o.id === parseInt(id));
      setOrder(found || null);
    });
  }, [id, orders, fetchOrders]);

  useEffect(() => {
    if (id) {
      const found = orders.find(o => o.id === parseInt(id));
      if (found) setOrder(found);
    }
  }, [orders, id]);

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <ClipboardList className="w-16 h-16 text-cocoa-300 mx-auto mb-4" />
        <p className="text-cocoa-500">订单不存在</p>
        <Link to="/orders" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" />
          返回订单列表
        </Link>
      </div>
    );
  }

  const statusActions: { status: OrderStatus; label: string; icon: typeof CheckCircle; className: string }[] = [
    { status: 'preparing', label: '开始制作', icon: Flower2, className: 'bg-blue-500 hover:bg-blue-600' },
    { status: 'delivering', label: '开始配送', icon: Truck, className: 'bg-purple-500 hover:bg-purple-600' },
    { status: 'delivered', label: '标记已送达', icon: CheckCircle, className: 'bg-sage-500 hover:bg-sage-600' },
    { status: 'cancelled', label: '取消订单', icon: XCircle, className: 'bg-cocoa-400 hover:bg-cocoa-500' },
  ];

  const getNextActions = (currentStatus: OrderStatus) => {
    const flow: OrderStatus[] = ['pending', 'preparing', 'delivering', 'delivered'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentStatus === 'cancelled') return [];
    return statusActions.filter(a => {
      const actionIndex = flow.indexOf(a.status);
      return actionIndex > currentIndex && actionIndex <= currentIndex + 2;
    });
  };

  const nextActions = getNextActions(order.status);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!id) return;
    await updateOrderStatus(parseInt(id), status);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim() || !id) return;
    await addOrderNote(parseInt(id), noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/orders"
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card hover:shadow-soft transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-cocoa-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            订单详情
          </h1>
          <p className="text-cocoa-500 text-sm">订单号: #{order.id}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              客户信息
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-cocoa-500">姓名</p>
                <p className="font-medium text-cocoa-800">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-cocoa-500">电话</p>
                <p className="font-medium text-cocoa-800 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-cocoa-400" />
                  {order.customer_phone}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-primary-500" />
              花束信息
            </h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-cocoa-50/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <Flower2 className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-cocoa-800">{item.template_name}</p>
                      {item.customizations && (
                        <p className="text-sm text-cocoa-500">{item.customizations}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-cocoa-800">
                      ¥{item.unit_price} × {item.quantity}
                    </p>
                    <p className="text-primary-500 font-semibold">
                      ¥{item.unit_price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cocoa-100 flex justify-between items-center">
              <span className="text-cocoa-600">总计</span>
              <span className="text-2xl font-semibold text-primary-500">
                ¥{order.total_price}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              订单备注
            </h2>
            {order.notes.length === 0 ? (
              <p className="text-cocoa-400 text-sm mb-4">暂无备注</p>
            ) : (
              <div className="space-y-3 mb-4">
                {order.notes.map(note => (
                  <div
                    key={note.id}
                    className="p-3 bg-sage-50 rounded-xl border border-sage-100"
                  >
                    <p className="text-cocoa-700 text-sm">{note.content}</p>
                    <p className="text-xs text-cocoa-400 mt-2">
                      {new Date(note.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加备注，如：客户说花很新鲜、门口保安代收..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                className="input-field flex-1"
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              />
              <button onClick={handleAddNote} className="btn-sage flex items-center gap-1">
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              配送信息
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cocoa-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-cocoa-500">配送时间</p>
                  <p className="font-medium text-cocoa-800">
                    {order.delivery_date} {order.delivery_time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cocoa-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-cocoa-500">配送地址</p>
                  <p className="font-medium text-cocoa-800">
                    {order.delivery_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
              订单状态
            </h2>
            <div className="space-y-2">
              {['pending', 'preparing', 'delivering', 'delivered'].map((status, index) => {
                const statusLabels: Record<string, string> = {
                  pending: '待制作',
                  preparing: '制作中',
                  delivering: '配送中',
                  delivered: '已送达',
                };
                const currentIndex = ['pending', 'preparing', 'delivering', 'delivered'].indexOf(order.status);
                const thisIndex = index;
                const isCompleted = thisIndex < currentIndex || order.status === 'delivered';
                const isCurrent = status === order.status;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        isCompleted || isCurrent
                          ? 'bg-sage-400 text-white'
                          : 'bg-cocoa-100 text-cocoa-400'
                      }`}
                    >
                      {isCompleted && !isCurrent ? '✓' : index + 1}
                    </div>
                    <span
                      className={`font-medium ${
                        isCurrent ? 'text-cocoa-800' : isCompleted ? 'text-sage-600' : 'text-cocoa-400'
                      }`}
                    >
                      {statusLabels[status]}
                    </span>
                  </div>
                );
              })}
            </div>

            {nextActions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-cocoa-100 space-y-2">
                {nextActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.status}
                      onClick={() => handleStatusUpdate(action.status)}
                      className={`w-full py-2.5 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${action.className}`}
                    >
                      <Icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-3">
              订单信息
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cocoa-500">下单时间</span>
                <span className="text-cocoa-700">
                  {new Date(order.created_at).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cocoa-500">订单编号</span>
                <span className="text-cocoa-700">#{order.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
