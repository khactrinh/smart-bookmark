"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import các Component con
import LoginScreen from "@/components/LoginScreen";
import Header from "@/components/Header";
import BookmarkList from "@/components/BookmarkList";
import Pagination from "@/components/Pagination";
import AddBookmarkModal from "@/components/AddBookmarkModal";
import ManageCategoriesModal from "@/components/ManageCategoriesModal";
import ManageCollectionsModal from "@/components/ManageCollectionsModal";
import EditNoteModal from "@/components/EditNoteModal";
import { Bookmark } from "@/types/bookmark";
import ConfirmModal from "@/components/ConfirmModal";

export default function BookmarkApp() {
  const { data: session, status } = useSession();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRandom, setIsRandom] = useState(false);
  const [category, setCategory] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);
  const [isManageCollOpen, setIsManageCollOpen] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingNoteBookmark, setEditingNoteBookmark] = useState<Bookmark | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  //const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  //const [editingBookmark, setEditingBookmark] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);



  // Kỹ thuật Debounce cho Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    if (!session) return;
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setCategoriesList(data.data);
  };

  const fetchBookmarks = async () => {
    if (!session) return;

    let url = `/api/bookmarks?page=${page}&limit=12`;
    if (category) url += `&category=${category}`;
    if (collectionId) url += `&collectionId=${collectionId}`;
    if (isRandom) url += `&random=true`;
    if (debouncedSearch)
      url += `&search=${encodeURIComponent(debouncedSearch)}`;

    try {
      setIsLoadingData(true);
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setBookmarks(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error("Lỗi từ backend:", data.error);
      }
    } catch (error) {
      console.error("Lỗi fetch API:", error);
    } finally {
      setIsLoadingData(false);
    }
  };



  const handleDeleteBookmark = async (id: string) => {
    console.log("CALL DELETE API", id);

    await fetch(`/api/bookmarks/${id}`, {
      method: "DELETE",
    });

    fetchBookmarks();
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`/api/bookmarks/${selectedId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá bookmark thành công");
        fetchBookmarks();
      } else {
        toast.error("Không thể xoá bookmark");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
      console.error(err);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [page, isRandom, category, collectionId, debouncedSearch, session]);

  useEffect(() => {
    fetchCategories();
  }, [session]);



  // Xử lý các trạng thái đăng nhập
  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loader2 className="animate-spin text-black mb-4" size={48} />
        <p className="text-gray-600 font-semibold text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  // Giao diện chính sau khi đăng nhập thành công
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans relative">
      {isLoadingData && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all duration-300">
          <Loader2 className="animate-spin text-black mb-4" size={48} />
          <p className="text-gray-700 font-semibold text-lg animate-pulse">Đang đồng bộ bookmarks...</p>
        </div>
      )}
      {/* 1. Thanh công cụ và Header */}
      <Header
        session={session}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={(cat: string) => { setCategory(cat); setCollectionId(null); }}
        isRandom={isRandom}
        setIsRandom={setIsRandom}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsModalOpen={setIsModalOpen}
        setPage={setPage}
        onOpenManageCat={() => setIsManageCatOpen(true)}
        onOpenManageCollections={() => setIsManageCollOpen(true)}
        onReset={() => {
          setCollectionId(null);
          setCategory("");
          setSearchQuery("");
          setPage(1);
        }}
        categoriesList={categoriesList}
      />

      {/* 2. Nội dung chính: Danh sách Bookmark */}
      <main className="max-w-6xl mx-auto">
        {collectionId && (
          <div className="mb-6 flex items-center justify-between bg-green-50 text-green-800 px-4 py-3 rounded-lg border border-green-200">
            <span className="font-medium">Đang xem các bookmark trong Collection</span>
            <button
              onClick={() => { setCollectionId(null); setPage(1); }}
              className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50"
            >
              Xem tất cả
            </button>
          </div>
        )}

        <BookmarkList
          bookmarks={bookmarks}
          viewMode={viewMode}
          debouncedSearch={debouncedSearch}
          onDelete={handleDeleteBookmark}
          onEdit={(bm) => {
            setEditingBookmark(bm);
            setIsModalOpen(true);
          }}
          onEditNote={(bm) => {
            setEditingNoteBookmark(bm);
            setIsNoteModalOpen(true);
          }}
        />

        {/* 3. Phân trang (Ẩn khi random hoặc không có dữ liệu) */}
        {!isRandom && bookmarks.length > 0 && (
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        )}
      </main>

      {/* 4. Modal thêm Bookmark (Chỉ hiển thị khi isOpen = true) */}
      <AddBookmarkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBookmark(null);
        }}
        onSuccess={fetchBookmarks}
        categoriesList={categoriesList}
        editingBookmark={editingBookmark}
      />



      <ManageCategoriesModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        categories={categoriesList}
        refreshData={() => {
          fetchCategories();
          fetchBookmarks();
        }}
      />

      <ManageCollectionsModal
        isOpen={isManageCollOpen}
        onClose={() => setIsManageCollOpen(false)}
        onViewCollection={(id: string) => {
           setCollectionId(id);
           setIsManageCollOpen(false);
           setCategory("");
           setPage(1);
        }}
      />




      <EditNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNoteBookmark(null);
        }}
        onSuccess={fetchBookmarks}
        bookmark={editingNoteBookmark}
      />

    </div>
  );
}
