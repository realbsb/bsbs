import json
import os
import re
from typing import Dict, List, Any, Tuple, Union

def load_products(file_path: str) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """Загружает данные о товарах из JSON файла"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Ошибка загрузки файла: {e}")
        return {}

def save_products(file_path: str, data: Union[Dict[str, Any], List[Dict[str, Any]]]) -> None:
    """Сохраняет данные о товарах в JSON файл"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Файл успешно сохранен: {file_path}")
    except Exception as e:
        print(f"❌ Ошибка сохранения файла: {e}")

def analyze_products_structure(products_data: Union[Dict[str, Any], List[Dict[str, Any]]]) -> Dict[str, Any]:
    """Анализирует структуру данных о товарах"""
    analysis = {
        'total_products': 0,
        'format': 'unknown',
        'keys_statistics': {},
        'sample_products': []
    }
    
    if isinstance(products_data, dict):
        analysis['format'] = 'dict'
        analysis['total_products'] = len(products_data)
        products_list = list(products_data.values())[:5]  # Берем первые 5 товаров для анализа
    elif isinstance(products_data, list):
        analysis['format'] = 'list'
        analysis['total_products'] = len(products_data)
        products_list = products_data[:5]
    else:
        return analysis
    
    # Анализируем ключи
    for product in products_list:
        for key, value in product.items():
            if key not in analysis['keys_statistics']:
                analysis['keys_statistics'][key] = {
                    'count': 0,
                    'sample_values': set(),
                    'type': type(value).__name__
                }
            analysis['keys_statistics'][key]['count'] += 1
            if len(analysis['keys_statistics'][key]['sample_values']) < 3:
                analysis['keys_statistics'][key]['sample_values'].add(str(value))
    
    analysis['sample_products'] = products_list
    return analysis

def find_products_by_criteria(products_data: Union[Dict[str, Any], List[Dict[str, Any]]], criteria_key: str, criteria_value: str, case_sensitive: bool = False) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Находит товары по критерию и возвращает список найденных товаров и их ID"""
    found_products = []
    found_ids = []
    
    if isinstance(products_data, dict):
        products_list = list(products_data.values())
        id_map = {i: pid for i, pid in enumerate(products_data.keys())}
    elif isinstance(products_data, list):
        products_list = products_data
        id_map = {i: f"index_{i}" for i in range(len(products_data))}
    else:
        return [], []
    
    for idx, product in enumerate(products_list):
        if criteria_key in product:
            product_value = str(product[criteria_key])
            search_value = criteria_value if case_sensitive else criteria_value.lower()
            compare_value = product_value if case_sensitive else product_value.lower()
            
            if search_value == compare_value:
                found_products.append(product)
                found_ids.append(id_map[idx])
    
    return found_products, found_ids

def add_categories_to_products(products_data: Union[Dict[str, Any], List[Dict[str, Any]]], product_ids: List[str], categories_to_add: List[str]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """Добавляет категории к конкретным товарам по их ID"""
    updated_data = products_data.copy()
    
    if isinstance(updated_data, dict):
        for product_id in product_ids:
            if product_id in updated_data:
                if 'categories' not in updated_data[product_id]:
                    updated_data[product_id]['categories'] = []
                elif isinstance(updated_data[product_id]['categories'], str):
                    updated_data[product_id]['categories'] = [updated_data[product_id]['categories']]
                
                for cat in categories_to_add:
                    if cat not in updated_data[product_id]['categories']:
                        updated_data[product_id]['categories'].append(cat)
    
    elif isinstance(updated_data, list):
        for product_id in product_ids:
            if product_id.startswith('index_'):
                idx = int(product_id.replace('index_', ''))
                if 0 <= idx < len(updated_data):
                    if 'categories' not in updated_data[idx]:
                        updated_data[idx]['categories'] = []
                    elif isinstance(updated_data[idx]['categories'], str):
                        updated_data[idx]['categories'] = [updated_data[idx]['categories']]
                    
                    for cat in categories_to_add:
                        if cat not in updated_data[idx]['categories']:
                            updated_data[idx]['categories'].append(cat)
    
    return updated_data

def show_products_analysis(products_file: str):
    """Показывает анализ структуры товаров"""
    products_data = load_products(products_file)
    if not products_data:
        return
    
    analysis = analyze_products_structure(products_data)
    
    print(f"\n📊 АНАЛИЗ ДАННЫХ:")
    print(f"   Формат: {analysis['format']}")
    print(f"   Всего товаров: {analysis['total_products']}")
    
    if analysis['keys_statistics']:
        print(f"\n📋 СТАТИСТИКА ПО КЛЮЧАМ:")
        for key, stats in analysis['keys_statistics'].items():
            sample_values = list(stats['sample_values'])[:3]
            print(f"   '{key}': {stats['count']} товаров, тип: {stats['type']}")
            if sample_values:
                print(f"      примеры: {', '.join(sample_values)}")

def interactive_category_management(products_file: str):
    """Интерактивное управление категориями"""
    products_data = load_products(products_file)
    if not products_data:
        print("❌ Не удалось загрузить данные о товарах")
        return
    
    print(f"\n🔍 ПОИСК ТОВАРОВ ДОБАВЛЕНИЯ КАТЕГОРИЙ")
    print("=" * 50)
    
    # Показываем доступные ключи
    analysis = analyze_products_structure(products_data)
    available_keys = list(analysis['keys_statistics'].keys())
    
    print(f"\n📋 Доступные ключи: {', '.join(available_keys)}")
    
    # Выбор ключа
    while True:
        criteria_key = input("\nВведите ключ для поиска: ").strip()
        if criteria_key in available_keys:
            break
        else:
            print(f"❌ Ключ '{criteria_key}' не найден. Доступные ключи: {', '.join(available_keys)}")
    
    # Показываем примеры значений для выбранного ключа
    key_stats = analysis['keys_statistics'][criteria_key]
    sample_values = list(key_stats['sample_values'])
    print(f"\n💡 Примеры значений для '{criteria_key}':")
    for val in sample_values:
        print(f"   - '{val}'")
    
    # Ввод значения для поиска
    criteria_value = input(f"\nВведите значение для поиска в ключе '{criteria_key}': ").strip()
    if not criteria_value:
        print("❌ Значение не может быть пустым")
        return
    
    # Выбор режима поиска
    print(f"\n⚙️  РЕЖИМ ПОИСКА:")
    print("   1. Точное совпадение (регистрозависимое)")
    print("   2. Регистронезависимое совпадение")
    case_choice = input("Выберите режим (1/2): ").strip()
    case_sensitive = (case_choice == '1')
    
    # Поиск товаров
    print(f"\n🔎 Ищем товары где '{criteria_key}' = '{criteria_value}'...")
    found_products, found_ids = find_products_by_criteria(products_data, criteria_key, criteria_value, case_sensitive)
    
    if not found_products:
        print(f"❌ Не найдено товаров по критерию: {criteria_key} = '{criteria_value}'")
        
        # Показываем все уникальные значения для этого ключа
        print(f"\n💡 Все уникальные значения для '{criteria_key}':")
        unique_values = set()
        if isinstance(products_data, dict):
            for product in products_data.values():
                if criteria_key in product:
                    unique_values.add(str(product[criteria_key]))
        else:
            for product in products_data:
                if criteria_key in product:
                    unique_values.add(str(product[criteria_key]))
        
        for val in sorted(unique_values)[:20]:  # Показываем первые 20 значений
            print(f"   - '{val}'")
        if len(unique_values) > 20:
            print(f"   ... и еще {len(unique_values) - 20} значений")
        
        return
    
    print(f"✅ Найдено товаров: {len(found_products)}")
    
    # Показываем найденные товары
    print(f"\n📋 НАЙДЕННЫЕ ТОВАРЫ:")
    for i, product in enumerate(found_products[:10], 1):  # Показываем первые 10
        name = product.get('title') or product.get('name') or product.get('id', 'Без названия')
        current_cats = product.get('categories', [])
        if isinstance(current_cats, str):
            current_cats = [current_cats]
        print(f"   {i}. {name}")
        if current_cats:
            print(f"      текущие категории: {', '.join(current_cats)}")
    
    if len(found_products) > 10:
        print(f"   ... и еще {len(found_products) - 10} товаров")
    
    # Ввод категорий для добавления
    print(f"\n🏷️  ДОБАВЛЕНИЕ КАТЕГОРИЙ")
    categories_input = input("Введите категории для добавления (через запятую): ").strip()
    if not categories_input:
        print("❌ Не указаны категории для добавления")
        return
    
    categories_to_add = [cat.strip() for cat in categories_input.split(',')]
    
    # Подтверждение
    print(f"\n⚠️  ПОДТВЕРЖДЕНИЕ:")
    print(f"   Будет обновлено: {len(found_products)} товаров")
    print(f"   Критерий: {criteria_key} = '{criteria_value}'")
    print(f"   Добавляемые категории: {', '.join(categories_to_add)}")
    
    confirm = input("\nПродолжить? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Отменено пользователем")
        return
    
    # Применение изменений
    print(f"\n🔄 Применяю изменения...")
    updated_data = add_categories_to_products(products_data, found_ids, categories_to_add)
    
    # Сохранение
    print(f"💾 Сохраняю изменения...")
    save_products(products_file, updated_data)
    
    print(f"\n✅ ГОТОВО! Обновлено товаров: {len(found_products)}")

def show_menu() -> None:
    """Показывает главное меню"""
    print("\n" + "="*50)
    print("🎯 МЕНЕДЖЕР КАТЕГОРИЙ ТОВАРОВ")
    print("="*50)
    print("1. Анализ структуры товаров")
    print("2. Добавить категории по критерию")
    print("3. Выход")
    print("="*50)

def main():
    # Ищем products.json в той же папке, что и скрипт
    script_dir = os.path.dirname(os.path.abspath(__file__))
    products_file = os.path.join(script_dir, 'products.json')
    
    if not os.path.exists(products_file):
        print(f"❌ Файл {products_file} не найден!")
        print(f"💡 Убедитесь, что файл products.json находится в папке со скриптом")
        return
    
    print(f"📁 Загружаю данные из: {products_file}")
    
    # Главный цикл программы
    while True:
        show_menu()
        choice = input("\nВыберите действие (1-3): ").strip()
        
        if choice == '1':
            show_products_analysis(products_file)
        elif choice == '2':
            interactive_category_management(products_file)
        elif choice == '3':
            print("\n👋 До свидания!")
            break
        else:
            print("❌ Неверный выбор. Попробуйте снова.")
        
        # Пауза перед следующим показом меню
        if choice != '3':
            input("\nНажмите Enter чтобы продолжить...")

if __name__ == "__main__":
    main()