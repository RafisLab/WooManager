/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, Package, User, MapPin, CreditCard, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface Order {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  line_items: any[];
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
  };
}

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
}

export default function OrderDetail({ order, onBack, onUpdateStatus }: OrderDetailProps) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    await onUpdateStatus(order.id, status);
    setUpdating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">অর্ডার #{order.number}</h1>
          <p className="text-neutral-500 text-sm">{new Date(order.date_created).toLocaleString('bn-BD')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b bg-neutral-50 flex items-center">
              <Package className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="font-semibold">পণ্যের বিবরণ</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.line_items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">{item.name}</h3>
                    <p className="text-sm text-neutral-500">মূল্য: {item.price} {order.currency} | পরিমাণ: {item.quantity}</p>
                  </div>
                  <div className="font-semibold text-neutral-900">
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} {order.currency}
                  </div>
                </div>
              ))}
              <div className="p-4 bg-orange-50/50 flex justify-between items-center font-bold text-lg text-neutral-900">
                <span>মোট</span>
                <span>{order.total} {order.currency}</span>
              </div>
            </div>
          </section>

          {/* Billing Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b bg-neutral-50 flex items-center">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="font-semibold">গ্রাহকের বিবরণ</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">নাম</p>
                <p className="text-neutral-900 font-medium">{order.billing.first_name} {order.billing.last_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">ফোন নম্বর</p>
                <p className="text-neutral-900 font-medium">{order.billing.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">ইমেইল</p>
                <p className="text-neutral-900 font-medium">{order.billing.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">ঠিকানা</p>
                <p className="text-neutral-900 font-medium flex items-start">
                  <MapPin className="h-4 w-4 mr-1.5 text-neutral-400 mt-0.5" />
                  {order.billing.address_1}, {order.billing.city}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Status Update Card */}
          <section className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden border-t-4 border-t-orange-600">
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-2 text-neutral-900 font-bold text-lg">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <h2>স্ট্যাটাস আপডেট করুন</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">বর্তমান স্ট্যাটাস</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-neutral-50 outline-none font-medium"
                >
                  <option value="pending">বাকি (Pending)</option>
                  <option value="processing">প্রসেসিং (Processing)</option>
                  <option value="on-hold">অপেক্ষমান (On-Hold)</option>
                  <option value="completed">সম্পন্ন (Completed)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                  <option value="refunded">রিফান্ড (Refunded)</option>
                  <option value="failed">ফেইল্ড (Failed)</option>
                </select>
              </div>

              <button
                onClick={handleUpdate}
                disabled={updating || status === order.status}
                className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition flex justify-center items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                {updating ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Payment Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
             <div className="flex items-center text-neutral-900 font-semibold mb-4">
               <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
               <h2>পেমেন্ট মেথড</h2>
             </div>
             <p className="text-neutral-600 font-medium">ক্যাশ অন ডেলিভারি (বা অন্য মেথড)</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
