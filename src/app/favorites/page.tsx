'use client'

import { useFavorites } from '@/contexts/Favorites'
import { dataService } from '@/lib/dataService'
import { ImageService } from '@/lib/imageService'
import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCartButton from '@/components/AddToCartButton'

export default function FavoritesPage() {
    const { favorites, clearFavorites } = useFavorites()
    const products = dataService.getProducts()

    const favoriteProducts = products.filter(product =>
        favorites.includes(product.id)
    )

    if (favorites.length === 0) {
        return (
            <div className="container">
                <h1 className="title">Избранное</h1>
                <div className="notification is-info">
                    <p>В избранном пока нет товаров</p>
                    <Link href="/" className="button is-primary mt-3">
                        Начать покупки
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="level">
                <div className="level-left">
                    <h1 className="title">Избранное</h1>
                </div>
                <div className="level-right">
                    <button
                        className="button is-danger is-light"
                        onClick={clearFavorites}
                    >
                        Очистить избранное
                    </button>
                </div>
            </div>

            <div className="columns is-multiline">
                {favoriteProducts.map(product => {
                    const thumbnails = ImageService.getProductThumbnails(product)

                    return (
                        <div key={product.id} className="column is-one-third">
                            <div className="card">
                                <div className="card-image">
                                    <div className="card-image-header">
                                        <FavoriteButton
                                            productId={product.id}
                                            className="is-pulled-right m-2"
                                            size="small"
                                        />
                                    </div>
                                    {thumbnails.length > 0 && (
                                        <figure className="image is-4by3">
                                            <Image
                                                src={thumbnails[0]}
                                                alt={product.title}
                                                width={400}
                                                height={300}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </figure>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3 className="title is-5">{product.title}</h3>
                                    {product.badge && (
                                        <span className="tag is-primary">{product.badge}</span>
                                    )}
                                    <p className="subtitle is-6">{product.desc}</p>
                                    <div className="buttons">
                                        <Link
                                            href={`/${product.categories[0]}/${product.slug}`}
                                            className="button is-primary is-outlined"
                                        >
                                            Подробнее
                                        </Link>
                                        <AddToCartButton
                                            productId={product.id}
                                            className="is-small"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}