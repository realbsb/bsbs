import { existsSync } from 'fs';
import path from 'path';
import type { Product } from '@/types/data';

const imageFormats = ['', '.webp', '.jpg', '.jpeg', '.avif', '.png'];

export class ImageService {
    // Поиск изображения по пути с проверкой форматов
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

    // Поиск нумерованных изображений
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

    // Основной метод получения изображений товара
    static getProductImages(product: Product, currentCategory?: string): string[] {
        const images: string[] = [];

        // 1. Изображения из product.img
        if (product.img && Array.isArray(product.img)) {
            product.img.forEach(imgPath => {
                // Убираем начальный слэш если есть
                const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
                const found = this.findImage(`/${cleanPath}`);
                if (found) images.push(found);
            });
        }

        // 2. Изображения по путям категорий товара
        if (product.categories && product.categories.length > 0 && product.slug) {
            for (const category of product.categories) {
                const basePath = `/${category}/${product.slug}`;

                // Основное изображение
                const mainImage = this.findImage(basePath);
                if (mainImage) images.push(mainImage);

                // Нумерованные изображения
                const numberedImages = this.findNumberedImages(basePath);
                images.push(...numberedImages);
            }
        }

        // 3. Изображение текущей категории
        if (currentCategory) {
            const categoryImage = this.findImage(`/${currentCategory}`);
            if (categoryImage) images.push(categoryImage);
        }

        // 4. Изображение любой категории товара
        if (product.categories && product.categories.length > 0) {
            for (const category of product.categories) {
                const categoryImage = this.findImage(`/${category}`);
                if (categoryImage) {
                    images.push(categoryImage);
                    break;
                }
            }
        }

        // 5. Дефолтное изображение
        const defaultImage = this.findImage('/product-default');
        if (defaultImage) images.push(defaultImage);

        // Убираем дубликаты
        return [...new Set(images)];
    }

    // Получение thumbnail изображений
    static getProductThumbnails(product: Product, currentCategory?: string): string[] {
        const thumbs: string[] = [];

        // Проверяем что product.slug существует
        if (!product.slug) {
            return thumbs;
        }

        // Поиск .thumb версий
        if (product.categories && product.categories.length > 0) {
            for (const category of product.categories) {
                const thumbPath = this.findImage(`/${category}/${product.slug}.thumb`);
                if (thumbPath) thumbs.push(thumbPath);
            }
        }

        // Если нет thumb, используем первое основное изображение
        if (thumbs.length === 0) {
            const mainImages = this.getProductImages(product, currentCategory);
            if (mainImages.length > 0 && mainImages[0]) {
                thumbs.push(mainImages[0]);
            }
        }

        return thumbs;
    }
}