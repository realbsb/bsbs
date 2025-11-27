import './globals.scss'
import Link from 'next/link'
import { CartProvider } from '@/contexts/Cart'
import { FavoritesProvider } from '@/contexts/Favorites'
import CartIcon from '@/components/CartIcon'
import FavoritesIcon from '@/components/FavoritesIcon'

export const metadata = {
  title: 'Интернет-магазин на Next.js',
  description: 'SSG магазин с PWA и Markdown контентом',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <FavoritesProvider>
            <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
              <div className="navbar-brand">
                <Link className="navbar-item" href="/">
                  <strong>Магазин</strong>
                </Link>
              </div>
              <div className="navbar-menu">
                <div className="navbar-end">
                  <div className="navbar-item">
                    <FavoritesIcon />
                  </div>
                  <div className="navbar-item">
                    <CartIcon />
                  </div>
                </div>
              </div>
            </nav>
            <main className="container">
              {children}
            </main>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  )
}