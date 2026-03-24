// import axios from "axios";
// import * as cheerio from "cheerio";

// export async function fetchMetadata(url: string) {
//     try {
//         const controller = new AbortController();
//         const timeout = setTimeout(() => controller.abort(), 3000); // max 3s

//         // =========================
//         // 1. TRY SCRAPE (FAST + FREE)
//         // =========================
//         const { data } = await axios.get(url, {
//             headers: {
//                 "User-Agent":
//                     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
//             },
//             timeout: 8000,
//         });

//         // detect bị block
//         if (data.includes("Checking your browser")) {
//             throw new Error("Blocked by Cloudflare");
//         }

//         const $ = cheerio.load(data);

//         const title =
//             $('meta[property="og:title"]').attr("content") ||
//             $("title").text();

//         const description =
//             $('meta[property="og:description"]').attr("content") ||
//             $('meta[name="description"]').attr("content");

//         const image = $('meta[property="og:image"]').attr("content");

//         if (title && description) {
//             return {
//                 title: title.trim(),
//                 description: description.trim(),
//                 image: image || "",
//             };
//         }

//         throw new Error("Scrape thiếu data");
//     } catch (error: any) {
//         console.warn("Scrape failed → dùng Microlink:", error.message);

//         // =========================
//         // 2. FALLBACK → MICROLINK
//         // =========================
//         try {
//             const res = await axios.get("https://api.microlink.io", {
//                 params: {
//                     url,
//                 },
//                 timeout: 10000,
//             });

//             const data = res.data?.data;

//             return {
//                 title: data?.title || url,
//                 description:
//                     data?.description || "Không có mô tả cho trang này.",
//                 image: data?.image?.url || "",
//             };
//         } catch (apiError: any) {
//             console.error("Microlink failed:", apiError.message);

//             // =========================
//             // 3. FINAL FALLBACK
//             // =========================
//             return {
//                 title: url,
//                 description: "Không thể lấy mô tả tự động cho trang web này.",
//                 image: "",
//             };
//         }
//     }
// }

import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchMetadata(url: string) {
    let targetUrl = url;

    // 1. Tối ưu riêng cho YouTube để tránh trang chặn Cookie/Consent
    try {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const urlObj = new URL(url);
            urlObj.searchParams.set("ucbcb", "1");
            targetUrl = urlObj.toString();
        }
    } catch (e) {
        targetUrl = url;
    }

    try {
        // 2. TRY SCRAPE với cấu hình giả lập Bot mạng xã hội
        const { data } = await axios.get(targetUrl, {
            headers: {
                // Giả lập Facebook Bot giúp lấy Metadata của các trang SPA/SSR tốt hơn
                "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            timeout: 8000,
        });

        if (data.includes("Checking your browser") || data.includes("Cloudflare")) {
            throw new Error("Blocked by Anti-Bot");
        }

        const $ = cheerio.load(data);

        // Lấy tiêu đề từ nhiều nguồn (ưu tiên OG -> Twitter -> Title tag)
        const title =
            $('meta[property="og:title"]').attr("content") ||
            $('meta[name="twitter:title"]').attr("content") ||
            $('meta[name="title"]').attr("content") ||
            $("title").text();

        // Lấy mô tả
        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="twitter:description"]').attr("content") ||
            $('meta[name="description"]').attr("content");

        // Lấy ảnh
        let image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            $('link[rel="image_src"]').attr("href");

        // CHUẨN HÓA URL ẢNH (Quan trọng: Chuyển path tương đối /abc.jpg thành tuyệt đối)
        if (image && !image.startsWith("http")) {
            try {
                const urlObj = new URL(url);
                image = new URL(image, urlObj.origin).href;
            } catch (e) {
                image = "";
            }
        }

        if (title) {
            return {
                title: title.trim(),
                description: description?.trim() || "Không có mô tả cho trang này.",
                image: image || "",
            };
        }

        throw new Error("Dữ liệu trống");

    } catch (error: any) {
        console.warn(`Scrape [${url}] thất bại: ${error.message}. Chuyển sang Microlink...`);

        // 3. FALLBACK → MICROLINK (Xử lý các trang nặng JavaScript)
        try {
            const res = await axios.get("https://api.microlink.io", {
                params: { url },
                timeout: 10000,
            });

            const mlData = res.data?.data;
            return {
                title: mlData?.title || url,
                description: mlData?.description || "Không có mô tả.",
                image: mlData?.image?.url || mlData?.logo?.url || "",
            };
        } catch (apiError: any) {
            // 4. FINAL FALLBACK
            return {
                title: url,
                description: "Không thể tự động lấy thông tin từ liên kết này.",
                image: "",
            };
        }
    }
}