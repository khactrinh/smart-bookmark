"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookmark: Bookmark | null;
};

export default function EditNoteModal({
  isOpen,
  onClose,
  onSuccess,
  bookmark,
}: Props) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bookmark) {
      setNote(bookmark.note || "");
    }
  }, [isOpen, bookmark]);

  if (!isOpen || !bookmark) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/bookmarks/${bookmark._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Đã cập nhật ghi chú");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            📝 Ghi chú cho Bookmark
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-800">{bookmark.title || bookmark.url}</h3>
            <p className="block text-sm font-semibold text-gray-700">Nội dung ghi chú</p>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black bg-gray-50/50 h-40 resize-none font-sans"
              placeholder="Nhập ghi chú của bạn về bookmark này..."
            />
          </div>

          <div className="sticky bottom-0 pt-4 bg-white border-t mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 p-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-black/10 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang lưu...
                </>
              ) : (
                "Lưu ghi chú"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
