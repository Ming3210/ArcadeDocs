import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArcadeDocs - Trình soạn thảo & Canvas cộng tác thời gian thực",
  description: "Soạn thảo văn bản & bảng vẽ canvas cộng tác nhiều người dùng phong cách Retro với Next.js, Tiptap, Yjs và PartyKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Chặn Next.js Dev Overlay bắt lỗi do extension Bitdefender chèn thuộc tính lạ
                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var arg = arguments[i];
                      if (typeof arg === 'string' && (arg.indexOf('bis_skin_checked') !== -1 || arg.indexOf('bis_register') !== -1)) {
                        return;
                      }
                      if (typeof arg === 'string' && arg.indexOf('hydration-mismatch') !== -1) {
                        for (var j = 0; j < arguments.length; j++) {
                          if (String(arguments[j]).indexOf('bis_skin_checked') !== -1) return;
                        }
                      }
                    }
                    origError.apply(console, arguments);
                  };

                  // 2. Tự động xóa sạch thuộc tính bis_skin_checked ngay khi Bitdefender chèn vào DOM
                  try {
                    var observer = new MutationObserver(function(mutations) {
                      for (var k = 0; k < mutations.length; k++) {
                        var m = mutations[k];
                        if (m.type === 'attributes' && (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_register')) {
                          m.target.removeAttribute(m.attributeName);
                        }
                      }
                    });
                    observer.observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register']
                    });
                  } catch(e) {}
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
