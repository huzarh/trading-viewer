import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: 'Profit Shelter +0.0040 (0.37%)',
  description: 'Profit Shelter virsion 1.0',
  generator: 'üzeyir.dev',
  icons:"fovicon.ico",
  keywords: ['Profit Shelter', 'Trading', 'Finance', 'Investment'],
  openGraph: {
    title: "Profit Shelter virsion 1.0", // Paylaşım başlığı
    description: "test version", // Kısa açıklama
    url: "https://www.ironfx.com/wp-content/uploads/2022/10/barcharts-blue-forex-market.jpg", // Web sitenizin URL'si
    siteName: "KzFlix", // Site adı
    images: [
      {
        url: "https://www.ironfx.com/wp-content/uploads/2022/10/barcharts-blue-forex-market.jpg", // Paylaşım için kullanılacak görsel URL'si
        width: 1200, // Görselin genişliği (ideal boyut: 1200x630)
        height: 630, // Görselin yüksekliği
        alt: "Profit Shelter virsion 1.0", // Görsel için alternatif metin
      },
    ],
    type: "website", // İçerik türü (örneğin: website, article, video vb.)
  },

  // Twitter Card Meta Verileri (Twitter için ekstra optimizasyon)
  twitter: {
    card: "summary_large_image", // Büyük görsel kart tipi
    title: "Profit Shelter virsion 1.0", // Twitter için başlık
    description: "Stream your favorite movies and TV series in HD quality",
    images: ["https://www.ironfx.com/wp-content/uploads/2022/10/barcharts-blue-forex-market.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/fovicon.ico" type="image/x-icon" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
