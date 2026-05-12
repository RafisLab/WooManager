/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Globe, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  initialConfig: any;
  onUpdate: (data: any) => Promise<void>;
}

export default function Settings({ initialConfig, onUpdate }: SettingsProps) {
  const [formData, setFormData] = useState({
    url: initialConfig.url,
    consumerKey: initialConfig.consumerKey,
    consumerSecret: initialConfig.consumerSecret,
    newPin: '',
    confirmPin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPin && formData.newPin !== formData.confirmPin) {
      setError('পিন দুটি মিলছে না!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await onUpdate({
        wooConfig: {
          url: formData.url,
          consumerKey: formData.consumerKey,
          consumerSecret: formData.consumerSecret
        },
        newPin: formData.newPin || undefined
      });
      setSuccess('সেটিংস সফলভাবে আপডেট হয়েছে!');
      if (formData.newPin) setFormData({ ...formData, newPin: '', confirmPin: '' });
    } catch (err) {
      setError('আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900 border-b pb-4 mb-6">সেটিংস</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* WooCommerce Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-neutral-900 font-semibold mb-2">
              <Globe className="h-5 w-5 text-orange-600" />
              <h2>WooCommerce সংযোগ</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">সাইট URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Consumer Key</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={formData.consumerKey}
                    onChange={e => setFormData({...formData, consumerKey: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Consumer Secret</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={formData.consumerSecret}
                    onChange={e => setFormData({...formData, consumerSecret: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PIN Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-neutral-900 font-semibold mb-2 border-t pt-6">
              <Lock className="h-5 w-5 text-orange-600" />
              <h2>পিন পরিবর্তন করুন (প্রয়োজন না হলে ফাঁকা রাখুন)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">নতুন পিন</label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={formData.newPin}
                  onChange={e => setFormData({...formData, newPin: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">পিন কনফার্ম করুন</label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={formData.confirmPin}
                  onChange={e => setFormData({...formData, confirmPin: e.target.value})}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition flex justify-center items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                পরিবর্তন সেভ করুন
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
