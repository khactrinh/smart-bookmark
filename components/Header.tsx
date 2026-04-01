// "use client";
// import {
//   Search,
//   LogOut,
//   Plus,
//   Shuffle,
//   LayoutGrid,
//   List,
//   X,
//   Settings,
// } from "lucide-react";
// import { signOut } from "next-auth/react";

// export default function Header({
//   session,
//   searchQuery,
//   setSearchQuery,
//   category,
//   setCategory,
//   isRandom,
//   setIsRandom,
//   viewMode,
//   setViewMode,
//   setIsModalOpen,
//   setPage,
//   onOpenManageCat,
//   categoriesList,
// }: any) {
//   return (
//     <header className="max-w-6xl mx-auto mb-8 flex flex-col gap-6">
//       {/* Hàng 1: Tiêu đề + Profile + Tìm kiếm (Giữ nguyên) */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-4">

//         {/* LEFT: TITLE */}
//         <h1 className="text-3xl font-bold text-gray-800 shrink-0">
//           LinkHub
//         </h1>

//         {/* RIGHT: SEARCH + USER */}
//         <div className="flex items-center gap-3 w-full md:max-w-md flex-1 md:justify-end">

//           {/* SEARCH */}
//           <div className="relative w-full">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search size={18} className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search links..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm bg-white"
//             />
//             {searchQuery && (
//               <button
//                 onClick={() => setSearchQuery("")}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//               >
//                 <X size={16} />
//               </button>
//             )}
//           </div>

//           {/* USER */}
//           <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-full border shadow-sm">
//             <img
//               src={session.user.image}
//               alt="Avatar"
//               className="w-8 h-8 rounded-full border border-gray-200"
//             />
//             <button
//               onClick={() => signOut()}
//               className="text-gray-500 hover:text-red-500 p-1 rounded-full transition-colors"
//               title="Logout"
//             >
//               <LogOut size={16} />
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* Hàng 2: Toolbar */}
//       <div className="flex justify-between items-center flex-wrap gap-3">
//         {/* NHÓM NÚT THÊM VÀ QUẢN LÝ CẠNH NHAU */}
//         <div className="flex gap-2">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all font-medium text-sm"
//           >
//             <Plus size={18} /> Thêm Link
//           </button>

//           <button
//             onClick={onOpenManageCat} // Gọi hàm truyền từ page.tsx
//             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium text-sm"
//           >
//             <Settings size={18} /> Quản lý Chủ đề
//           </button>
//         </div>

//         <div className="flex gap-3 items-center flex-wrap ml-auto">
//           <select
//             value={category}
//             onChange={(e) => {
//               setCategory(e.target.value);
//               setPage(1);
//             }}
//             className="p-2 border rounded-md shadow-sm outline-none bg-white text-sm"
//           >
//             <option value="">Tất cả chủ đề</option>
//             {categoriesList?.map((cat: any) => (
//               <option key={cat._id} value={cat.name}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={() => setIsRandom(!isRandom)}
//             className={`p-2 rounded-md transition-all ${isRandom ? "bg-purple-600 text-white shadow-md" : "bg-white border shadow-sm hover:bg-gray-100"}`}
//             title="Hiển thị ngẫu nhiên"
//           >
//             <Shuffle size={18} />
//           </button>

//           <div className="flex bg-gray-200 rounded-md p-1">
//             <button
//               onClick={() => setViewMode("grid")}
//               className={`p-1 rounded ${viewMode === "grid" ? "bg-white shadow text-black" : "text-gray-500"}`}
//             >
//               <LayoutGrid size={18} />
//             </button>
//             <button
//               onClick={() => setViewMode("list")}
//               className={`p-1 rounded ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-500"}`}
//             >
//               <List size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

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
  Folder,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

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
  onOpenManageCollections,
  categoriesList,
}: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close dropdown khi click ra ngoài
  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    if (isMenuOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [isMenuOpen]);

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* LEFT: Logo */}
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          🚀 LinkHub
        </h1>

        {/* CENTER: Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">

          {/* Add */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-all"
          >
            <Plus size={16} />
            Add
          </button>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-2 py-2 border rounded-md bg-white text-sm"
          >
            <option value="">All</option>
            {categoriesList?.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Random */}
          <button
            onClick={() => setIsRandom(!isRandom)}
            className={`p-2 rounded-md ${isRandom
              ? "bg-purple-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            <Shuffle size={16} />
          </button>

          {/* View mode */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-white shadow" : ""
                }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${viewMode === "list" ? "bg-white shadow" : ""
                }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={onOpenManageCat}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            title="Quản lý Chủ đề"
          >
            <Settings size={16} />
          </button>

          {/* Collections */}
          <button
            onClick={onOpenManageCollections}
            className="p-2 rounded-md bg-gray-100 hover:bg-green-100 text-green-700 hover:text-green-800"
            title="Quản lý Collections"
          >
            <Folder size={16} />
          </button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="cursor-pointer"
            >
              <img
                src={session.user.image}
                className="w-9 h-9 rounded-full border"
              />
            </div>

            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}