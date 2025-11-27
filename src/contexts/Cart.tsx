'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, CartContextType } from '@/types/cart'

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
    children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Инициализация состояния через функцию, а не useEffect
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart')
            if (savedCart) {
                try {
                    return JSON.parse(savedCart)
                } catch (error) {
                    console.error('Error loading cart from localStorage:', error)
                }
            }
        }
        return []
    })

    // Только сохранение в localStorage при изменении items
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (productId: string, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === productId)

            if (existingItem) {
                return prevItems.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + quantity, addedAt: Date.now() }
                        : item
                )
            } else {
                return [...prevItems, { productId, quantity, addedAt: Date.now() }]
            }
        })
    }

    const removeFromCart = (productId: string) => {
        setItems(prevItems => prevItems.filter(item => item.productId !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId
                    ? { ...item, quantity, addedAt: Date.now() }
                    : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0)
    }

    const getItemQuantity = (productId: string) => {
        const item = items.find(item => item.productId === productId)
        return item ? item.quantity : 0
    }

    const isInCart = (productId: string) => {
        return items.some(item => item.productId === productId)
    }

    const value: CartContextType = {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getItemQuantity,
        isInCart,
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}