import type { Product, FilterKeys, AutoFilterConfig, FilterOption, ActiveFilters } from '@/types/data';

export class FilterService {
    // Автоматическое определение типа фильтра на основе данных товаров
    static autoDetectFilterType(products: Product[], key: string): FilterOption {
        const values = products
            .map(p => p[key])
            .filter((v): v is string | number => v !== undefined && v !== null);

        if (values.length === 0) {
            return { type: 'select', title: key };
        }

        // Проверяем, все ли значения - числа
        const allNumbers = values.every(v => typeof v === 'number');

        if (allNumbers) {
            const numValues = values as number[];
            const uniqueValues = new Set(numValues).size;

            // Для целых чисел
            if (numValues.every(v => Number.isInteger(v))) {
                if (uniqueValues > 5) {
                    return {
                        type: 'range',
                        title: key,
                        min: Math.min(...numValues),
                        max: Math.max(...numValues),
                        step: 1
                    };
                } else {
                    return {
                        type: 'number',
                        title: key,
                        values: Array.from(new Set(numValues)).sort((a, b) => a - b).map(String)
                    };
                }
            } else {
                // Для дробных чисел - только range
                return {
                    type: 'range',
                    title: key,
                    min: Math.min(...numValues),
                    max: Math.max(...numValues),
                    step: 0.1
                };
            }
        }

        // Для строковых значений
        const stringValues = values.map(v => String(v));
        const uniqueValues = new Set(stringValues);

        if (uniqueValues.size > 3) {
            return {
                type: 'select',
                title: key,
                values: Array.from(uniqueValues).sort()
            };
        } else {
            return {
                type: 'checkbox',
                title: key,
                values: Array.from(uniqueValues).sort()
            };
        }
    }

    // Генерация конфигурации фильтров на основе данных
    static generateFilterConfig(products: Product[], filterKeys: FilterKeys, excludeKeys: string[] = []): AutoFilterConfig {
        const config: AutoFilterConfig = {};

        // Собираем все возможные ключи из товаров
        const allKeys = new Set<string>();
        products.forEach(product => {
            Object.keys(product).forEach(key => {
                if (!['id', 'slug', 'title', 'categories', 'desc', 'img', 'badge', 'brand'].includes(key)) {
                    allKeys.add(key);
                }
            });
        });

        // Создаем конфигурацию для каждого ключа
        Array.from(allKeys)
            .filter(key => !excludeKeys.includes(key))
            .forEach(key => {
                const humanName = filterKeys[key] || key;
                config[key] = {
                    ...this.autoDetectFilterType(products, key),
                    title: humanName
                };
            });

        return config;
    }

    // Фильтрация товаров по активным фильтрам
    static filterProducts(products: Product[], activeFilters: ActiveFilters): Product[] {
        return products.filter(product => {
            return Object.entries(activeFilters).every(([key, filterValue]) => {
                if (!filterValue) return true;

                const productValue = product[key];
                if (productValue === undefined) return false;

                // Обработка разных типов фильтров
                if (Array.isArray(filterValue)) {
                    // Checkbox фильтр - должно совпадать хотя бы одно значение
                    return filterValue.includes(String(productValue));
                } else if (typeof filterValue === 'object' && filterValue !== null) {
                    // Range фильтр
                    const range = filterValue as { min?: number; max?: number };
                    const numValue = Number(productValue);
                    if (isNaN(numValue)) return false;

                    const minOk = range.min === undefined || numValue >= range.min;
                    const maxOk = range.max === undefined || numValue <= range.max;
                    return minOk && maxOk;
                } else {
                    // Select или number фильтр
                    return String(productValue) === String(filterValue);
                }
            });
        });
    }
}