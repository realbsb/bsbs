'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FavoritesContextType } from '@/types/favorites'

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

interface FavoritesProviderProps {
    children: ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
    const [favorites, setFavorites] = useState<string[]>(() => {
        // Инициализация состояния через функцию
        if (typeof window !== 'undefined') {
            const savedFavorites = localStorage.getItem('favorites')
            if (savedFavorites) {
                try {
                    return JSON.parse(savedFavorites)
                } catch (error) {
                    console.error('Error loading favorites from localStorage:', error)
                }
            }
        }
        return []
    })

    // Только сохранение в localStorage при изменении favorites
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }, [favorites])

    const addToFavorites = (productId: string) => {
        setFavorites(prev => {
            if (prev.includes(productId)) return prev
            return [...prev, productId]
        })
    }

    const removeFromFavorites = (productId: string) => {
        setFavorites(prev => prev.filter(id => id !== productId))
    }

    const toggleFavorite = (productId: string) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const isFavorite = (productId: string) => {
        return favorites.includes(productId)
    }

    const clearFavorites = () => {
        setFavorites([])
    }

    const value: FavoritesContextType = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
    }

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}