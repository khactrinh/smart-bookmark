"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink, Hash, LayoutGrid, List } from "lucide-react";
import { Bookmark, Collection } from "@/types/bookmark";

export default function SharedCollectionPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [data, setData] = useState<{ collection: Collection; bookmarks: Bookmark[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await fetch(`/api/shared/${shareId}`);
        const result = await res.json();
        if (result.success) {
          setData({ collection: result.data, bookmarks: result.bookmarks });
        } else {
          setError(result.error || "Không tìm thấy bộ sưu tập này.");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) fetchSharedData();
  }, [shareId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loader2 className="animate-spin text-black mb-4" size={48} />
        <p className="text-gray-600 font-semibold text-lg animate-pulse">Đang tải bộ sưu tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-50">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Có lỗi xảy ra</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/" className="inline-block bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-all">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {data?.collection.name}
          </h1>
          {data?.collection.description && (
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {data.collection.description}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="px-3 py-1 bg-white border rounded-full text-xs font-semibold text-gray-400 shadow-sm">
              {data?.bookmarks.length} Bookmarks
            </span>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-gray-100 text-black shadow-inner" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-gray-100 text-black shadow-inner" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4 max-w-4xl mx-auto"
        }>
          {data?.bookmarks.map((bm) => (
            <a
              key={bm._id}
              href={bm.url}
              target="_blank"
              rel="noreferrer"
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full ${viewMode === "list" ? "md:flex-row md:h-32" : ""}`}
            >
              <div className={viewMode === "list" ? "md:w-48 h-32 shrink-0 overflow-hidden" : "w-full h-44 overflow-hidden"}>
                <img
                  src={`/api/image?url=${encodeURIComponent(bm.image || "")}`}
                  alt={bm.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/400/300?random=${bm._id}`;
                  }}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {bm.title || bm.url}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {bm.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {bm.category}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {data?.bookmarks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Bộ sưu tập này hiện chưa có liên kết nào.</p>
          </div>
        )}

        <footer className="mt-20 text-center border-t pt-8">
          <p className="text-gray-400 text-sm">
            Tạo bởi LinkHub - Công cụ quản lý bookmark thông minh
          </p>
        </footer>
      </div>
    </div>
  );
}
