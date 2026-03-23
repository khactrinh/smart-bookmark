"use client";
import { useState } from "react";
import { X, Trash2, Edit2, Check, Plus } from "lucide-react";

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  refreshData,
}: any) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    refreshData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Xoá chủ đề "${name}"? Các bookmark thuộc chủ đề này sẽ chuyển về "Uncategorized".`,
      )
    )
      return;
    await fetch(`/api/categories?id=${id}&name=${name}`, { method: "DELETE" });
    refreshData();
  };

  const handleUpdate = async (id: string, oldName: string) => {
    if (!editName.trim() || editName === oldName) return setEditingId(null);
    await fetch("/api/categories", {
      method: "PUT",
      body: JSON.stringify({ id, newName: editName, oldName }),
    });
    setEditingId(null);
    refreshData();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-5">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold">Quản lý Chủ đề</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Thêm */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Thêm chủ đề mới..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 p-2 border rounded-lg outline-none focus:border-black"
          />
          <button
            onClick={handleAdd}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Thêm
          </button>
        </div>

        {/* Danh sách */}
        <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
          {categories.map((cat: any) => (
            <div
              key={cat._id}
              className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg"
            >
              {editingId === cat._id ? (
                <input
                  autoFocus
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 p-1 mr-2 border rounded"
                />
              ) : (
                <span className="font-medium">{cat.name}</span>
              )}

              <div className="flex gap-2">
                {editingId === cat._id ? (
                  <button
                    onClick={() => handleUpdate(cat._id, cat.name)}
                    className="text-green-600 p-1"
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(cat._id);
                        setEditName(cat.name);
                      }}
                      className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              Chưa có chủ đề nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
