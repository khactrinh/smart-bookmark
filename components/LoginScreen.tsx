"use client";
import { LayoutGrid } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <LayoutGrid size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">LinkHub</h1>
        <p className="text-gray-500 mb-8">
          Lưu trữ và phân loại các liên kết yêu thích của bạn theo cách hiện đại
          nhất.
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-6 h-6"
            alt="Google"
          />
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}
