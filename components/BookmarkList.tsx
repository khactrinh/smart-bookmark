"use client";
import BookmarkCard from "./BookmarkCard";
import { Bookmark } from "@/types/bookmark";



type Props = {
  bookmarks: Bookmark[];
  viewMode: string;
  debouncedSearch: string;
  onDelete: (id: string) => void;
  onEdit: (bm: Bookmark) => void;
  onEditNote: (bm: Bookmark) => void;
};

export default function BookmarkList({ bookmarks, viewMode, debouncedSearch, onDelete, onEdit, onEditNote }: Props) {
  if (bookmarks.length === 0) {
    return (
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
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
      }
    >
      {bookmarks.map((bm) => (
        <BookmarkCard key={bm._id} bm={bm} viewMode={viewMode} onDelete={onDelete} onEdit={onEdit} onEditNote={onEditNote} />
      ))}
    </div>
  );
}
