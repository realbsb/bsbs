export interface Category {
  slug: string;
  title: string;
  seotitle?: string;
  seodesc?: string;
  parent?: string | string[];
  filterkeys_exclude?: string[];
  description?: string;
  exclude_keys?: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  categories: string | string[];
  desc?: string;
  img?: string[];
  badge?: string;
  power_kw?: number;
  area_max?: number;
  gas_consumption?: number;
  water_pipes?: string;
  gas_pipes?: string;
  height?: number;
  width?: number;
  depth?: number;
  mode?: string;
  boiler_type?: string;
  chamber?: string;
  efficiency?: number;
  country?: string;
  heat_exchanger?: string;
  brand?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface Brand {
  [key: string]: string;
}

export interface Prices {
  [key: string]: number;
}

export interface FilterKeys {
  [key: string]: string;
}

export type FilterValueType = 
  | string 
  | number 
  | string[] 
  | RangeFilter 
  | null

export interface FilterOption {
  type: 'number' | 'range' | 'select' | 'checkbox';
  title: string;
  values?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface AutoFilterConfig {
  [key: string]: FilterOption;
}

export interface RangeFilter {
  min?: number;
  max?: number;
}

export type FilterValue = string | number | string[] | RangeFilter | null;

export interface ActiveFilters {
  [key: string]: FilterValueType;
}

export interface FilterConfig {
  [key: string]: string;
}

// Упрощаем хелпер - удаляем рекурсивный вызов
export function getCategoryFullPath(category: Category, allCategories: Record<string, Category>): string {
  if (!category.parent) return category.slug;

  // Обрабатываем случай, когда parent - массив (берем первого)
  const parentSlug = Array.isArray(category.parent) ? category.parent[0] : category.parent;
  const parentCategory = allCategories[parentSlug];

  if (!parentCategory) return category.slug;

  // Простая конкатенация без рекурсии
  return `${parentCategory.slug}/${category.slug}`;
}

