/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Key, Globe, Lock, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupProps {
  onSetup: (data: any) => Promise<void>;
}

export default function Setup({ onSetup }: SetupProps) {
  const [formData, setFormData] = useState({
    pin: '',
    confirmPin: '',
    url: '',
    consumerKey: '',
    consumerSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin !== formData.confirmPin) {
      setError('পিন দুটি মিলছে না!');
      return;
    }
    if (formData.pin.length < 4) {
      setError('পিন কমপক্ষে ৪ সংখ্যার হতে হবে');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSetup({
        pin: formData.pin,
        wooConfig: {
          url: formData.url,
          consumerKey: formData.consumerKey,
          consumerSecret: formData.consumerSecret
        }
      });
    } catch (err) {
      setError('সেটআপ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
          <div className="bg-orange-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">WooManager সেটআপ</h1>
            <p className="text-orange-100 italic">প্রথমবার ব্যবহারের জন্য কনফিগার করুন</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* PIN Section */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-neutral-900 font-semibold mb-4 border-b pb-2">
                  <Lock className="h-5 w-5 text-orange-600" />
                  <h2>পিন সেটআপ</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">নতুন পিন</label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={formData.pin}
                      onChange={e => setFormData({...formData, pin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">পিন কনফার্ম করুন</label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={formData.confirmPin}
                      onChange={e => setFormData({...formData, confirmPin: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* WooCommerce Section */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-neutral-900 font-semibold mb-4 border-b pb-2">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <h2>WooCommerce সংযোগ</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">সাইট URL (https সহ)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="url"
                        required
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={formData.url}
                        onChange={e => setFormData({...formData, url: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Consumer Key (ck_...)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="ck_xxxxxxxxxxxx"
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={formData.consumerKey}
                        onChange={e => setFormData({...formData, consumerKey: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Consumer Secret (cs_...)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="password"
                        required
                        placeholder="cs_xxxxxxxxxxxx"
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={formData.consumerSecret}
                        onChange={e => setFormData({...formData, consumerSecret: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition flex justify-center items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    সেভ করুন এবং এগিয়ে যান
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
