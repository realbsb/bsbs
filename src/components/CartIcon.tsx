'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/Cart'

export default function CartIcon() {
    const { getTotalItems } = useCart()
    const totalItems = getTotalItems()

    return (
        <Link href="/cart" className="navbar-item">
            <span className="icon">
                <i>🛒</i>
            </span>
            {totalItems > 0 && (
                <span className="tag is-primary is-rounded" style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    fontSize: '0.7rem',
                    minWidth: '1.5rem',
                    height: '1.5rem'
                }}>
                    {totalItems}
                </span>
            )}
        </Link>
    )
}