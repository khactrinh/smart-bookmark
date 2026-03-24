"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriesList: any[];
  editingBookmark?: any; // 👈 thêm
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

  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const isEditMode = !!editingBookmark;

  useEffect(() => {
    //if (!isOpen) return;

    if (!editingBookmark) {
      // 👉 ADD MODE → reset sạch
      setNewUrl("");
      setCustomTitle("");
      setCustomDescription("");
      setNewCategory("");
      setNewTags("");
    } else {
      // 👉 EDIT MODE → fill data
      setNewUrl(editingBookmark.url || "");
      setCustomTitle(editingBookmark.title || "");
      setCustomDescription(editingBookmark.description || "");
      setNewCategory(editingBookmark.category || "");
      setNewTags(editingBookmark.tags?.join(", ") || "");
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
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNewUrl("");
        setNewCategory("");
        setNewTags("");
        onSuccess(); // Báo cho Component cha refresh danh sách
        onClose(); // Đóng modal
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">{isEditMode ? "Chỉnh sửa Bookmark" : "Thêm Bookmark"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL*
            </label>
            <input
              type="url"
              disabled={isEditMode}
              required
              placeholder="https://youtube.com/..."
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 transition-all"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {previewLoading && (
            <p className="text-xs text-gray-400">Đang lấy preview...</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chủ đề
            </label>
            <input
              type="text"
              placeholder="Gõ hoặc chọn chủ đề..."
              list="category-suggestions"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 transition-all"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <datalist id="category-suggestions">
              {/* RENDER GỢI Ý CHỦ ĐỀ TỪ DATABASE */}
              {categoriesList?.map((cat: any) => (
                <option key={cat._id} value={cat.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thẻ Tags (cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="react, nextjs, design"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 transition-all"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang lấy thông
                tin...
              </>
            ) : (
              isEditMode ? "Cập nhật" : "Lưu Bookmark"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
