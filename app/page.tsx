"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Shuffle,
  Plus,
  X,
  Loader2,
  Search,
} from "lucide-react"; // Thêm icon Search

export default function BookmarkApp() {
  const [bookmarks, setBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [isRandom, setIsRandom] = useState(false);
  const [category, setCategory] = useState("");

  // --- State cho Tìm kiếm ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- State cho form thêm Bookmark ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kỹ thuật Debounce cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset về trang 1 khi có từ khóa mới
    }, 500); // Đợi 500ms sau khi người dùng dừng gõ

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Lấy danh sách bookmark
  const fetchBookmarks = async () => {
    let url = `/api/bookmarks?page=${page}&limit=12`;
    if (category) url += `&category=${category}`;
    if (isRandom) url += `&random=true`;
    if (debouncedSearch)
      url += `&search=${encodeURIComponent(debouncedSearch)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setBookmarks(data.data);
  };

  useEffect(() => {
    fetchBookmarks();
  }, [page, isRandom, category, debouncedSearch]); // Thêm debouncedSearch vào dependency

  // Hàm xử lý khi submit form
  const handleAddBookmark = async (e) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsSubmitting(true);

    const tagsArray = newTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl,
          category: newCategory || "Uncategorized",
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewUrl("");
        setNewCategory("");
        setNewTags("");
        setIsModalOpen(false);
        fetchBookmarks();
      } else {
        alert("Có lỗi xảy ra: " + data.error);
      }
    } catch (error) {
      console.error("Lỗi khi thêm bookmark:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 shrink-0">
            My Bookmarks
          </h1>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full md:max-w-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mô tả, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Thanh công cụ: Nút Thêm, Bộ Lọc, View Mode */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all font-medium text-sm"
          >
            <Plus size={18} /> Thêm Link
          </button>

          <div className="flex gap-3 items-center flex-wrap ml-auto">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="p-2 border rounded-md shadow-sm outline-none bg-white text-sm"
            >
              <option value="">Tất cả chủ đề</option>
              <option value="Học tập">Học tập</option>
              <option value="Giải trí">Giải trí</option>
              <option value="Công việc">Công việc</option>
            </select>

            <button
              onClick={() => setIsRandom(!isRandom)}
              className={`p-2 rounded-md transition-all ${isRandom ? "bg-purple-600 text-white shadow-md" : "bg-white border shadow-sm hover:bg-gray-100"}`}
              title="Hiển thị ngẫu nhiên"
            >
              <Shuffle size={18} />
            </button>

            <div className="flex bg-gray-200 rounded-md p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded ${viewMode === "grid" ? "bg-white shadow text-black" : "text-gray-500"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-500"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hiển thị danh sách Bookmark */}
      <main className="max-w-6xl mx-auto">
        {bookmarks.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white border border-dashed border-gray-300 rounded-2xl">
            {debouncedSearch ? (
              <p className="text-gray-500">
                Không tìm thấy kết quả nào cho "{debouncedSearch}"
              </p>
            ) : (
              <p className="text-gray-500">
                Chưa có bookmark nào. Hãy bắt đầu thêm link mới!
              </p>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {bookmarks.map((bm) => (
              <a
                key={bm._id}
                href={bm.url}
                target="_blank"
                rel="noreferrer"
                className={`block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group
                  ${viewMode === "list" ? "flex items-center h-32" : "flex flex-col"}`}
              >
                {/* Ảnh Thumbnail */}
                <div
                  className={
                    viewMode === "list"
                      ? "w-48 h-full shrink-0 overflow-hidden"
                      : "w-full h-44 overflow-hidden"
                  }
                >
                  <img
                    src={
                      bm.image ||
                      "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={bm.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                  />
                </div>

                {/* Nội dung Card */}
                <div className="p-4 flex flex-col justify-between flex-1 h-full">
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {bm.title || bm.url}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {bm.description}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap items-center">
                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                      {bm.category}
                    </span>
                    {bm.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {!isRandom && bookmarks.length > 0 && (
          <div className="flex justify-center mt-12 gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Trang trước
            </button>
            <span className="py-2 text-sm font-medium text-gray-600 bg-white px-4 border rounded-lg">
              Trang {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Trang sau
            </button>
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">Thêm Bookmark</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-100 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddBookmark}
              className="p-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL*
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/..."
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề
                </label>
                <input
                  type="text"
                  placeholder="Học tập, Giải trí..."
                  list="category-suggestions"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <datalist id="category-suggestions">
                  <option value="Học tập" />
                  <option value="Giải trí" />
                  <option value="Công việc" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thẻ Tags (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="react, nextjs, design"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Đang lấy
                    thông tin...
                  </>
                ) : (
                  "Lưu Bookmark"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
