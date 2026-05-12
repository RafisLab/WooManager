/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import OrderDetail from './components/OrderDetail';
import Settings from './components/Settings';

type View = 'login' | 'setup' | 'dashboard' | 'settings' | 'order-detail';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [settingsConfig, setSettingsConfig] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/config-status');
      if (!res.ok) throw new Error("Server not responding correctly");
      const data = await res.json();
      setIsConfigured(data.isConfigured);
      if (!data.isConfigured) {
        setView('setup');
      } else if (token) {
        setView('dashboard');
        fetchOrders();
      }
    } catch (err) {
      console.error("Status check failed", err);
      // Fallback for demo or if server is starting up
      setTimeout(checkStatus, 3000); 
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else {
        if (res.status === 401 || res.status === 403) handleLogout();
      }
    } catch (err) {
      console.error("Fetching orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (pin: string) => {
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setView('dashboard');
        fetchOrders();
      } else {
        setLoginError(data.error);
      }
    } catch (err) {
      setLoginError("লগইন করতে সমস্যা হয়েছে।");
    }
  };

  const handleSetup = async (setupData: any) => {
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData)
      });
      if (res.ok) {
        setIsConfigured(true);
        setView('login');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setView('login');
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error("Order update failed", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettingsConfig(data);
      }
    } catch (err) {
      console.error("Settings fetch failed", err);
    }
  };

  const handleUpdateSettings = async (data: any) => {
    try {
      const res = await fetch('/api/update-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        if (data.wooConfig) {
          setSettingsConfig(data.wooConfig);
        }
        fetchOrders();
      }
    } catch (err) {
      throw err;
    }
  };

  if (isConfigured === null) return <div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;

  if (!isConfigured) return <Setup onSetup={handleSetup} />;

  if (view === 'login') return <Login onLogin={handleLogin} error={loginError} />;

  return (
    <Layout
      currentView={view === 'order-detail' ? 'dashboard' : view}
      onLogout={handleLogout}
      onNavigate={(v) => {
        setView(v);
        if (v === 'settings') fetchSettings();
        if (v === 'dashboard') fetchOrders();
      }}
    >
      {view === 'dashboard' && (
        <Dashboard 
          orders={orders} 
          loading={loading} 
          onRefresh={fetchOrders} 
          onViewOrder={(order) => {
            setSelectedOrder(order);
            setView('order-detail');
          }}
        />
      )}
      {view === 'order-detail' && selectedOrder && (
        <OrderDetail 
          order={selectedOrder} 
          onBack={() => setView('dashboard')} 
          onUpdateStatus={updateOrderStatus}
        />
      )}
      {view === 'settings' && settingsConfig && (
        <Settings 
          initialConfig={settingsConfig} 
          onUpdate={handleUpdateSettings}
        />
      )}
    </Layout>
  );
}

