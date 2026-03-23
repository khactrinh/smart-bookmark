import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchMetadata(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' } // Fake trình duyệt để tránh bị block
        });
        const $ = cheerio.load(data);

        // Ưu tiên lấy từ thẻ Open Graph (Youtube hỗ trợ rất tốt)
        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');

        return { title, description, image };
    } catch (error) {
        console.error("Lỗi khi fetch metadata:", error);
        return { title: url, description: '', image: '' };
    }
}