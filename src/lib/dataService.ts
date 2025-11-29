// src/lib/dataService.ts
'use server';

import { readFileSync } from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { Product, Categories, Brand, Prices, FilterKeys, AutoFilterConfig, ActiveFilters, Category } from '@/types/data';
import {FilterService} from './filterService';
import fs from 'fs/promises';

const dataPath = path.join(process.cwd(), 'src', 'data');

function loadJSON<T extends object>(filename: string): T {
	const filePath = path.join(dataPath, `${filename}.json`);
	try {
		const fileContents = readFileSync(filePath, 'utf8');
		return JSON.parse(fileContents) as T;
	} catch (error) {
		console.error(`Error loading ${filename}:`, error);
		return {} as T;
	}
}


// Async loadMarkdown
export async function loadMarkdown(filePath: string): Promise<string> {
    try {
        await fs.access(filePath); // Замена existsSync
    } catch {
        return '';
    }
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return marked.parse(fileContents) as string;
    } catch (error) {
        console.error(`Error loading markdown ${filePath}:`, error);
        return '';
    }
}

// Async getPageMarkdown с home в начале
export async function getPageMarkdown(slug: string[]): Promise<string> {
    if (slug.length === 0) {
        const homeIndexPath = path.join(dataPath, '_index.md');
        return await loadMarkdown(homeIndexPath);
    }

    const categoryPath = slug.join('/');
    const categoryIndexPath = path.join(dataPath, categoryPath, '_index.md');
    let content = await loadMarkdown(categoryIndexPath);
    if (content) return content;

    if (slug.length >= 2) {
        const categoryPathForProduct = slug.slice(0, -1).join('/');
        const productSlug = slug[slug.length - 1];
        const productMdPath = path.join(dataPath, categoryPathForProduct, `${productSlug}.md`);
        content = await loadMarkdown(productMdPath);
        if (content) return content;
    }

    const fullMdPath = path.join(dataPath, 'filter', slug.join('_') + '.full.md');
    content = await loadMarkdown(fullMdPath);
    if (content) return content;

    const normalMdPath = path.join(dataPath, 'filter', slug.join('_') + '.md');
    content = await loadMarkdown(normalMdPath);
    if (content) return content;

    const mdPath = path.join(dataPath, ...slug) + '.md';
    return await loadMarkdown(mdPath);
}

function productInCategory(product: Product, categorySlug: string): boolean {
	if (!product.categories) return false;
	return Array.isArray(product.categories)
		? product.categories.includes(categorySlug)
		: product.categories === categorySlug;
}

export const dataService = {
	getCategories: (): Categories => loadJSON<Categories>('categories'),
	getProducts: (): Product[] => loadJSON<Product[]>('products'),
	getBrands: (): Brand => loadJSON<Brand>('brands'),
	getPrices: (): Prices => loadJSON<Prices>('prices'),
	getActionPrices: (): Prices => loadJSON<Prices>('actionPrices'),
	getFilterKeys: (): FilterKeys => loadJSON<FilterKeys>('keys'),
	getBrandMarkdown: async (brandSlug: string): Promise<string> => await loadMarkdown(path.join(dataPath, 'brand', `${brandSlug}.md`)),
	getPageMarkdown,
	getProductBySlug: (slug: string): Product | undefined => {
		const products = loadJSON<Product[]>('products');
		return products.find(p => p.slug === slug);
	},
	getProductsByCategory: (categorySlug: string): Product[] => {
		const products = loadJSON<Product[]>('products');
		return products.filter(p => productInCategory(p, categorySlug));
	},
	getFilterConfigForCategory: (categorySlug: string): AutoFilterConfig => {
		const categories = loadJSON<Categories>('categories');
		const category: Category | undefined = categories[categorySlug];
		if (!category) {
			console.warn(`Category ${categorySlug} not found`);
			return {};
		}
		const products = loadJSON<Product[]>('products');
		const categoryProducts = products.filter(p => productInCategory(p, categorySlug));
		if (categoryProducts.length === 0) {
			console.warn(`No products found for category ${categorySlug}`);
			return {};
		}
		const filterKeys = loadJSON<FilterKeys>('keys');
		const excludeKeys = category.exclude_keys ?? [];
		return FilterService.generateFilterConfig(categoryProducts, filterKeys, excludeKeys);
	},
	getFilteredProducts: (categorySlug: string, activeFilters: ActiveFilters): Product[] => {
		const products = loadJSON<Product[]>('products');
		const categoryProducts = products.filter(p => productInCategory(p, categorySlug));
		if (categoryProducts.length === 0 || Object.keys(activeFilters).length === 0) {
			return categoryProducts;
		}
		return FilterService.filterProducts(categoryProducts, activeFilters);
	}
};