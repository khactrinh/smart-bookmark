"use client";
import { Trash2 } from "lucide-react"; // Import thêm icon
import { Bookmark } from "@/types/bookmark";


type Props = {
  bm: Bookmark;
  viewMode: string;
  onDelete: (id: string) => void;
};

export default function BookmarkCard({ bm, viewMode, onDelete }: Props) {
  return (
    <a
      href={bm.url}
      target="_blank"
      rel="noreferrer"
      className={`relative block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group
        ${viewMode === "list" ? "flex items-center h-32" : "flex flex-col"}`}
    >
      {/* NÚT XOÁ (Tuyệt đối không để onClick ảnh hưởng thẻ thẻ a) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(bm._id);
        }}
        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm z-10"
        title="Xoá Bookmark"
      >
        <Trash2 size={16} />
      </button>

      {/* --- PHẦN HÌNH ẢNH VÀ NỘI DUNG GIỮ NGUYÊN NHƯ CŨ --- */}
      <div
        className={
          viewMode === "list"
            ? "w-48 h-full shrink-0 overflow-hidden"
            : "w-full h-44 overflow-hidden"
        }
      >
        <img
          src={bm.image || "https://placehold.co/300x200?text=No+Image"}
          alt={bm.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
        />
      </div>
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
          {bm.tags?.map((tag: any) => (
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
  );
}
