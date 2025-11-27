'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { dataService } from '@/lib/dataService'
import { ImageService } from '@/lib/imageService'
import ProductFilter from '@/components/ProductFilter'
import AddToCartButton from '@/components/AddToCartButton'
import FavoriteButton from '@/components/FavoriteButton'
import type { ActiveFilters } from '@/types/data'

interface PageProps {
    params: {
        slug: string[]
    }
}

// Клиентский компонент для категории с фильтрацией
function CategoryPage({ slug }: { slug: string }) {
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({})

    const categories = dataService.getCategories()
    const category = categories[slug]
    const categoryProducts = dataService.getProductsByCategory(slug)
    const markdownContent = dataService.getPageMarkdown([slug])
    const filterConfig = dataService.getFilterConfigForCategory(slug)

    // Применяем фильтрацию
    const filteredProducts = useMemo(() => {
        if (Object.keys(activeFilters).length === 0) {
            return categoryProducts
        }
        return dataService.getFilteredProducts(slug, activeFilters)
    }, [categoryProducts, activeFilters, slug])

    if (!category) {
        return notFound()
    }

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
                {/* Боковая панель с фильтрами */}
                <div className="column is-one-quarter">
                    <ProductFilter
                        filterConfig={filterConfig}
                        onFilterChange={setActiveFilters}
                    />
                </div>

                {/* Список товаров */}
                <div className="column">
                    {filteredProducts.length === 0 ? (
                        <div className="notification is-warning">
                            {Object.keys(activeFilters).length > 0
                                ? 'По выбранным фильтрам товаров не найдено'
                                : 'В этой категории пока нет товаров'
                            }
                        </div>
                    ) : (
                        <div className="columns is-multiline">
                            {filteredProducts.map(product => {
                                const thumbnails = ImageService.getProductThumbnails(product, slug)

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

// Серверный компонент для товара
function ProductPage({ categorySlug, productSlug }: { categorySlug: string; productSlug: string }) {
    const categories = dataService.getCategories()
    const category = categories[categorySlug]
    const product = dataService.getProductBySlug(productSlug)

    if (!category || !product) {
        return notFound()
    }

    // Проверяем, что товар принадлежит категории
    const productInCategory = dataService.getProductsByCategory(categorySlug)
        .some(p => p.slug === productSlug)

    if (!productInCategory) {
        return notFound()
    }

    const images = ImageService.getProductImages(product, categorySlug)
    const markdownContent = dataService.getPageMarkdown([categorySlug, productSlug])

    return (
        <div className="container">
            <nav className="breadcrumb" aria-label="breadcrumbs">
                <ul>
                    <li><Link href="/">Главная</Link></li>
                    <li><Link href={`/${categorySlug}`}>{category.title}</Link></li>
                    <li className="is-active"><a href="#" aria-current="page">{product.title}</a></li>
                </ul>
            </nav>

            <div className="columns">
                <div className="column is-half">
                    {images.length > 0 && (
                        <figure className="image">
                            <Image
                                src={images[0]}
                                alt={product.title}
                                width={600}
                                height={400}
                                style={{ objectFit: 'cover' }}
                            />
                        </figure>
                    )}
                </div>
                <div className="column is-half">
                    <div className="is-pulled-right">
                        <FavoriteButton
                            productId={product.id}
                            size="normal"
                        />
                    </div>
                    <h1 className="title">{product.title}</h1>
                    {product.badge && (
                        <span className="tag is-primary">{product.badge}</span>
                    )}
                    <p className="subtitle is-6">{product.desc}</p>

                    <div className="content">
                        <h4>Характеристики:</h4>
                        <ul>
                            {Object.entries(product).map(([key, value]) => {
                                if (['id', 'slug', 'title', 'desc', 'badge', 'img', 'categories'].includes(key)) return null
                                if (value === undefined || value === null) return null
                                return (
                                    <li key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="field is-grouped mt-4">
                        <div className="control">
                            <AddToCartButton
                                productId={product.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {markdownContent && (
                <div
                    className="content mt-5"
                    dangerouslySetInnerHTML={{ __html: markdownContent }}
                />
            )}
        </div>
    )
}

// Главный компонент страницы
export default function DynamicPage({ params }: PageProps) {
    const { slug } = params

    if (!slug || slug.length === 0) {
        return notFound()
    }

    // Определяем тип страницы по количеству сегментов в slug
    if (slug.length === 1) {
        // Страница категории
        return <CategoryPage slug={slug[0]} />
    } else if (slug.length === 2) {
        // Страница товара в категории
        return <ProductPage
            categorySlug={slug[0]}
            productSlug={slug[1]}
        />
    } else {
        // Фильтры или неизвестный путь
        return notFound()
    }
}

export async function generateStaticParams() {
    const categories = dataService.getCategories()
    const products = dataService.getProducts()

    const paths: { slug: string[] }[] = []

    // Генерируем пути для категорий
    Object.keys(categories).forEach(categorySlug => {
        paths.push({ slug: [categorySlug] })
    })

    // Генерируем пути для товаров
    products.forEach(product => {
        if (product.categories && product.slug) {
            const categoriesArray = Array.isArray(product.categories) ? product.categories : [product.categories]
            categoriesArray.forEach(categorySlug => {
                paths.push({ slug: [categorySlug, product.slug] })
            })
        }
    })

    return paths
}