// src/app/page.tsx
import Link from 'next/link'
import { dataService } from '@/lib/dataService'
import type { Categories, Category } from '@/types/data'

interface CategoryTreeProps {
  categories: Categories
  parent?: string | null
  level?: number
}

function CategoryTree({ categories, parent = null, level = 0 }: CategoryTreeProps) {
  const children = Object.entries(categories).filter(([, cat]) => {
    if (parent === null) return !cat.parent
    if (Array.isArray(cat.parent)) return cat.parent.includes(parent)
    return cat.parent === parent
  })

  if (children.length === 0) return null

  return (
    <ul className={`menu-list ${level > 0 ? 'ml-4' : ''}`}>
      {children.map(([slug, cat]) => (
        <li key={slug}>
          <Link href={`/${slug}`}>{cat.title}</Link>
          <CategoryTree categories={categories} parent={slug} level={level + 1} />
        </li>
      ))}
    </ul>
  )
}

export default async function HomePage() {
  const categories = dataService.getCategories()
  const markdownContent = await dataService.getPageMarkdown([]) || '<h1>Добро пожаловать в наш магазин!</h1><p>Здесь вы найдете лучшие товары для отопления и не только.</p>'

  return (
    <div>
      <section className="hero is-primary is-medium">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Добро пожаловать!</h1>
            <h2 className="subtitle">Отопительное оборудование и аксессуары</h2>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="content" dangerouslySetInnerHTML={{ __html: markdownContent }} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Категории товаров</h2>
          <div className="menu">
            <CategoryTree categories={categories} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Акционные товары</h2>
          <p>Здесь будут акционные товары из actionPrices.json (добавим позже: каррусель/список с ImageService, ценами).</p>
        </div>
      </section>
    </div>
  )
}