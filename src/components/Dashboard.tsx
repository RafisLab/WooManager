/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Package, Clock, CheckCircle, RefreshCcw, Eye, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface Order {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
  };
}

interface DashboardProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onViewOrder: (order: Order) => void;
}

export default function Dashboard({ orders, loading, onRefresh, onViewOrder }: DashboardProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredOrders = orders.filter(order =>
    order.number.includes(searchTerm) ||
    `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'সম্পন্ন';
      case 'processing': return 'প্রসেসিং';
      case 'on-hold': return 'অপেক্ষমান';
      case 'cancelled': return 'বাতিল';
      case 'pending': return 'বাকি';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">অর্ডার লিস্ট</h1>
          <p className="text-neutral-500 text-sm">আপনার স্টোরের সব অর্ডার এখান থেকে পরিচালনা করুন</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          রিফ্রেশ করুন
        </button>
      </div>

      <div className="flex items-center bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
        <Search className="h-5 w-5 text-neutral-400 ml-2" />
        <input
          type="text"
          placeholder="অর্ডার নাম্বার বা কাস্টমারের নাম দিয়ে খুঁজুন..."
          className="w-full px-3 py-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">অর্ডার</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">কাস্টমার</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">টোটাল</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 italic">সার্ভার থেকে ডেটা আসছে...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 italic">কোনো অর্ডার পাওয়া যায়নি</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    layoutId={`order-${order.id}`}
                    key={order.id}
                    className="hover:bg-neutral-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-900">#{order.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(order.date_created).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {order.billing.first_name} {order.billing.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                      {order.total} {order.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="inline-flex items-center px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-orange-600 hover:text-white transition-all transform active:scale-95"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        বিস্তারিত
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
