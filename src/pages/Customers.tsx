import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Heart,
  Clock,
  ChevronRight,
  Flower2,
  X,
  Edit3,
  Save,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Customer } from '../../shared/types';

export default function CustomersPage() {
  const { customers, fetchCustomers, createCustomer, updateCustomer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', preferences: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', preferences: '' });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    try {
      await createCustomer(newCustomer);
      setShowAddModal(false);
      setNewCustomer({ name: '', phone: '', preferences: '' });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleStartEdit = (customer: Customer) => {
    setEditData({
      name: customer.name,
      phone: customer.phone,
      preferences: customer.preferences,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;
    await updateCustomer(selectedCustomer.id, editData);
    setIsEditing(false);
    setSelectedCustomer(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            客户管理
          </h1>
          <p className="text-cocoa-500 mt-1">
            共 {customers.length} 位客户
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增客户
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cocoa-400" />
          <input
            type="text"
            placeholder="搜索客户姓名或电话..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="card-hover p-5 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center text-white text-xl font-medium flex-shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-cocoa-800">
                  {customer.name}
                </h3>
                <p className="text-sm text-cocoa-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {customer.phone}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-cocoa-400 flex-shrink-0 mt-2" />
            </div>
            {customer.preferences && (
              <div className="mt-4 pt-4 border-t border-cocoa-100">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-cocoa-600 line-clamp-2">
                    {customer.preferences}
                  </p>
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 text-xs text-cocoa-400">
              <Clock className="w-3 h-3" />
              <span>首次到店：{formatDate(customer.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-cocoa-300 mx-auto mb-4" />
          <p className="text-cocoa-500">暂无客户</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            添加第一位客户
          </button>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card p-6 w-full max-w-md animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-cocoa-800">
                新增客户
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-cocoa-400 hover:text-cocoa-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-cocoa-600 mb-1.5 block">
                  客户姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-cocoa-600 mb-1.5 block">
                  联系电话 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-cocoa-600 mb-1.5 block">客户喜好</label>
                <textarea
                  value={newCustomer.preferences}
                  onChange={e => setNewCustomer({ ...newCustomer, preferences: e.target.value })}
                  placeholder="例如：喜欢粉色系、爱加满天星、每次加巧克力..."
                  className="input-field min-h-[80px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedCustomer(null);
            setIsEditing(false);
          }}
        >
          <div
            className="card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center text-white text-2xl font-medium">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      className="text-xl font-display font-semibold text-cocoa-800 bg-transparent border-b border-primary-300 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-xl font-display font-semibold text-cocoa-800">
                      {selectedCustomer.name}
                    </h3>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      className="text-cocoa-500 bg-transparent border-b border-cocoa-200 focus:outline-none text-sm mt-1 w-full"
                    />
                  ) : (
                    <p className="text-cocoa-500 flex items-center gap-1 mt-1">
                      <Phone className="w-4 h-4" />
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="text-sage-500 hover:text-sage-600"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(selectedCustomer)}
                    className="text-cocoa-400 hover:text-cocoa-600"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsEditing(false);
                  }}
                  className="text-cocoa-400 hover:text-cocoa-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-50/50 rounded-xl p-4">
                <h4 className="font-medium text-cocoa-800 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary-500" />
                  客户喜好
                </h4>
                {isEditing ? (
                  <textarea
                    value={editData.preferences}
                    onChange={e => setEditData({ ...editData, preferences: e.target.value })}
                    className="w-full bg-white rounded-lg p-3 text-sm text-cocoa-700 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-cocoa-600">
                    {selectedCustomer.preferences || '暂无记录'}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-cocoa-800 mb-3 flex items-center gap-2">
                  <Flower2 className="w-4 h-4 text-primary-500" />
                  历史订单
                </h4>
                <div className="space-y-2">
                  {/* 这里简化显示，实际可以调用客户详情接口 */}
                  <p className="text-sm text-cocoa-500 text-center py-4 bg-cocoa-50/50 rounded-xl">
                    点击查看完整订单记录
                  </p>
                </div>
              </div>

              <div className="text-xs text-cocoa-400 pt-4 border-t border-cocoa-100">
                首次到店：{formatDate(selectedCustomer.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
