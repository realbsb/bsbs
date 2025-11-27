'use client'

import { useCart } from '@/contexts/Cart'
import { dataService } from '@/lib/dataService'
import { ImageService } from '@/lib/imageService'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart()
    const products = dataService.getProducts()
    const prices = dataService.getPrices()
    const actionPrices = dataService.getActionPrices()

    // Получаем полную информацию о товарах в корзине
    const cartItems = items.map(item => {
        const product = products.find(p => p.id === item.productId)
        if (!product) return null

        const price = actionPrices[product.id] || prices[product.id] || 0
        const totalPrice = price * item.quantity
        const images = ImageService.getProductImages(product)

        return {
            ...item,
            product,
            price,
            totalPrice,
            image: images[0] || '/img/product-default.webp'
        }
    }).filter(Boolean)

    const subtotal = cartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0)

    if (items.length === 0) {
        return (
            <div className="container">
                <h1 className="title">Корзина</h1>
                <div className="notification is-info">
                    <p>Ваша корзина пуста</p>
                    <Link href="/" className="button is-primary mt-3">
                        Начать покупки
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <h1 className="title">Корзина</h1>

            <div className="columns">
                <div className="column is-two-thirds">
                    {cartItems.map(item => {
                        if (!item) return null

                        return (
                            <div key={item.productId} className="card mb-4">
                                <div className="card-content">
                                    <div className="media">
                                        <div className="media-left">
                                            <figure className="image is-64x64">
                                                <Image
                                                    src={item.image}
                                                    alt={item.product.title}
                                                    width={64}
                                                    height={64}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </figure>
                                        </div>
                                        <div className="media-content">
                                            <p className="title is-5">{item.product.title}</p>
                                            <p className="subtitle is-6">{item.product.desc}</p>
                                        </div>
                                        <div className="media-right">
                                            <button
                                                className="delete"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    <div className="content">
                                        <div className="field is-grouped is-grouped-centered">
                                            <div className="control">
                                                <button
                                                    className="button is-small"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                            </div>
                                            <div className="control">
                                                <span className="px-3">{item.quantity} шт.</span>
                                            </div>
                                            <div className="control">
                                                <button
                                                    className="button is-small"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="has-text-centered">
                                            <strong>{item.totalPrice} руб.</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <div className="field is-grouped">
                        <div className="control">
                            <button
                                className="button is-danger is-light"
                                onClick={clearCart}
                            >
                                Очистить корзину
                            </button>
                        </div>
                        <div className="control">
                            <Link href="/" className="button is-light">
                                Продолжить покупки
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="column is-one-third">
                    <div className="box">
                        <h3 className="title is-5">Итого</h3>
                        <div className="content">
                            <p>Товаров: {getTotalItems()} шт.</p>
                            <p>Сумма: <strong>{subtotal} руб.</strong></p>
                        </div>

                        <div className="field">
                            <button className="button is-success is-fullwidth is-large">
                                Оформить заказ
                            </button>
                        </div>

                        <div className="content is-small">
                            <p>Доставка рассчитывается при оформлении заказа</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}