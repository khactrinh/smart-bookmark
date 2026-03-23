"use client";
export default function Pagination({ page, setPage, totalPages }: any) {
  return (
    <div className="flex justify-center mt-12 gap-4">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
      >
        Trang trước
      </button>
      <span className="py-2 text-sm font-medium text-gray-600 bg-white px-4 border rounded-lg">
        Trang {page} / {totalPages || 1}
      </span>
      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
      >
        Trang sau
      </button>
    </div>
  );
}
