"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, Plus, Database, AlertCircle, RefreshCw } from "lucide-react";

interface StorageNode {
  id: string;
  name: string;
  bucket_name: string;
  public_url: string;
  total_used_bytes: number;
  max_bytes: number;
  is_active: boolean;
  is_full: boolean;
}

export default function StorageSettingsPage() {
  const [nodes, setNodes] = useState<StorageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    account_id: "",
    access_key_id: "",
    secret_access_key: "",
    bucket_name: "",
    public_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("https://xpig.onrender.com/api/v1/storage-nodes/");
      if (!res.ok) throw new Error("Failed to fetch storage nodes");
      const data = await res.json();
      setNodes(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("https://xpig.onrender.com/api/v1/storage-nodes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create storage node");
      
      setIsModalOpen(false);
      setFormData({
        name: "",
        account_id: "",
        access_key_id: "",
        secret_access_key: "",
        bucket_name: "",
        public_url: "",
      });
      fetchNodes();
    } catch (err: any) {
      alert(err.message || "Failed to create storage node");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-indigo-600" />
            Storage Accounts
          </h1>
          <p className="text-gray-500 mt-1">Manage Cloudflare R2 storage nodes and capacity.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchNodes}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error loading storage nodes</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No storage accounts</h3>
          <p className="text-gray-500 mt-1 mb-6">Get started by adding your first Cloudflare R2 account.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => {
            const usagePercent = Math.min(100, Math.max(0, (node.total_used_bytes / node.max_bytes) * 100));
            const isWarning = usagePercent > 80;
            const isDanger = usagePercent > 95;

            return (
              <div
                key={node.id}
                className={`bg-white rounded-xl shadow-sm border p-5 relative overflow-hidden ${
                  node.is_active ? "border-indigo-300 ring-1 ring-indigo-300" : "border-gray-200"
                }`}
              >
                {node.is_active && (
                  <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-bl-lg border-l border-b border-indigo-200">
                    Active
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Database className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{node.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{node.bucket_name}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Usage</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {formatBytes(node.total_used_bytes)} / {formatBytes(node.max_bytes)} GB
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDanger ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 text-sm flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${node.is_full ? "text-red-600" : "text-emerald-600"}`}>
                      {node.is_full ? "Full" : "Accepting Uploads"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Public URL</span>
                    <a
                      href={node.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline truncate max-w-[150px] text-xs font-mono"
                    >
                      {node.public_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Add Storage Node
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., US-East Node 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                <input
                  required
                  type="text"
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  placeholder="Cloudflare Account ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                  <input
                    required
                    type="password"
                    name="access_key_id"
                    value={formData.access_key_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <input
                    required
                    type="password"
                    name="secret_access_key"
                    value={formData.secret_access_key}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                <input
                  required
                  type="text"
                  name="bucket_name"
                  value={formData.bucket_name}
                  onChange={handleInputChange}
                  placeholder="e.g., xpig-storage-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public URL</label>
                <input
                  required
                  type="url"
                  name="public_url"
                  value={formData.public_url}
                  onChange={handleInputChange}
                  placeholder="https://pub-xxxx.r2.dev"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Add Node"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
