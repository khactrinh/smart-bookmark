"use client";
import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, Check } from "lucide-react";
import { Collection } from "@/types/bookmark";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriesList: any[];
  editingBookmark?: any;
};

export default function AddBookmarkModal({
  isOpen,
  onClose,
  onSuccess,
  categoriesList,
  editingBookmark,
}: Props) {
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const isEditMode = !!editingBookmark;

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (data.success) setCollections(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      if (!editingBookmark) {
        setNewUrl("");
        setCustomTitle("");
        setCustomDescription("");
        setNewCategory("");
        setNewTags("");
        setSelectedCollections([]);
      } else {
        setNewUrl(editingBookmark.url || "");
        setCustomTitle(editingBookmark.title || "");
        setCustomDescription(editingBookmark.description || "");
        setNewCategory(editingBookmark.category || "");
        setNewTags(editingBookmark.tags?.join(", ") || "");
        setSelectedCollections(editingBookmark.collectionIds || []);
      }
    }
  }, [isOpen, editingBookmark]);

  useEffect(() => {
    if (editingBookmark) return;
    if (!newUrl || !newUrl.startsWith("http") || newUrl.length < 10) return;

    const timer = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const res = await fetch("/api/preview", {
          method: "POST",
          body: JSON.stringify({ url: newUrl }),
        });
        const data = await res.json();
        if (data.success) {
          setCustomTitle(data.data.title || "");
          setCustomDescription(data.data.description || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPreviewLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [newUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsSubmitting(true);
    const tagsArray = newTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    try {
      const endpoint = isEditMode
        ? `/api/bookmarks/${editingBookmark._id}`
        : "/api/bookmarks";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl,
          category: newCategory || "Uncategorized",
          tags: tagsArray,
          title: customTitle,
          description: customDescription,
          collectionIds: selectedCollections,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEditMode ? "Đã cập nhật bookmark" : "Đã thêm bookmark mới");
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

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {isEditMode ? "🖋️ Chỉnh sửa Bookmark" : "✨ Thêm Bookmark"}
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
            <label className="block text-sm font-semibold text-gray-700">Link URL*</label>
            <input
              type="url"
              disabled={isEditMode}
              required
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all bg-gray-50/50"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Tiêu đề</label>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black bg-gray-50/50"
                placeholder="Tiêu đề trang..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Chủ đề</label>
              <input
                type="text"
                placeholder="Chọn hoặc gõ mới..."
                list="category-suggestions"
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black bg-gray-50/50"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <datalist id="category-suggestions">
                {categoriesList?.map((cat: any) => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black bg-gray-50/50 h-24 resize-none"
              placeholder="Ghi chú thêm về bookmark này..."
            />
            {previewLoading && (
              <p className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                <Loader2 size={12} className="animate-spin" /> Đang lấy thông tin tự động...
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Tags (cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              placeholder="react, tutorial, architecture"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black bg-gray-50/50"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Thêm vào Collections</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {collections.map((coll) => (
                <div
                  key={coll._id}
                  onClick={() => toggleCollection(coll._id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedCollections.includes(coll._id)
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedCollections.includes(coll._id) ? "bg-white border-white" : "bg-white border-gray-300"
                  }`}>
                    {selectedCollections.includes(coll._id) && <Check size={12} className="text-black" />}
                  </div>
                  <span className="text-xs font-medium truncate">{coll.name}</span>
                </div>
              ))}
              {collections.length === 0 && (
                <p className="col-span-2 text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                  Chưa có collection nào. Tạo mới ở trang chính!
                </p>
              )}
            </div>
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
                  <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                isEditMode ? "Cập nhật Bookmark" : "Lưu Bookmark"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
