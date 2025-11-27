'use client'

import { useFavorites } from '@/contexts/Favorites'

interface FavoriteButtonProps {
    productId: string
    className?: string
    size?: 'small' | 'normal' | 'large'
}

export default function FavoriteButton({
    productId,
    className = '',
    size = 'normal'
}: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const isFav = isFavorite(productId)

    const sizeClasses = {
        small: 'is-small',
        normal: '',
        large: 'is-large'
    }

    return (
        <button
            className={`button ${className} ${sizeClasses[size]} ${isFav ? 'is-danger is-light' : 'is-light'
                }`}
            onClick={() => toggleFavorite(productId)}
            aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
            <span className="icon">
                {isFav ? '❤️' : '🤍'}
            </span>
        </button>
    )
}