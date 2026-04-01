"use client";
import { useState, useEffect } from "react";
import { X, Trash2, Edit2, Check, Plus, Share2, ExternalLink, Copy } from "lucide-react";
import { Collection } from "@/types/bookmark";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onViewCollection: (id: string) => void;
}

export default function ManageCollectionsModal({
  isOpen,
  onClose,
  onViewCollection,
}: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (data.success) setCollections(data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCollections();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    const data = await res.json();
    if (data.success) {
      setNewName("");
      setNewDesc("");
      fetchCollections();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xoá collection "${name}"? Các bookmark trong này sẽ không bị xoá, chỉ là không thuộc collection này nữa.`))
      return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    fetchCollections();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return setEditingId(null);
    await fetch(`/api/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    setEditingId(null);
    fetchCollections();
  };

  const copyShareLink = (shareId: string | undefined) => {
    if (!shareId) return;
    const link = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(link);
    alert("Đã sao chép link chia sẻ!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center border-b p-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📂 Quản lý Collections
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Form Thêm */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Tạo Collection mới</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tên collection (vd: Học tập, Công việc...)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-black/5 transition-all bg-white"
              />
              <textarea
                placeholder="Mô tả ngắn gọn (không bắt buộc)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-black/5 transition-all bg-white h-20 resize-none"
              />
              <button
                onClick={handleAdd}
                className="bg-black text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all font-medium"
              >
                <Plus size={18} /> Tạo Collection
              </button>
            </div>
          </div>

          {/* Danh sách */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Danh sách của bạn</h3>
            {loading ? (
              <div className="py-10 text-center text-gray-400">Đang tải...</div>
            ) : collections.length === 0 ? (
              <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed text-sm">
                Bạn chưa có collection nào. Hãy tạo một cái để bắt đầu phân loại!
              </div>
            ) : (
              collections.map((coll) => (
                <div
                  key={coll._id}
                  className="group flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:border-black/20 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      {editingId === coll._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border rounded-lg outline-none focus:border-black"
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full p-2 border rounded-lg outline-none focus:border-black h-16 resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" 
                              onClick={() => onViewCollection(coll._id)}>
                            {coll.name}
                          </h4>
                          {coll.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{coll.description}</p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {editingId === coll._id ? (
                        <button
                          onClick={() => handleUpdate(coll._id)}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 shadow-sm"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onViewCollection(coll._id)}
                            className="p-2 text-gray-500 hover:bg-black hover:text-white rounded-lg transition-all"
                            title="Xem chi tiết"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => copyShareLink(coll.shareId)}
                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                            title="Copy link chia sẻ"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(coll._id);
                              setEditName(coll.name);
                              setEditDesc(coll.description || "");
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(coll._id, coll.name)}
                            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-50 rounded-lg transition-colors"
                            title="Xoá"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
