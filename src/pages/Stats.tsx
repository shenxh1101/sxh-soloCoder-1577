import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  Trophy,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { statsApi, templatesApi } from '../api';
import type { TopTemplate, MonthlyOrder, SalesStats, Template } from '../../shared/types';

const COLORS = ['#E8A5A5', '#A8C5A0', '#BFA08F', '#CDDFC6', '#F5D5CD', '#D7C4B9'];

export default function StatsPage() {
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [topTemplates, setTopTemplates] = useState<TopTemplate[]>([]);
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrder[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsApi.getSales(),
      statsApi.getTopTemplates(10),
      statsApi.getOrdersByMonth(),
      templatesApi.getAll(),
    ]).then(([sales, top, monthly, temps]) => {
      setSalesStats(sales);
      setTopTemplates(top);
      setMonthlyOrders(monthly);
      setTemplates(temps);
      setLoading(false);
    });
  }, []);

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return `${parseInt(m)}月`;
  };

  const categoryStats = () => {
    const categories: Record<string, { name: string; value: number }> = {};
    for (const item of topTemplates) {
      const template = templates.find(t => t.id === item.template_id);
      if (template) {
        const catKey = template.category;
        const catName =
          catKey === 'rose' ? '玫瑰系列' : catKey === 'lily' ? '百合系列' : '混搭系列';
        if (!categories[catKey]) {
          categories[catKey] = { name: catName, value: 0 };
        }
        categories[catKey].value += item.total_quantity;
      }
    }
    return Object.values(categories);
  };

  const statCards = salesStats
    ? [
        {
          label: '总订单数',
          value: salesStats.total_orders,
          icon: ShoppingBag,
          color: 'from-primary-400 to-rose-400',
          bg: 'bg-primary-50',
        },
        {
          label: '总销售额',
          value: `¥${salesStats.total_revenue.toFixed(0)}`,
          icon: DollarSign,
          color: 'from-sage-400 to-emerald-400',
          bg: 'bg-sage-50',
        },
        {
          label: '客单价',
          value: `¥${salesStats.avg_order_value.toFixed(0)}`,
          icon: TrendingUp,
          color: 'from-amber-400 to-orange-400',
          bg: 'bg-amber-50',
        },
        {
          label: '客户总数',
          value: salesStats.total_customers,
          icon: Users,
          color: 'from-blue-400 to-indigo-400',
          bg: 'bg-blue-50',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-cocoa-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-cocoa-800 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary-500" />
          统计报表
        </h1>
        <p className="text-cocoa-500 mt-1">查看销售数据和经营分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="card p-5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-cocoa-500 text-sm">{card.label}</p>
                  <p className="text-2xl font-semibold text-cocoa-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${card.color}`} style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            月度订单趋势
          </h2>
          <div className="h-64">
            {monthlyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE1DB" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fill: '#8B6550', fontSize: 12 }}
                    axisLine={{ stroke: '#D7C4B9' }}
                  />
                  <YAxis
                    tick={{ fill: '#8B6550', fontSize: 12 }}
                    axisLine={{ stroke: '#D7C4B9' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #D7C4B9',
                      borderRadius: '12px',
                      color: '#5C4A42',
                    }}
                    formatter={(value: number) => [`${value} 单`, '订单数']}
                    labelFormatter={label => `${label}月`}
                  />
                  <Line
                    type="monotone"
                    dataKey="order_count"
                    stroke="#E8A5A5"
                    strokeWidth={3}
                    dot={{ fill: '#E8A5A5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#D88585' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-cocoa-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-sage-500" />
            系列销售占比
          </h2>
          <div className="h-64 flex items-center justify-center">
            {categoryStats().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #D7C4B9',
                      borderRadius: '12px',
                      color: '#5C4A42',
                    }}
                    formatter={(value: number) => [`${value} 束`, '销量']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-cocoa-400">暂无数据</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {categoryStats().map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-cocoa-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          畅销花束排行榜
        </h2>
        {topTemplates.length > 0 ? (
          <div className="space-y-3">
            {topTemplates.map((item, index) => (
              <div
                key={item.template_id}
                className="flex items-center gap-4 p-4 bg-cocoa-50/50 rounded-xl animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0
                      ? 'bg-amber-400 text-white'
                      : index === 1
                      ? 'bg-cocoa-300 text-white'
                      : index === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-cocoa-100 text-cocoa-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-cocoa-800">{item.template_name}</p>
                  <p className="text-sm text-cocoa-500">
                    销量 {item.total_quantity} 束
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-500">
                    ¥{item.total_revenue}
                  </p>
                  <p className="text-xs text-cocoa-400">销售额</p>
                </div>
                <div className="w-32 h-2 bg-cocoa-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-300 to-primary-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.total_quantity / (topTemplates[0]?.total_quantity || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-cocoa-400">暂无销售数据</div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4">
          月度销售明细
        </h2>
        <div className="h-64">
          {monthlyOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE1DB" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fill: '#8B6550', fontSize: 12 }}
                  axisLine={{ stroke: '#D7C4B9' }}
                />
                <YAxis
                  tick={{ fill: '#8B6550', fontSize: 12 }}
                  axisLine={{ stroke: '#D7C4B9' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D7C4B9',
                    borderRadius: '12px',
                    color: '#5C4A42',
                  }}
                  formatter={(value: number) => [`¥${value}`, '销售额']}
                  labelFormatter={label => `${label}月`}
                />
                <Bar
                  dataKey="total_revenue"
                  fill="url(#colorGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A8C5A0" />
                    <stop offset="100%" stopColor="#CDDFC6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-cocoa-400">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
