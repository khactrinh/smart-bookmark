import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchMetadata(url) {
    try {
        // 1. Fake User-Agent giống trình duyệt thật để không bị các website chặn
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000 // Chờ tối đa 10s để tránh làm treo ứng dụng
        });

        const $ = cheerio.load(data);

        // 2. LẤY TIÊU ĐỀ (Theo thứ tự ưu tiên: og:title -> twitter:title -> <title> -> <h1>)
        const title =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            $('h1').first().text() ||
            url; // Nếu không lấy được gì thì lấy chính url

        // 3. LẤY MÔ TẢ (Theo thứ tự: og:desc -> description -> twitter:desc -> đoạn văn <p> đầu tiên)
        let description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('p').first().text() ||
            '';

        // Cắt ngắn description nếu nó quá dài (VD: lấy từ thẻ p)
        if (description.length > 250) {
            description = description.substring(0, 250) + '...';
        }

        // 4. LẤY HÌNH ẢNH (og:image -> twitter:image -> logo/favicon)
        let image =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            $('link[rel="icon"]').attr('href') ||
            '';

        // Xử lý lỗi ảnh bị lỗi đường dẫn tương đối (Ví dụ web trả về: /images/logo.png thay vì https://domain.com/images/logo.png)
        if (image && !image.startsWith('http')) {
            const urlObj = new URL(url);
            image = `${urlObj.protocol}//${urlObj.host}${image.startsWith('/') ? '' : '/'}${image}`;
        }

        return {
            title: title.trim(),
            description: description.trim(),
            image: image.trim()
        };
    } catch (error) {
        console.error("Lỗi khi fetch metadata từ url:", url, "Chi tiết:", error.message);

        // Vẫn trả về url để không làm chết app nếu link đó cấm bot cào dữ liệu
        return {
            title: url,
            description: 'Không thể lấy mô tả tự động cho trang web này.',
            image: ''
        };
    }
}