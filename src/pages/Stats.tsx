import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Trophy,
  Calendar,
  ChevronDown,
  Clock,
  Sunrise,
  Sunset,
  Moon,
  ArrowUp,
  ArrowDown,
  Minus,
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
import { statsApi } from '../api';
import type { MonthlyComparison, TopTemplate, TimeSlotStats, HourlyStats } from '../../shared/types';

const COLORS = ['#E8A5A5', '#A8C5A0', '#BFA08F', '#CDDFC6'];

export default function StatsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState<'month' | 'range'>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyComparison | null>(null);
  const [rangeData, setRangeData] = useState<{
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
    top_templates: TopTemplate[];
    hourly_stats: HourlyStats[];
    time_slots: TimeSlotStats[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (viewMode === 'month') {
      setLoading(true);
      statsApi.getMonthlyComparison(selectedMonth).then(data => {
        setMonthlyData(data);
        setLoading(false);
      });
    }
  }, [selectedMonth, viewMode]);

  useEffect(() => {
    if (viewMode === 'range' && dateFrom && dateTo) {
      setLoading(true);
      statsApi.getDateRangeStats(dateFrom, dateTo).then(data => {
        setRangeData(data);
        setLoading(false);
      });
    }
  }, [dateFrom, dateTo, viewMode]);

  const currentData = viewMode === 'month' ? monthlyData?.current : {
    order_count: rangeData?.order_count || 0,
    total_revenue: rangeData?.total_revenue || 0,
    avg_order_value: rangeData?.avg_order_value || 0,
    top_template: rangeData?.top_templates[0] || null,
  };

  const topTemplates = viewMode === 'month' ? monthlyData?.top_templates || [] : rangeData?.top_templates || [];
  const timeSlots = viewMode === 'month' ? monthlyData?.time_slots || [] : rangeData?.time_slots || [];
  const hourlyStats = viewMode === 'month' ? monthlyData?.hourly_stats || [] : rangeData?.hourly_stats || [];

  const formatMonthLabel = (month: string) => {
    const [year, m] = month.split('-');
    return `${year}年${parseInt(m)}月`;
  };

  const formatChange = (value: number, percent: number) => {
    if (value === 0) return { text: '持平', icon: Minus, color: 'text-cocoa-400' };
    if (value > 0) return { text: `+${value} (+${percent.toFixed(1)}%)`, icon: ArrowUp, color: 'text-sage-600' };
    return { text: `${value} (${percent.toFixed(1)}%)`, icon: ArrowDown, color: 'text-red-500' };
  };

  const timeSlotIcons = {
    morning: Sunrise,
    afternoon: Sun,
    evening: Sunset,
    night: Moon,
  } as const;

  function Sun(props: any) {
    return (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    );
  }

  // 生成月份选项
  const monthOptions = () => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    return months;
  };

  if (loading && !monthlyData && !rangeData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-cocoa-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            统计报表
          </h1>
          <p className="text-cocoa-500 mt-1">查看销售数据和经营分析</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-cocoa-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-cocoa-800 shadow-sm'
                  : 'text-cocoa-500 hover:text-cocoa-700'
              }`}
            >
              按月
            </button>
            <button
              onClick={() => setViewMode('range')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'range'
                  ? 'bg-white text-cocoa-800 shadow-sm'
                  : 'text-cocoa-500 hover:text-cocoa-700'
              }`}
            >
              按日期范围
            </button>
          </div>

          {viewMode === 'month' ? (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-cocoa-200 rounded-xl text-cocoa-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {monthOptions().map(m => (
                  <option key={m} value={m}>{formatMonthLabel(m)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-500 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="input-field w-36 text-sm"
              />
              <span className="text-cocoa-400">至</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="input-field w-36 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cocoa-500 text-sm">总订单数</p>
              <p className="text-2xl font-semibold text-cocoa-800 mt-2">
                {currentData?.order_count || 0}
              </p>
              {viewMode === 'month' && monthlyData && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  monthlyData.changes.order_count_change >= 0 ? 'text-sage-600' : 'text-red-500'
                }`}>
                  {monthlyData.changes.order_count_change >= 0
                    ? <ArrowUp className="w-3 h-3" />
                    : <ArrowDown className="w-3 h-3" />
                  }
                  较上月 {monthlyData.changes.order_count_change >= 0 ? '+' : ''}
                  {monthlyData.changes.order_count_change} 单
                  ({monthlyData.changes.order_count_change_percent.toFixed(1)}%)
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cocoa-500 text-sm">总销售额</p>
              <p className="text-2xl font-semibold text-cocoa-800 mt-2">
                ¥{(currentData?.total_revenue || 0).toFixed(0)}
              </p>
              {viewMode === 'month' && monthlyData && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  monthlyData.changes.revenue_change >= 0 ? 'text-sage-600' : 'text-red-500'
                }`}>
                  {monthlyData.changes.revenue_change >= 0
                    ? <ArrowUp className="w-3 h-3" />
                    : <ArrowDown className="w-3 h-3" />
                  }
                  较上月 {monthlyData.changes.revenue_change >= 0 ? '+' : ''}
                  ¥{monthlyData.changes.revenue_change.toFixed(0)}
                  ({monthlyData.changes.revenue_change_percent.toFixed(1)}%)
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-sage-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-sage-500" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cocoa-500 text-sm">客单价</p>
              <p className="text-2xl font-semibold text-cocoa-800 mt-2">
                ¥{(currentData?.avg_order_value || 0).toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cocoa-500 text-sm">最畅销花束</p>
              <p className="text-lg font-semibold text-cocoa-800 mt-2 truncate max-w-[150px]">
                {currentData?.top_template?.template_name || '-'}
              </p>
              <p className="text-xs text-primary-500 mt-1">
                {currentData?.top_template?.total_quantity || 0} 束
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 时段分布 */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            配送时段分布
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {timeSlots.map((slot, index) => {
              const Icon = timeSlotIcons[slot.slot] || Clock;
              const colors = ['bg-amber-50 text-amber-600', 'bg-sky-50 text-sky-600', 'bg-purple-50 text-purple-600', 'bg-indigo-50 text-indigo-600'];
              return (
                <div key={slot.slot} className={`p-4 rounded-xl ${colors[index % 4]} bg-opacity-50`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{slot.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{slot.order_count}</p>
                  <p className="text-xs opacity-75">¥{slot.total_revenue.toFixed(0)}</p>
                </div>
              );
            })}
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSlots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE1DB" />
                <XAxis dataKey="label" tick={{ fill: '#8B6550', fontSize: 10 }} axisLine={{ stroke: '#D7C4B9' }} />
                <YAxis tick={{ fill: '#8B6550', fontSize: 11 }} axisLine={{ stroke: '#D7C4B9' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D7C4B9',
                    borderRadius: '12px',
                    color: '#5C4A42',
                  }}
                  formatter={(value: number) => [`${value} 单`, '订单数']}
                />
                <Bar dataKey="order_count" fill="#E8A5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24小时分布 */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sage-500" />
            24小时订单分布
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyStats.filter(h => h.order_count > 0 || h.hour >= 6 && h.hour <= 21)}>
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A8C5A0" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#A8C5A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE1DB" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#8B6550', fontSize: 11 }}
                  axisLine={{ stroke: '#D7C4B9' }}
                  tickFormatter={(h) => `${h}:00`}
                />
                <YAxis tick={{ fill: '#8B6550', fontSize: 11 }} axisLine={{ stroke: '#D7C4B9' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D7C4B9',
                    borderRadius: '12px',
                    color: '#5C4A42',
                  }}
                  formatter={(value: number) => [`${value} 单`, '订单数']}
                  labelFormatter={(label) => `${label}:00`}
                />
                <Area
                  type="monotone"
                  dataKey="order_count"
                  stroke="#A8C5A0"
                  strokeWidth={2}
                  fill="url(#hourlyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-cocoa-400 text-center mt-2">
            根据配送时间统计，方便安排人手和备花
          </p>
        </div>
      </div>

      {/* 畅销花束排行 */}
      <div className="card p-6">
        <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          畅销花束排行榜
          {viewMode === 'month' && monthlyData && (
            <span className="text-sm font-normal text-cocoa-500 ml-2">
              {formatMonthLabel(selectedMonth)}
            </span>
          )}
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cocoa-800 truncate">{item.template_name}</p>
                  <p className="text-sm text-cocoa-500">
                    销量 {item.total_quantity} 束
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-500">
                    ¥{item.total_revenue.toFixed(0)}
                  </p>
                  <p className="text-xs text-cocoa-400">销售额</p>
                </div>
                <div className="w-40 h-2 bg-cocoa-100 rounded-full overflow-hidden hidden md:block">
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

      {/* 月度趋势 */}
      {viewMode === 'month' && (
        <MonthlyTrendChart />
      )}
    </div>
  );
}

function AreaChart(props: any) {
  return (
    <ResponsiveContainer {...props}>
      <LineChart data={props.data}>
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  );
}

function Area(props: any) {
  return (
    <Line
      {...props}
      dot={false}
    />
  );
}

function MonthlyTrendChart() {
  const [monthlyOrders, setMonthlyOrders] = useState<any[]>([]);

  useEffect(() => {
    statsApi.getOrdersByMonth().then(data => {
      setMonthlyOrders(data.map(d => ({
        ...d,
        month: d.month.split('-')[1] + '月',
      })));
    });
  }, []);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-display font-semibold text-cocoa-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-500" />
        月度销售趋势
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyOrders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBE1DB" />
            <XAxis
              dataKey="month"
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
              formatter={(value: number, name: string) => [
                name === 'total_revenue' ? `¥${value}` : `${value} 单`,
                name === 'total_revenue' ? '销售额' : '订单数',
              ]}
            />
            <Bar
              dataKey="total_revenue"
              name="销售额"
              fill="url(#revenueGradient)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8A5A5" />
                <stop offset="100%" stopColor="#F5D5CD" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
