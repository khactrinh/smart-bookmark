"use client";
import {
  Search,
  LogOut,
  Plus,
  Shuffle,
  LayoutGrid,
  List,
  X,
  Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Header({
  session,
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  isRandom,
  setIsRandom,
  viewMode,
  setViewMode,
  setIsModalOpen,
  setPage,
  onOpenManageCat,
  categoriesList,
}: any) {
  return (
    <header className="max-w-6xl mx-auto mb-8 flex flex-col gap-6">
      {/* Hàng 1: Tiêu đề + Profile + Tìm kiếm (Giữ nguyên) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-3xl font-bold text-gray-800">My Bookmarks</h1>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border shadow-sm">
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-gray-200"
            />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-red-500 p-1 bg-gray-100 rounded-full transition-colors ml-1"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

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

      {/* Hàng 2: Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        {/* NHÓM NÚT THÊM VÀ QUẢN LÝ CẠNH NHAU */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all font-medium text-sm"
          >
            <Plus size={18} /> Thêm Link
          </button>

          <button
            onClick={onOpenManageCat} // Gọi hàm truyền từ page.tsx
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <Settings size={18} /> Quản lý Chủ đề
          </button>
        </div>

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
            {categoriesList?.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
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
  );
}
