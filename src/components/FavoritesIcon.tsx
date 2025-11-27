'use client'

import Link from 'next/link'
import { useFavorites } from '@/contexts/Favorites'

export default function FavoritesIcon() {
    const { favorites } = useFavorites()
    const favoritesCount = favorites.length

    return (
        <Link href="/favorites" className="navbar-item">
            <span className="icon">
                {favoritesCount > 0 ? '❤️' : '🤍'}
            </span>
            {favoritesCount > 0 && (
                <span className="tag is-danger is-rounded" style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    fontSize: '0.7rem',
                    minWidth: '1.5rem',
                    height: '1.5rem'
                }}>
                    {favoritesCount}
                </span>
            )}
        </Link>
    )
}