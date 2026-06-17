import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Flower2,
  Truck,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Check,
  Phone,
  MapPin,
  Clock,
  Tag,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { templatesApi } from '../api';
import type { Template, Customer, OrderItem, AddonItem } from '../../shared/types';

type Step = 1 | 2 | 3;

const allAddons: Omit<AddonItem, 'id'>[] = [
  { name: '巧克力礼盒', price: 68, quantity: 1 },
  { name: '精美贺卡', price: 15, quantity: 1 },
  { name: '小熊公仔', price: 45, quantity: 1 },
  { name: '香薰蜡烛', price: 58, quantity: 1 },
  { name: '香槟酒', price: 128, quantity: 1 },
];

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { templates, fetchTemplates, customers, fetchCustomers, createCustomer, createOrder, flowers, fetchInventory } = useAppStore();

  const [step, setStep] = useState<Step>(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', preferences: '' });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [stockCheck, setStockCheck] = useState<{ sufficient: boolean; shortages: any[] } | null>(null);

  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([]);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchCustomers();
    fetchInventory();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
    setDeliveryTime('09:00');
  }, [fetchTemplates, fetchCustomers, fetchInventory]);

  useEffect(() => {
    if (selectedTemplate) {
      templatesApi.checkStock(selectedTemplate.id, quantity).then(setStockCheck);
    }
  }, [selectedTemplate, quantity]);

  // 选客户时自动勾选常购加购项
  useEffect(() => {
    if (selectedCustomer && selectedCustomer.favorite_addons) {
      const autoAddons = selectedCustomer.favorite_addons
        .map(name => {
          const addon = allAddons.find(a => a.name === name);
          if (addon) {
            return { ...addon, id: `addon-${Date.now()}-${name}` };
          }
          return null;
        })
        .filter(Boolean) as AddonItem[];
      setSelectedAddons(autoAddons);
    } else {
      setSelectedAddons([]);
    }
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(c =>
    c.name.includes(customerSearch) || c.phone.includes(customerSearch)
  );

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    try {
      const customer = await createCustomer(newCustomer);
      setSelectedCustomer(customer);
      setShowNewCustomer(false);
      setNewCustomer({ name: '', phone: '', preferences: '' });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setQuantity(1);
  };

  const toggleAddon = (addonDef: Omit<AddonItem, 'id'>) => {
    const existing = selectedAddons.find(a => a.name === addonDef.name);
    if (existing) {
      setSelectedAddons(prev => prev.filter(a => a.name !== addonDef.name));
    } else {
      setSelectedAddons(prev => [...prev, { ...addonDef, id: `addon-${Date.now()}` }]);
    }
  };

  const flowerTotal = selectedTemplate ? selectedTemplate.base_price * quantity : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const totalPrice = flowerTotal + addonsTotal;

  const canGoNext = () => {
    if (step === 1) return selectedCustomer !== null;
    if (step === 2) return selectedTemplate !== null && stockCheck?.sufficient;
    if (step === 3) return deliveryDate && deliveryTime && deliveryAddress;
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedTemplate) return;

    const orderItems: OrderItem[] = [
      {
        template_id: selectedTemplate.id,
        template_name: selectedTemplate.name,
        quantity,
        unit_price: selectedTemplate.base_price,
      },
    ];

    try {
      const order = await createOrder({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        items: orderItems,
        addons: selectedAddons,
        total_price: totalPrice,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_address: deliveryAddress,
      });
      navigate(`/orders/${order.id}`);
    } catch (e) {
      alert('创建订单失败: ' + (e as Error).message);
    }
  };

  const steps = [
    { num: 1, label: '选择客户', icon: User },
    { num: 2, label: '选择花束', icon: Flower2 },
    { num: 3, label: '配送信息', icon: Truck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card hover:shadow-soft transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-cocoa-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            新建订单
          </h1>
          <p className="text-cocoa-500 text-sm">三步完成订单创建</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-sage-400 text-white'
                        : isActive
                        ? 'bg-primary-400 text-white shadow-soft'
                        : 'bg-cocoa-100 text-cocoa-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`font-medium ${
                      isActive || isCompleted ? 'text-cocoa-800' : 'text-cocoa-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full ${
                      isCompleted ? 'bg-sage-300' : 'bg-cocoa-100'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
            选择客户
          </h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cocoa-400" />
            <input
              type="text"
              placeholder="搜索客户姓名或电话..."
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedCustomer?.id === customer.id
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-transparent bg-cocoa-50 hover:bg-cocoa-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center text-white font-medium">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cocoa-800">{customer.name}</p>
                    <p className="text-sm text-cocoa-500">{customer.phone}</p>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {customer.preference_tags && customer.preference_tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cocoa-200/50 flex flex-wrap gap-1">
                    {customer.preference_tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary-100/50 text-primary-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {customer.preference_tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-cocoa-100 text-cocoa-500 rounded-full text-xs">
                        +{customer.preference_tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {customer.favorite_addons && customer.favorite_addons.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-sage-600">
                    <ShoppingBag className="w-3 h-3" />
                    <span>常购：{customer.favorite_addons.slice(0, 2).join('、')}</span>
                    {customer.favorite_addons.length > 2 && ` +${customer.favorite_addons.length - 2}`}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showNewCustomer ? (
            <button
              onClick={() => setShowNewCustomer(true)}
              className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              新增客户
            </button>
          ) : (
            <div className="bg-primary-50 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-cocoa-800">新增客户</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="客户姓名"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  placeholder="联系电话"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="客户喜好（选填）"
                value={newCustomer.preferences}
                onChange={e => setNewCustomer({ ...newCustomer, preferences: e.target.value })}
                className="input-field text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleCreateCustomer} className="btn-primary text-sm py-2">
                  确认添加
                </button>
                <button
                  onClick={() => setShowNewCustomer(false)}
                  className="btn-secondary text-sm py-2"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 animate-slide-up space-y-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
              选择花束模板
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-transparent bg-cocoa-50 hover:bg-cocoa-100'
                  }`}
                >
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary-100 to-sage-100 flex items-center justify-center mb-3">
                    <Flower2 className="w-10 h-10 text-primary-300" />
                  </div>
                  <h3 className="font-medium text-cocoa-800">{template.name}</h3>
                  <p className="text-xs text-cocoa-500 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <p className="text-primary-500 font-semibold mt-2">
                    ¥{template.base_price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 加购商品 */}
          <div>
            <h3 className="font-display font-semibold text-cocoa-800 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sage-500" />
              加购商品
              {selectedCustomer?.favorite_addons && selectedCustomer.favorite_addons.length > 0 && (
                <span className="text-xs font-normal text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full">
                  已为您勾选常购
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {allAddons.map(addon => {
                const isSelected = selectedAddons.some(a => a.name === addon.name);
                const isFavorite = selectedCustomer?.favorite_addons?.includes(addon.name);
                return (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddon(addon)}
                    className={`p-3 rounded-xl text-left transition-all border-2 relative ${
                      isSelected
                        ? 'border-sage-400 bg-sage-50'
                        : 'border-transparent bg-cocoa-50 hover:bg-cocoa-100'
                    }`}
                  >
                    {isFavorite && (
                      <Heart className="absolute top-2 right-2 w-3.5 h-3.5 text-primary-400 fill-primary-400" />
                    )}
                    <p className="text-sm font-medium text-cocoa-800">{addon.name}</p>
                    <p className="text-xs text-primary-500 mt-1">¥{addon.price}</p>
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-sage-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-cocoa-800">已选：{selectedTemplate.name}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center hover:bg-cocoa-50"
                  >
                    <Minus className="w-4 h-4 text-cocoa-600" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center hover:bg-cocoa-50"
                  >
                    <Plus className="w-4 h-4 text-cocoa-600" />
                  </button>
                </div>
              </div>

              {stockCheck && !stockCheck.sufficient && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">库存不足</p>
                      <ul className="text-xs text-amber-600 mt-1 space-y-0.5">
                        {stockCheck.shortages.map((s, i) => (
                          <li key={i}>
                            {s.flower_name}: 需要 {s.needed}，库存 {s.available}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-amber-600 mt-1">
                        建议换一种花束或先进货
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stockCheck?.sufficient && (
                <div className="flex items-center gap-2 text-sage-600 text-sm mb-4">
                  <Check className="w-4 h-4" />
                  库存充足，可以下单
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-sage-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cocoa-500">花束 × {quantity}</span>
                  <span className="text-cocoa-700">¥{flowerTotal}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cocoa-500">
                      加购 ({selectedAddons.length} 件)
                    </span>
                    <span className="text-cocoa-700">¥{addonsTotal}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-sage-200">
                  <span className="font-medium text-cocoa-700">总价</span>
                  <span className="text-xl font-semibold text-primary-500">
                    ¥{totalPrice}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
            配送信息
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-cocoa-600 mb-1.5 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                配送日期
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-cocoa-600 mb-1.5 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                配送时间
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={e => setDeliveryTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-cocoa-600 mb-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                配送地址
              </label>
              <textarea
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="请输入详细配送地址..."
                className="input-field min-h-[80px] resize-none"
              />
            </div>
          </div>

          {selectedCustomer && selectedTemplate && (
            <div className="mt-6 pt-6 border-t border-cocoa-100">
              <h3 className="font-medium text-cocoa-800 mb-4">订单摘要</h3>
              <div className="bg-cocoa-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cocoa-500">客户</span>
                  <span className="text-cocoa-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {selectedCustomer.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cocoa-500">电话</span>
                  <span className="text-cocoa-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedCustomer.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cocoa-500">花束</span>
                  <span className="text-cocoa-700 flex items-center gap-1">
                    <Flower2 className="w-3.5 h-3.5" />
                    {selectedTemplate.name} × {quantity}
                  </span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-cocoa-500">加购</span>
                    <span className="text-cocoa-700">
                      {selectedAddons.map(a => a.name).join('、')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-cocoa-500">配送</span>
                  <span className="text-cocoa-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    {deliveryDate} {deliveryTime}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-cocoa-200 flex justify-between">
                  <span className="font-medium text-cocoa-700">订单总额</span>
                  <span className="text-lg font-semibold text-primary-500">
                    ¥{totalPrice}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep((step - 1) as Step)}
          disabled={step === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一步
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canGoNext()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canGoNext()}
            className="btn-sage disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认下单
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
