import { Providers } from "./Providers";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
