"use client";

import { useState, useEffect } from "react";

export default function Pagination({ page, setPage, totalPages }: any) {
  const [inputPage, setInputPage] = useState(page);

  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const handleJump = () => {
    let p = parseInt(inputPage);
    if (isNaN(p)) {
      setInputPage(page);
      return;
    }
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
    setInputPage(p);
  };

  return (
    <div className="flex justify-center mt-12 gap-2 sm:gap-4 items-center flex-wrap">
      <button
        disabled={page <= 1}
        onClick={() => setPage(1)}
        className="hidden sm:block px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
        title="Đầu trang"
      >
        Đầu
      </button>
      <button
        disabled={page <= 1}
        onClick={() => setPage(1)}
        className="sm:hidden px-3 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
        title="Đầu trang"
      >
        «
      </button>

      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
      >
        Trước
      </button>

      <span className="flex items-center gap-2 py-1 px-3 text-sm font-medium text-gray-600 bg-white border rounded-lg shadow-sm">
        Trang
        <input
          type="number"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onBlur={handleJump}
          onKeyDown={(e) => e.key === "Enter" && handleJump()}
          className="w-12 px-1 py-1 text-center border rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={1}
          max={totalPages || 1}
        />
        / {totalPages || 1}
      </span>

      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
      >
        Sau
      </button>

      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => setPage(totalPages)}
        className="hidden sm:block px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
        title="Cuối trang"
      >
        Cuối
      </button>
      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => setPage(totalPages)}
        className="sm:hidden px-3 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
        title="Cuối trang"
      >
        »
      </button>
    </div>
  );
}
