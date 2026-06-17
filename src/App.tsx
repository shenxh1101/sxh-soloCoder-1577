import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarLayout from "@/components/Layout/SidebarLayout";
import Dashboard from "@/pages/Dashboard";
import Templates from "@/pages/Templates";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import NewOrder from "@/pages/NewOrder";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </SidebarLayout>
    </Router>
  );
}
