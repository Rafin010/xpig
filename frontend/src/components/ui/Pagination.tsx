'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  baseUrl?: string;
  queryParams?: Record<string, string | number | undefined>;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 48,
  baseUrl = '/',
  queryParams = {},
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build target URL for a given page number
  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    
    // Preserve existing query params except page
    Object.entries(queryParams).forEach(([key, val]) => {
      if (key !== 'page' && val !== undefined && val !== null && val !== '') {
        params.set(key, String(val));
      }
    });

    if (pageNum > 1) {
      params.set('page', String(pageNum));
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const handlePageClick = (e: React.MouseEvent, pageNum: number) => {
    if (pageNum === currentPage || pageNum < 1 || pageNum > totalPages) {
      e.preventDefault();
      return;
    }
    if (onPageChange) {
      e.preventDefault();
      onPageChange(pageNum);
      if (typeof window !== 'undefined') {
        const target = document.getElementById('more-videos-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }
    // Smooth scroll back to top of the catalog
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate intelligent page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        // Near start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className="w-full flex flex-col items-center justify-center my-10 sm:my-14 select-none">
      {/* Pagination Controller Buttons - STRICTLY CENTERED */}
      <nav 
        aria-label="Video catalog pagination" 
        className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 max-w-full"
      >
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            onClick={(e) => handlePageClick(e, currentPage - 1)}
            className="flex items-center gap-1.5 px-3 sm:px-4 h-10 sm:h-11 rounded-xl bg-[#141417] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/90 hover:border-zinc-700 transition-all text-xs sm:text-sm font-bold shadow-sm"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center gap-1.5 px-3 sm:px-4 h-10 sm:h-11 rounded-xl bg-[#0f0f11] text-zinc-600 border border-zinc-900/80 cursor-not-allowed opacity-40 text-xs sm:text-sm font-bold"
            aria-label="Previous page disabled"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>
        )}

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 sm:w-9 h-10 sm:h-11 flex items-center justify-center text-zinc-500 font-bold tracking-wider text-xs sm:text-sm select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <Link
                key={`page-${p}`}
                href={getPageUrl(p)}
                onClick={(e) => handlePageClick(e, p)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[38px] sm:min-w-[44px] h-10 sm:h-11 px-2 flex items-center justify-center rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-2 ring-pink-500/50 scale-105 border border-pink-400/40 z-10'
                    : 'bg-[#141417] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/90 hover:border-zinc-700 hover:scale-102'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            onClick={(e) => handlePageClick(e, currentPage + 1)}
            className="flex items-center gap-1.5 px-3 sm:px-4 h-10 sm:h-11 rounded-xl bg-[#141417] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/90 hover:border-zinc-700 transition-all text-xs sm:text-sm font-bold shadow-sm"
            aria-label="Go to next page"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center gap-1.5 px-3 sm:px-4 h-10 sm:h-11 rounded-xl bg-[#0f0f11] text-zinc-600 border border-zinc-900/80 cursor-not-allowed opacity-40 text-xs sm:text-sm font-bold"
            aria-label="Next page disabled"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </nav>

      {/* Concise, Professional Summary Text */}
      <div className="mt-3.5 text-center text-xs text-zinc-500 font-medium tracking-wide">
        <span>Page <span className="text-zinc-300 font-bold">{currentPage}</span> of <span className="text-zinc-300 font-bold">{totalPages}</span></span>
        {totalItems ? (
          <span className="text-zinc-600 ml-2">
            (<span className="text-zinc-400 font-semibold">{totalItems.toLocaleString()}</span> videos)
          </span>
        ) : null}
      </div>
    </div>
  );
}
