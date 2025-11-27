import { existsSync, readFileSync } from 'fs';
import { marked } from 'marked';
import path from 'path';
import type { AutoFilterConfig, Brand, Category, Prices, Product, FilterKeys, ActiveFilters } from '@/types/data';
import { FilterService } from './filterService';

const dataPath = path.join(process.cwd(), 'src', 'data');

// Загрузка JSON файлов
export function loadJSON<T>(filename: string): T {
    const filePath = path.join(dataPath, `${filename}.json`);
    try {
        const fileContents = readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return {} as T;
    }
}

// Загрузка Markdown
export function loadMarkdown(filePath: string): string {
    if (!existsSync(filePath)) return '';

    try {
        const fileContents = readFileSync(filePath, 'utf8');
        return marked.parse(fileContents) as string;
    } catch (error) {
        console.error(`Error loading markdown ${filePath}:`, error);
        return '';
    }
}

// Получение Markdown контента для страницы
export function getPageMarkdown(slug: string[]): string {
    // Для Hugo-подобной структуры с _index.md

    // 1. Проверяем _index.md для категории
    const categoryPath = slug.join('/');
    const categoryIndexPath = path.join(dataPath, categoryPath, '_index.md');
    if (existsSync(categoryIndexPath)) {
        return loadMarkdown(categoryIndexPath);
    }

    // 2. Для товаров: ищем файл товара в папке категории
    if (slug.length >= 2) {
        const categoryPathForProduct = slug.slice(0, -1).join('/');
        const productSlug = slug[slug.length - 1];
        const productMdPath = path.join(dataPath, categoryPathForProduct, `${productSlug}.md`);
        if (existsSync(productMdPath)) {
            return loadMarkdown(productMdPath);
        }
    }

    // 3. Старая логика для фильтров
    const fullMdPath = path.join(dataPath, 'filter', slug.join('_') + '.full.md');
    if (existsSync(fullMdPath)) {
        return loadMarkdown(fullMdPath);
    }

    const normalMdPath = path.join(dataPath, 'filter', slug.join('_') + '.md');
    if (existsSync(normalMdPath)) {
        return loadMarkdown(normalMdPath);
    }

    // 4. Общий fallback
    const mdPath = path.join(dataPath, ...slug) + '.md';
    return loadMarkdown(mdPath);
}

// Хелпер для проверки принадлежности товара к категории
function productInCategory(product: Product, categorySlug: string): boolean {
    if (Array.isArray(product.categories)) {
        return product.categories.includes(categorySlug);
    } else {
        return product.categories === categorySlug;
    }
}

// Сервисы данных
export const dataService = {
    // Основные данные
    getCategories: (): Record<string, Category> => loadJSON<Record<string, Category>>('categories'),
    getProducts: (): Product[] => loadJSON<Product[]>('products'),
    getBrands: (): Brand => loadJSON<Brand>('brands'),
    getPrices: (): Prices => loadJSON<Prices>('prices'),
    getActionPrices: (): Prices => loadJSON<Prices>('actionPrices'),
    getFilterKeys: (): FilterKeys => loadJSON<FilterKeys>('keys'),

    // Markdown контент
    getBrandMarkdown: (brandSlug: string): string => {
        return loadMarkdown(path.join(dataPath, 'brand', `${brandSlug}.md`));
    },

    getPageMarkdown,

    // Получение товара по slug
    getProductBySlug: (slug: string): Product | undefined => {
        const products = loadJSON<Product[]>('products');
        return products.find(p => p.slug === slug);
    },

    // Получение товаров категории
    getProductsByCategory: (categorySlug: string): Product[] => {
        const products = loadJSON<Product[]>('products');
        return products.filter(p => productInCategory(p, categorySlug));
    },

    getFilterConfigForCategory: (categorySlug: string): AutoFilterConfig => {
        const categories = loadJSON<Record<string, Category>>('categories');
        const products = loadJSON<Product[]>('products');
        const filterKeys = loadJSON<FilterKeys>('keys');

        const category = categories[categorySlug];

        // Добавляем проверку на существование категории
        if (!category) {
            console.warn(`Category ${categorySlug} not found`);
            return {};
        }

        const categoryProducts = products.filter(p => productInCategory(p, categorySlug));

        // Добавляем проверку на пустой массив товаров
        if (categoryProducts.length === 0) {
            console.warn(`No products found for category ${categorySlug}`);
            return {};
        }

        const excludeKeys = category.exclude_keys || [];

        return FilterService.generateFilterConfig(categoryProducts, filterKeys, excludeKeys);
    },

    // Фильтрация товаров
    getFilteredProducts: (categorySlug: string, activeFilters: ActiveFilters): Product[] => {
        const products = loadJSON<Product[]>('products');
        const categoryProducts = products.filter(p => productInCategory(p, categorySlug));

        // Если нет товаров в категории или нет активных фильтров
        if (categoryProducts.length === 0 || Object.keys(activeFilters).length === 0) {
            return categoryProducts;
        }

        return FilterService.filterProducts(categoryProducts, activeFilters);
    }
};