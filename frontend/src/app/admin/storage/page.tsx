"use client";

import React, { useState, useEffect } from "react";
import { 
  HardDrive, 
  Plus, 
  Database, 
  AlertCircle, 
  RefreshCw, 
  Film, 
  CheckCircle2, 
  Server, 
  ExternalLink,
  ShieldCheck,
  X,
  Trash2,
  Radio,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface StorageNode {
  id: string | number;
  name: string;
  bucket_name: string;
  public_url: string;
  total_used_bytes: number;
  max_bytes: number;
  is_active: boolean;
  is_full: boolean;
  video_count?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://xpig.onrender.com";

export default function StorageSettingsPage() {
  const [nodes, setNodes] = useState<StorageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Syncing state per node
  const [syncingNodeId, setSyncingNodeId] = useState<string | number | null>(null);
  const [activatingNodeId, setActivatingNodeId] = useState<string | number | null>(null);
  const [deletingNode, setDeletingNode] = useState<StorageNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
  const [formError, setFormError] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/v1/storage-nodes/`);
      if (!res.ok) throw new Error("Failed to fetch storage nodes");
      const data = await res.json();
      setNodes(Array.isArray(data) ? data : []);
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
    if (!bytes || bytes === 0) return "0.00 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 0.05) {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/v1/storage-nodes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to create storage node");
      }
      
      setIsModalOpen(false);
      setFormData({
        name: "",
        account_id: "",
        access_key_id: "",
        secret_access_key: "",
        bucket_name: "",
        public_url: "",
      });
      showToast("Storage node created successfully!");
      fetchNodes();
    } catch (err: any) {
      setFormError(err.message || "Failed to create storage node");
    } finally {
      setSubmitting(false);
    }
  };

  // Sync Node Telemetry
  const handleSyncNode = async (nodeId: string | number) => {
    try {
      setSyncingNodeId(nodeId);
      const res = await fetch(`${API_BASE}/api/v1/storage-nodes/${nodeId}/sync`, {
        method: "POST"
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.detail || "Failed to sync storage node");
      }
      const data = await res.json();
      showToast(data.message || `Node #${nodeId} synced successfully.`);
      fetchNodes();
    } catch (err: any) {
      alert(err.message || "Sync failed");
    } finally {
      setSyncingNodeId(null);
    }
  };

  // Activate Node for Uploads
  const handleActivateNode = async (nodeId: string | number) => {
    try {
      setActivatingNodeId(nodeId);
      const res = await fetch(`${API_BASE}/api/v1/storage-nodes/${nodeId}/activate`, {
        method: "PATCH"
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.detail || "Failed to activate node");
      }
      const data = await res.json();
      showToast(data.message || `Node #${nodeId} is now active.`);
      fetchNodes();
    } catch (err: any) {
      alert(err.message || "Activation failed");
    } finally {
      setActivatingNodeId(null);
    }
  };

  // Delete Standby Node
  const handleConfirmDeleteNode = async () => {
    if (!deletingNode) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE}/api/v1/storage-nodes/${deletingNode.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.detail || "Failed to delete storage node");
      }
      showToast(`Storage node ${deletingNode.name} deleted.`);
      setDeletingNode(null);
      fetchNodes();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Aggregates for top KPI stats
  const totalAllocatedBytes = nodes.reduce((acc, n) => acc + (n.max_bytes || 0), 0);
  const totalUsedBytes = nodes.reduce((acc, n) => acc + (n.total_used_bytes || 0), 0);
  const totalVideosStored = nodes.reduce((acc, n) => acc + (n.video_count || 0), 0);
  const activeNodesCount = nodes.filter(n => n.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-pink-500" />
            Storage Accounts & Nodes
          </h1>
          <p className="text-zinc-400 mt-1">
            Real-time multi-bucket Cloudflare R2 cluster health, capacities, and exact video distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNodes}
            disabled={loading}
            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-medium"
            title="Refresh Nodes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/25 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Storage Node
          </button>
        </div>
      </div>

      {/* Aggregate Storage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Nodes</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{nodes.length}</div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {activeNodesCount} Active & Routing Uploads
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Storage Used</span>
            <Database className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-white">{formatBytes(totalUsedBytes)}</div>
          <div className="text-xs text-zinc-500 mt-2">
            Across {nodes.length} registered R2 bucket{nodes.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Allocated</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{formatBytes(totalAllocatedBytes)}</div>
          <div className="text-xs text-zinc-500 mt-2">
            Remaining: {formatBytes(Math.max(0, totalAllocatedBytes - totalUsedBytes))}
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Videos Stored</span>
            <Film className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalVideosStored}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Real videos hosted on R2
          </div>
        </div>
      </div>

      {/* Nodes Grid or States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-[#111113] border border-zinc-800/60 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Inspecting storage clusters and capacity...</p>
        </div>
      ) : error ? (
        <div className="p-5 bg-red-950/30 border border-red-800/60 rounded-2xl flex items-start gap-4 text-red-300">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-200">Error connecting to storage service</h3>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
            <button
              onClick={fetchNodes}
              className="mt-3 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 border border-red-700 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-20 bg-[#111113] border border-zinc-800/80 rounded-2xl p-8">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-500">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Storage Accounts Configured</h3>
          <p className="text-zinc-400 mt-1.5 mb-6 max-w-md mx-auto text-sm">
            Add your primary Cloudflare R2 bucket credentials to start hosting videos with infinite distributed storage.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/25"
          >
            <Plus className="w-5 h-5" />
            Add First Storage Node
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => {
            const rawPercent = node.max_bytes > 0 ? (node.total_used_bytes / node.max_bytes) * 100 : 0;
            const usagePercent = Math.min(100, Math.max(0, rawPercent));
            
            // 3-Stage User-Requested Color Thresholds:
            // 1) Green: Usage < 60% (Healthy & Spacious)
            // 2) Gold/Amber: 60% <= Usage < 85% (Warning / Near Full)
            // 3) Red: Usage >= 85% (Critical / Full)
            const isDanger = usagePercent >= 85 || node.is_full;
            const isWarning = usagePercent >= 60 && usagePercent < 85;
            const isSafe = usagePercent < 60 && !node.is_full;

            const progressColor = isDanger 
              ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" 
              : isWarning 
              ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" 
              : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";

            const statusBadgeText = isDanger 
              ? "Critical Full" 
              : isWarning 
              ? "Near Full (Warning)" 
              : "Healthy (Green)";

            const statusBadgeStyle = isDanger
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
              : isWarning
              ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

            const videoCount = node.video_count || 0;
            const isSyncing = syncingNodeId === node.id;
            const isActivating = activatingNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`bg-[#111113] rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 hover:border-zinc-700 shadow-xl flex flex-col justify-between ${
                  node.is_active 
                    ? "border-pink-500/60 ring-1 ring-pink-500/30" 
                    : "border-zinc-800/80"
                }`}
              >
                {/* Active Routing Banner */}
                {node.is_active && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-600 to-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Active Uploader
                  </div>
                )}

                <div>
                  {/* Node Header */}
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                      <Database className={`w-6 h-6 ${node.is_active ? 'text-pink-500' : 'text-zinc-500'}`} />
                    </div>
                    <div className="pr-16 min-w-0">
                      <h3 className="font-bold text-lg text-white truncate" title={node.name}>
                        {node.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono truncate" title={node.bucket_name}>
                        Bucket: {node.bucket_name}
                      </p>
                    </div>
                  </div>

                  {/* Real Videos Count Badge */}
                  <div className="mb-5 p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-zinc-300 text-xs font-semibold">
                      <Film className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>Videos Stored in Node</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 rounded-md font-mono font-bold text-xs">
                      {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                    </span>
                  </div>

                  {/* Real Storage Capacity & Colorized Percentage Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                        Storage Usage
                      </span>
                      <span className="font-mono text-zinc-200 font-bold">
                        {formatBytes(node.total_used_bytes)} / {formatBytes(node.max_bytes)}
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
                        style={{ width: `${Math.max(2, usagePercent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusBadgeStyle}`}>
                        {statusBadgeText} ({usagePercent.toFixed(1)}%)
                      </span>
                      <span className="text-zinc-500 font-mono">
                        Free: {formatBytes(Math.max(0, node.max_bytes - node.total_used_bytes))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Details & Action Controls */}
                <div className="pt-4 border-t border-zinc-800/80 text-xs flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">Upload Routing</span>
                    <span className={`font-semibold flex items-center gap-1 ${node.is_full ? "text-rose-400" : node.is_active ? "text-emerald-400" : "text-zinc-400"}`}>
                      {node.is_full ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Full (Inactive)
                        </>
                      ) : node.is_active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active (Direct Uploads)
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 text-zinc-500" /> Standby (Ready)
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">Public R2 CDN</span>
                    <a
                      href={node.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 hover:underline truncate max-w-[170px] font-mono text-[11px] flex items-center gap-1"
                      title={node.public_url}
                    >
                      {node.public_url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-2">
                    <button
                      onClick={() => handleSyncNode(node.id)}
                      disabled={isSyncing}
                      className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                      title="Sync real telemetry & video counts"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-pink-500" : "text-zinc-400"}`} />
                      <span>{isSyncing ? "Syncing..." : "Sync Node"}</span>
                    </button>

                    {!node.is_active && (
                      <button
                        onClick={() => handleActivateNode(node.id)}
                        disabled={isActivating || node.is_full}
                        className="py-2 px-3 bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/40 text-pink-300 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                        title="Set as primary upload destination"
                      >
                        <Radio className={`w-3.5 h-3.5 ${isActivating ? "animate-pulse" : ""}`} />
                        <span>{isActivating ? "Switching..." : "Make Active"}</span>
                      </button>
                    )}

                    {!node.is_active && (
                      <button
                        onClick={() => setDeletingNode(node)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition-all"
                        title="Delete standby storage node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex items-center gap-3 bg-red-950/20">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete Standby Storage Node?</h2>
                <p className="text-xs text-zinc-400">This will remove node from XPIG cluster</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">"{deletingNode.name}"</strong>? 
                Make sure this bucket does not host videos currently streamed by users.
              </p>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-1 font-mono text-zinc-400">
                <div>Bucket: {deletingNode.bucket_name}</div>
                <div>Videos: {deletingNode.video_count || 0}</div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingNode(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteNode}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Storage Node Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Cloudflare R2 Storage Node</h2>
                  <p className="text-xs text-zinc-400">Expand cluster storage with a new R2 bucket</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Node Display Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Primary R2 Bucket (US-East)"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cloudflare Account ID
                </label>
                <input
                  required
                  type="text"
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  placeholder="e.g., 90374e2d31..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    R2 Access Key ID
                  </label>
                  <input
                    required
                    type="password"
                    name="access_key_id"
                    value={formData.access_key_id}
                    onChange={handleInputChange}
                    placeholder="Access Key"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    R2 Secret Access Key
                  </label>
                  <input
                    required
                    type="password"
                    name="secret_access_key"
                    value={formData.secret_access_key}
                    onChange={handleInputChange}
                    placeholder="Secret Key"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Bucket Name
                </label>
                <input
                  required
                  type="text"
                  name="bucket_name"
                  value={formData.bucket_name}
                  onChange={handleInputChange}
                  placeholder="e.g., xpig-vault-node"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Public R2 URL / Custom Domain
                </label>
                <input
                  required
                  type="url"
                  name="public_url"
                  value={formData.public_url}
                  onChange={handleInputChange}
                  placeholder="https://pub-xxxxxx.r2.dev or https://cdn.xpig.me"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Connect Node
                    </>
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
