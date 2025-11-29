// src/lib/imageService.ts
'use server';

import { existsSync } from 'fs';
import path from 'path';
import type { Product } from '@/types/data';

const imageFormats = ['', '.webp', '.jpg', '.jpeg', '.avif', '.png'] as const;

export class ImageService {
	private static findImage(basePath: string): string | null {
		for (const format of imageFormats) {
			const testPath = `/img${basePath}${format}`;
			const fullPath = path.join(process.cwd(), 'public', `img${basePath}${format}`);
			if (existsSync(fullPath)) {
				return testPath;
			}
		}
		return null;
	}

	private static findNumberedImages(basePath: string): string[] {
		const images: string[] = [];
		for (const format of imageFormats) {
			let index = 1;
			while (true) {
				const numberedPath = `/img${basePath}.${index}${format}`;
				const fullPath = path.join(process.cwd(), 'public', `img${basePath}.${index}${format}`);
				if (existsSync(fullPath)) {
					images.push(numberedPath);
					index++;
				} else {
					break;
				}
			}
		}
		return images;
	}

	static getProductImages(product: Product, currentCategory?: string): string[] {
		const images: string[] = [];
		if (product.img && Array.isArray(product.img)) {
			product.img.forEach(imgPath => {
				const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
				const found = this.findImage(`/${cleanPath}`);
				if (found) images.push(found);
			});
		}
		const categories = Array.isArray(product.categories) ? product.categories : (product.categories ? [product.categories] : []);
		if (categories.length > 0 && product.slug) {
			for (const category of categories) {
				const basePath = `/${category}/${product.slug}`;
				const mainImage = this.findImage(basePath);
				if (mainImage) images.push(mainImage);
				const numberedImages = this.findNumberedImages(basePath);
				images.push(...numberedImages);
			}
		}
		if (currentCategory) {
			const categoryImage = this.findImage(`/${currentCategory}`);
			if (categoryImage) images.push(categoryImage);
		}
		if (categories.length > 0) {
			for (const category of categories) {
				const categoryImage = this.findImage(`/${category}`);
				if (categoryImage) {
					images.push(categoryImage);
					break;
				}
			}
		}
		const defaultImage = this.findImage('/product-default');
		if (defaultImage) images.push(defaultImage);
		return [...new Set(images)];
	}

	static getProductThumbnails(product: Product, currentCategory?: string): string[] {
		const thumbs: string[] = [];
		if (!product.slug) return thumbs;
		const categories = Array.isArray(product.categories) ? product.categories : (product.categories ? [product.categories] : []);
		if (categories.length > 0) {
			for (const category of categories) {
				const thumbPath = this.findImage(`/${category}/${product.slug}.thumb`);
				if (thumbPath) thumbs.push(thumbPath);
			}
		}
		if (thumbs.length === 0) {
			const mainImages = this.getProductImages(product, currentCategory);
			if (mainImages.length > 0) thumbs.push(mainImages[0]);
		}
		return thumbs;
	}
}