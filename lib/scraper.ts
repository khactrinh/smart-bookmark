import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchMetadata(url: string) {
    try {
        // =========================
        // 1. TRY SCRAPE (FAST + FREE)
        // =========================
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
            timeout: 8000,
        });

        // detect bị block
        if (data.includes("Checking your browser")) {
            throw new Error("Blocked by Cloudflare");
        }

        const $ = cheerio.load(data);

        const title =
            $('meta[property="og:title"]').attr("content") ||
            $("title").text();

        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="description"]').attr("content");

        const image = $('meta[property="og:image"]').attr("content");

        if (title && description) {
            return {
                title: title.trim(),
                description: description.trim(),
                image: image || "",
            };
        }

        throw new Error("Scrape thiếu data");
    } catch (error: any) {
        console.warn("Scrape failed → dùng Microlink:", error.message);

        // =========================
        // 2. FALLBACK → MICROLINK
        // =========================
        try {
            const res = await axios.get("https://api.microlink.io", {
                params: {
                    url,
                },
                timeout: 10000,
            });

            const data = res.data?.data;

            return {
                title: data?.title || url,
                description:
                    data?.description || "Không có mô tả cho trang này.",
                image: data?.image?.url || "",
            };
        } catch (apiError: any) {
            console.error("Microlink failed:", apiError.message);

            // =========================
            // 3. FINAL FALLBACK
            // =========================
            return {
                title: url,
                description: "Không thể lấy mô tả tự động cho trang web này.",
                image: "",
            };
        }
    }
}