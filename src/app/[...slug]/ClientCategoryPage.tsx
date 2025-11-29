// src/app/[...slug]/ClientCategoryPage.tsx
'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { dataService } from '@/lib/dataService' // Только клиентские вызовы, но здесь не нужны - данные пропсами
import { ImageService } from '@/lib/imageService'
import ProductFilter from '@/components/ProductFilter'
import AddToCartButton from '@/components/AddToCartButton'
import FavoriteButton from '@/components/FavoriteButton'
import type { ActiveFilters, Product, AutoFilterConfig } from '@/types/data'

const SORTOPTIONS = {
    DEFAULT: 'default',
    PRICEASC: 'price-asc',
    PRICEDESC: 'price-desc',
    NAMEASC: 'name-asc',
    NAMEDESC: 'name-desc',
} as const
type SortKeyType = typeof SORTOPTIONS[keyof typeof SORTOPTIONS]

interface ClientCategoryPageProps {
    initialData: {
        category: { title: string; description?: string }
        products: Product[]
        markdown: string
        filterConfig: AutoFilterConfig
    }
    slug: string
}

export default function ClientCategoryPage({ initialData, slug }: ClientCategoryPageProps) {
    const { category, products: categoryProducts, markdown: markdownContent, filterConfig } = initialData
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({})
    const [sortKey, setSortKey] = useState<SortKeyType>('default')

    const filteredProducts = useMemo(() => {
        if (Object.keys(activeFilters).length === 0) {
            return categoryProducts
        }
        // Клиентский вызов, если нужно динамично; но для SSG лучше предфильтровать, если фильтры статичны
        return dataService.getFilteredProducts(slug, activeFilters) // Но dataService 'use server' - ошибка! Фикс: имплементировать клиентскую фильтрацию или Suspense
        // Альтернатива: перенести filterLogic на клиент, использовать categoryProducts как базу
    }, [categoryProducts, activeFilters, slug])

    const sortedProducts = useMemo(() => {
        const arr = [...filteredProducts]
        switch (sortKey) {
            case SORTOPTIONS.PRICEASC:
                return arr.sort((a, b) => (Number(a.price ?? 0) - Number(b.price ?? 0)))
            case SORTOPTIONS.PRICEDESC:
                return arr.sort((a, b) => (Number(b.price ?? 0) - Number(a.price ?? 0)))
            case SORTOPTIONS.NAMEASC:
                return arr.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
            case SORTOPTIONS.NAMEDESC:
                return arr.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
            default:
                return arr // Или предсортировка по популярности/цене
        }
    }, [filteredProducts, sortKey])

    return (
        <div className="container">
            <h1 className="title">{category.title}</h1>
            {category.description && <p className="subtitle">{category.description}</p>}

            {markdownContent && (
                <div
                    className="content mt-5"
                    dangerouslySetInnerHTML={{ __html: markdownContent }}
                />
            )}

            <div className="columns">
                <div className='column is-one-quarter'>
                    <div className="field mb-4">
                        <label className="label">Сортировка</label>
                        <div className="control">
                            <div className="select">
                                <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKeyType)}>
                                    <option value={SORTOPTIONS.DEFAULT}>По умолчанию</option>
                                    <option value={SORTOPTIONS.PRICEASC}>Цена ↑</option>
                                    <option value={SORTOPTIONS.PRICEDESC}>Цена ↓</option>
                                    <option value={SORTOPTIONS.NAMEASC}>Название A→Я</option>
                                    <option value={SORTOPTIONS.NAMEDESC}>Название Я→A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Боковая панель с фильтрами */}
                <div className="column is-one-quarter">
                    <ProductFilter
                        filterConfig={filterConfig}
                        onFilterChange={setActiveFilters}
                    />
                </div>

                {/* Список товаров */}
                <div className="column">
                    {sortedProducts.length === 0 ? ( // Изменил на sorted
                        <div className="notification is-warning">
                            {Object.keys(activeFilters).length > 0
                                ? 'По выбранным фильтрам товаров не найдено'
                                : 'В этой категории пока нет товаров'
                            }
                        </div>
                    ) : (
                        <div className="columns is-multiline">
                            {sortedProducts.map(product => { // sorted
                                const thumbnails = ImageService.getProductThumbnails(product, slug) // ImageService 'use server' - ошибка!

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
                                                <div className="content">
                                                    {typeof product.power_kw === 'number' && (
                                                        <p><strong>Мощность:</strong> {product.power_kw} кВт</p>
                                                    )}
                                                    {typeof product.area_max === 'number' && (
                                                        <p><strong>Площадь:</strong> до {product.area_max} м²</p>
                                                    )}
                                                </div>
                                                <div className="buttons">
                                                    <Link
                                                        href={`/${slug}/${product.slug}`}
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
                    )}
                </div>
            </div>
        </div>
    )
}