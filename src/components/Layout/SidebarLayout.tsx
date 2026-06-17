import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flower2,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Plus,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/templates', label: '花束模板', icon: Flower2 },
  { path: '/orders', label: '订单管理', icon: ClipboardList },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/customers', label: '客户管理', icon: Users },
  { path: '/stats', label: '统计报表', icon: BarChart3 },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-cocoa-100 flex flex-col">
        <div className="p-6 border-b border-cocoa-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-soft">
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg text-cocoa-800">花小艺</h1>
              <p className="text-xs text-cocoa-500">花店订单管理</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <NavLink
            to="/orders/new"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新建订单
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
