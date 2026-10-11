'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  PlayCircle, 
  UploadCloud, 
  Eye, 
  TrendingUp, 
  Filter, 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  CheckCircle2, 
  Film, 
  RefreshCw, 
  FileVideo,
  ExternalLink,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Video {
  id: string | number;
  title: string;
  description?: string;
  creator_id?: string | number;
  views: number;
  likes?: number;
  total_watch_seconds?: number;
  created_at?: string;
  status: string;
  visibility?: string;
  thumbnail_url?: string;
  preview_url?: string;
}

const ITEMS_PER_PAGE = 50;

export default function VideoManagementPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    thumbnail_url: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);

  // Delete Video Custom Modal State
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Device Video Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadVisibility, setUploadVisibility] = useState('PUBLIC');
  const [uploadStatus, setUploadStatus] = useState('PUBLISHED');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://xpig.onrender.com/api/v1/videos/');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      
      let list: Video[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.items)) {
        list = data.items;
      }

      // Sort newest at the very top (ID descending or created_at descending)
      list.sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        if (idA !== idB) return idB - idA;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setVideos(list);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Error fetching videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filtered list based on Search and Status Filter
  const filteredVideos = useMemo(() => {
    let result = videos;

    if (statusFilter !== 'ALL') {
      result = result.filter(v => (v.status || '').toUpperCase() === statusFilter.toUpperCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(v => 
        (v.title || '').toLowerCase().includes(q) ||
        String(v.id).includes(q) ||
        (v.status || '').toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [videos, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / ITEMS_PER_PAGE));
  
  // Current page items
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (vid: Video) => {
    setEditingVideo(vid);
    setEditFormData({
      title: vid.title || '',
      description: vid.description || '',
      visibility: (vid.visibility || 'PUBLIC').toUpperCase(),
      status: (vid.status || 'PUBLISHED').toUpperCase(),
      thumbnail_url: vid.thumbnail_url || '',
    });
    setEditSuccessMsg(false);
  };

  // Handle Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${editingVideo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to update video');
      }

      // Update locally
      setVideos(prev => prev.map(v => {
        if (v.id === editingVideo.id) {
          return {
            ...v,
            title: editFormData.title,
            description: editFormData.description,
            visibility: editFormData.visibility,
            status: editFormData.status,
            thumbnail_url: editFormData.thumbnail_url,
          };
        }
        return v;
      }));

      setEditSuccessMsg(true);
      showToast(`Video #${editingVideo.id} updated successfully!`);
      setTimeout(() => {
        setEditingVideo(null);
      }, 700);
    } catch (err: any) {
      alert(err.message || 'Error updating video');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setDeleting(true);

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/videos/${deletingVideo.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to delete video');
      }

      // Remove from state immediately
      setVideos(prev => prev.filter(v => v.id !== deletingVideo.id));
      showToast(`Video #${deletingVideo.id} permanently deleted.`);
      setDeletingVideo(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting video');
    } finally {
      setDeleting(false);
    }
  };

  // Handle File Selection for Manual Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Auto-set title from file name without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setUploadTitle(nameWithoutExt);
      setUploadError(null);
    }
  };

  // Handle Direct Upload Submit with XMLHttpRequest Progress
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a video file from your device');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a video title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());
    formData.append('description', uploadDescription.trim());
    formData.append('visibility', uploadVisibility);
    formData.append('status', uploadStatus);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://xpig.onrender.com/api/v1/videos/admin-upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 98); // 98% while uploading
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadProgress(100);
        setUploadSuccess(true);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.video) {
            // Prepend new video at the very top (#1)
            setVideos(prev => [res.video, ...prev]);
          }
        } catch (e) {
          fetchVideos();
        }
        showToast('Video uploaded and published to Cloudflare R2!');
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadTitle('');
          setUploadDescription('');
          setUploadProgress(0);
          setUploadSuccess(false);
          setUploading(false);
          setCurrentPage(1); // Jump to top page
        }, 1200);
      } else {
        setUploading(false);
        try {
          const errRes = JSON.parse(xhr.responseText);
          setUploadError(errRes.detail || 'Upload failed. Please try again.');
        } catch {
          setUploadError(`Upload failed with status code ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadError('Network error during file upload. Check your connection.');
    };

    xhr.send(formData);
  };

  // Top KPI calculations
  const totalViews = videos.reduce((acc, vid) => acc + (vid.views || 0), 0);
  const activeVaultCount = videos.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-emerald-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-pink-500" />
            Video Moderation Queue
          </h1>
          <p className="text-zinc-400 mt-1">
            Real-time management, metadata editing, custom delete confirmation, and device uploads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchVideos}
            disabled={loading}
            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-medium"
            title="Refresh Videos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
            Refresh
          </button>
          <button 
            onClick={() => {
              setUploadFile(null);
              setUploadTitle('');
              setUploadDescription('');
              setUploadError(null);
              setUploadProgress(0);
              setUploadSuccess(false);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/25 active:scale-[0.98]"
          >
            <UploadCloud className="w-5 h-5" />
            Upload from Device
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Uploads (#1 Newest)</span>
            <UploadCloud className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{activeVaultCount}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3"/> Reverse serial ordered
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Video Views</span>
            <Eye className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalViews.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-2">Across all platform videos</div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Active Content Vault</span>
            <PlayCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{activeVaultCount}</div>
          <div className="text-xs text-zinc-500 mt-2">50 videos displayed per page</div>
        </div>
      </div>

      {/* Main Video Moderation Table Container */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Search, Filter & Count Bar */}
        <div className="p-5 border-b border-zinc-800/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>All Videos</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold">
                {filteredVideos.length}
              </span>
            </h3>
            {searchQuery && (
              <span className="text-xs text-zinc-400">
                Filtered from {videos.length} total
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, ID, or status..." 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" 
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-pink-500 transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="FLAGGED">Flagged</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
              <p className="text-sm text-zinc-400 font-medium">Loading videos and sources...</p>
            </div>
          ) : paginatedVideos.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
              <Film className="w-10 h-10 text-zinc-700" />
              <p className="text-base text-zinc-400 font-semibold">No videos found matching your query.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-pink-400 hover:underline mt-1"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#141416] text-zinc-400 border-b border-zinc-800/80">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider w-16 text-center"># Serial</th>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Video & Details</th>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Upload Date</th>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Reach / Views</th>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {paginatedVideos.map((vid, idx) => {
                  // Global serial number: #1 is the newest video at top of Page 1!
                  const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const normalizedStatus = (vid.status || 'PUBLISHED').toUpperCase();

                  return (
                    <tr key={vid.id} className="hover:bg-zinc-900/50 transition-colors group">
                      
                      {/* Serial Number Column */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center font-mono font-black text-xs px-2 py-1 rounded-lg ${
                          serialNumber === 1 
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white'
                        }`}>
                          #{serialNumber}
                        </span>
                      </td>

                      {/* Video Thumbnail & Title Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <Link 
                            href={`/watch/${vid.id}`} 
                            target="_blank"
                            className="relative w-20 h-12 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shrink-0 group/thumb block"
                          >
                            {vid.thumbnail_url ? (
                              <img 
                                src={vid.thumbnail_url} 
                                alt={vid.title} 
                                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <PlayCircle className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </Link>

                          <div className="min-w-0 max-w-md">
                            <Link 
                              href={`/watch/${vid.id}`} 
                              target="_blank"
                              className="font-bold text-white hover:text-pink-400 transition-colors line-clamp-1 block"
                              title={vid.title}
                            >
                              {vid.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-mono">
                              <span>ID: {vid.id}</span>
                              <span>•</span>
                              <span className="capitalize">{vid.visibility?.toLowerCase() || 'public'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Upload Date Column */}
                      <td className="px-5 py-4 text-zinc-400 font-medium">
                        {vid.created_at ? (
                          <div className="text-xs">
                            <div className="text-zinc-300 font-semibold">
                              {new Date(vid.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-zinc-500 font-mono text-[11px] mt-0.5">
                              {new Date(vid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">Unknown</span>
                        )}
                      </td>

                      {/* Reach & Views Column */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-pink-400" />
                          <span>{(vid.views || 0).toLocaleString()} views</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {vid.total_watch_seconds ? `${vid.total_watch_seconds}s watch time` : '0s watch time'}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                          normalizedStatus === 'PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 
                          normalizedStatus === 'PENDING_REVIEW' ? 'bg-amber-400/15 text-amber-400 border-amber-400/30' : 
                          normalizedStatus === 'FLAGGED' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {normalizedStatus}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(vid)}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors" 
                            title="Edit Video Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingVideo(vid)}
                            className="p-2 text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/40 rounded-lg border border-zinc-800 hover:border-rose-900/60 transition-colors" 
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 50-per-page Professional Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 font-medium">
              Showing <span className="text-white font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-white font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredVideos.length)}</span> of{' '}
              <span className="text-white font-bold">{filteredVideos.length}</span> videos (Page {currentPage} of {totalPages})
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((pageNum, idx, arr) => {
                  const prevNum = arr[idx - 1];
                  const showEllipsis = prevNum && pageNum - prevNum > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && (
                        <span className="px-2 text-zinc-600 text-xs">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Video Metadata</h2>
                  <p className="text-xs text-zinc-400 font-mono">Video ID: #{editingVideo.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Changes saved successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Video Title
                </label>
                <input
                  required
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Optional video description..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={editFormData.visibility}
                    onChange={(e) => setEditFormData({ ...editFormData, visibility: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-all"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="UNLISTED">Unlisted</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Moderation Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-all"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="FLAGGED">Flagged</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={editFormData.thumbnail_url}
                  onChange={(e) => setEditFormData({ ...editFormData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-pink-500 transition-all"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION POPUP MODAL */}
      {deletingVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-rose-900/70 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white">Delete Video Permanently?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 mb-5">
                This action is irreversible. The video record and all associated Cloudflare R2 storage sources will be permanently destroyed.
              </p>

              {/* Video Preview Card in Modal */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 text-left mb-6">
                <div className="w-16 h-11 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                  {deletingVideo.thumbnail_url ? (
                    <img src={deletingVideo.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{deletingVideo.title}</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Video ID: #{deletingVideo.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingVideo(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete Video
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ULTRA-PROFESSIONAL DEVICE VIDEO UPLOADER MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upload Video From Device</h2>
                  <p className="text-xs text-zinc-400">Direct streaming upload to active Cloudflare R2 node</p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drag and Drop File Picker Zone */}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />

              {!uploadFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-pink-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all bg-zinc-900/30 hover:bg-zinc-900/60 group"
                >
                  <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400 group-hover:text-pink-400 group-hover:border-pink-500/30 transition-all">
                    <FileVideo className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                    Click to select or drag and drop video
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Supports MP4, WebM, MOV (H.264 / AAC)
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                      <FileVideo className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{uploadFile.name}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadFile.type || 'video/mp4'}
                      </div>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Video Title
                </label>
                <input
                  required
                  type="text"
                  disabled={uploading}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Amazing Cinematic Drone Shot 4K"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  disabled={uploading}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Add tags, credits, or context..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none disabled:opacity-50"
                />
              </div>

              {/* Visibility and Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Visibility
                  </label>
                  <select
                    disabled={uploading}
                    value={uploadVisibility}
                    onChange={(e) => setUploadVisibility(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-all disabled:opacity-50"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="UNLISTED">Unlisted</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Publish Status
                  </label>
                  <select
                    disabled={uploading}
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 transition-all disabled:opacity-50"
                  >
                    <option value="PUBLISHED">Published Directly</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                  </select>
                </div>
              </div>

              {/* Real-time Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                      {uploadProgress < 100 ? 'Streaming to Cloudflare R2...' : 'Registering video & generating feeds...'}
                    </span>
                    <span className="font-mono text-pink-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-300 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Success Notice */}
              {uploadSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Upload complete! Video prepended as #1 to moderation list.</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Uploading ({uploadProgress}%)...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Start Upload
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
