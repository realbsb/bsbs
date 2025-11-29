// src/app/[...slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { dataService } from '@/lib/dataService'
import { ImageService } from '@/lib/imageService'
import ClientCategoryPage from './ClientCategoryPage'
import type { AutoFilterConfig, Product, Category } from '@/types/data'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCartButton from '@/components/AddToCartButton'
import { Categories } from '@/types/data'

interface PageProps {
    params: {
        slug: string[]
    }
}

async function preloadCategoryData(slug: string): Promise<{
    category: Category;
    products: Product[];
    markdown: string;
    filterConfig: AutoFilterConfig;
    thumbnails: string[][];
} | null> {
    const categories = dataService.getCategories()
		const category: Category | undefined = categories[slug as keyof Categories];
    if (!category) return null

    const products = dataService.getProductsByCategory(slug)
    const markdown = await dataService.getPageMarkdown([slug])
    const filterConfig = dataService.getFilterConfigForCategory(slug)
    const thumbnails = products.map(p => ImageService.getProductThumbnails(p, slug))

    return { category, products, markdown, filterConfig, thumbnails }
}

function ProductPage({ categorySlug, productSlug }: { categorySlug: string; productSlug: string }) {
    const categories = dataService.getCategories()
		const category: Category | undefined = categories[categorySlug as keyof Categories];
    const product = dataService.getProductBySlug(productSlug)

    if (!category || !product) {
        return notFound()
    }

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
                            {Object.entries(product as Partial<Product>).map(([key, value]) => {
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

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = params

    if (!slug || slug.length === 0) {
        return notFound()
    }

    if (slug.length === 1) {
        const data = await preloadCategoryData(slug[0])
        if (!data) return notFound()
        return <ClientCategoryPage initialData={data} slug={slug[0]} />
    } else if (slug.length === 2) {
        return <ProductPage categorySlug={slug[0]} productSlug={slug[1]} />
    } else {
        return notFound()
    }
}

export async function generateStaticParams() {
    const categories = dataService.getCategories()
    const products = dataService.getProducts()

    const paths: { slug: string[] }[] = []

    Object.keys(categories).forEach(categorySlug => {
        paths.push({ slug: [categorySlug] })
    })

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