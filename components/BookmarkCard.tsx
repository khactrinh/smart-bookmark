"use client";
import { Trash2, Pencil } from "lucide-react"; // Import thêm icon
import { Bookmark } from "@/types/bookmark";
import { DeleteConfirm } from "@/components/DeleteConfirm";

type Props = {
  bm: Bookmark;
  viewMode: string;
  onDelete: (id: string) => void;
  onEdit: (bm: Bookmark) => void;
};

export default function BookmarkCard({ bm, viewMode, onDelete, onEdit }: Props) {
  const actionBtn =
    "p-2 bg-white/90 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-105 flex items-center justify-center";
  return (
    <a
      href={bm.url}
      target="_blank"
      rel="noreferrer"
      className={`relative block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group
        ${viewMode === "list" ? "flex items-center h-32" : "flex flex-col"}`}
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        {/* EDIT */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(bm);
          }}
          className={`${actionBtn} text-gray-600 hover:bg-gray-100 hover:text-black`}
          title="Sửa Bookmark"
        >
          <Pencil size={16} />
        </button>

        {/* DELETE */}
        <div onClick={(e) => e.preventDefault()}>
          <DeleteConfirm
            onConfirm={() => onDelete(bm._id)}
            triggerClass={`${actionBtn} text-red-500 hover:bg-red-100 hover:text-red-600`}
          />
        </div>
      </div>



      {/* --- PHẦN HÌNH ẢNH VÀ NỘI DUNG GIỮ NGUYÊN NHƯ CŨ --- */}
      <div
        className={
          viewMode === "list"
            ? "w-48 h-full shrink-0 overflow-hidden"
            : "w-full h-44 overflow-hidden"
        }
      >
        <img
          src={`/api/image?url=${encodeURIComponent(bm.image || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`)}`}

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
