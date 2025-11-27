'use client'

import { useCart } from '@/contexts/Cart'

interface AddToCartButtonProps {
    productId: string
    className?: string
}

export default function AddToCartButton({ productId, className = '' }: AddToCartButtonProps) {
    const { addToCart, getItemQuantity, isInCart } = useCart()
    const currentQuantity = getItemQuantity(productId)
    const inCart = isInCart(productId)

    const handleAddToCart = () => {
        addToCart(productId, 1)
    }

    return (
        <button
            className={`button ${className} ${inCart ? 'is-success' : 'is-primary'}`}
            onClick={handleAddToCart}
        >
            {inCart ? `В корзине (${currentQuantity})` : 'В корзину'}
        </button>
    )
}