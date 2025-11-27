import json
import re

def fix_dimensions(data):
    """
    Исправляет ошибочно разбитые габариты в данных JSON
    """
    if isinstance(data, list):
        return [fix_dimensions(item) for item in data]
    elif isinstance(data, dict):
        new_data = data.copy()
        
        # Ищем ключи, содержащие ", x" или ", х"
        problematic_keys = []
        for key in data.keys():
            if isinstance(key, str) and (', x' in key.lower() or ', х' in key.lower()):
                problematic_keys.append(key)
        
        # Обрабатываем найденные проблемные ключи
        for problematic_key in problematic_keys:
            value = data[problematic_key]
            
            # Извлекаем исходное название параметра (до запятой)
            original_param = problematic_key.split(',')[0].strip()
            
            # Извлекаем оставшуюся часть из ключа (ширина и высота)
            remaining_part = problematic_key.split(',', 1)[1].strip()
            
            # Нормализуем символы x (латинские и кириллические)
            normalized_remaining = remaining_part.replace('х', 'x').replace('Х', 'x')
            
            # Извлекаем числа из оставшейся части
            numbers_in_key = re.findall(r'\d+\.?\d*', normalized_remaining)
            
            if len(numbers_in_key) >= 2 and isinstance(value, (int, float, str)):
                try:
                    # Преобразуем значения в числа
                    length = float(value) if isinstance(value, (int, float)) else float(str(value).strip())
                    width = float(numbers_in_key[0])
                    height = float(numbers_in_key[1])
                    
                    # Создаем правильные ключи
                    new_data[original_param] = f"{length}x{width}x{height}"
                    new_data["Длина"] = length
                    new_data["Ширина"] = width
                    new_data["Высота"] = height
                    
                    print(f"Исправлено: '{problematic_key}' -> '{original_param}': '{length}x{width}x{height}'")
                    
                except (ValueError, TypeError) as e:
                    print(f"Ошибка преобразования чисел для ключа '{problematic_key}': {e}")
            
            # Удаляем проблемный ключ
            del new_data[problematic_key]
        
        return new_data
    else:
        return data

def find_problematic_keys(data):
    """
    Находит все проблемные ключи в данных
    """
    problematic = []
    
    def search_recursive(obj, path=""):
        if isinstance(obj, list):
            for i, item in enumerate(obj):
                search_recursive(item, f"{path}[{i}]")
        elif isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(key, str) and (', x' in key.lower() or ', х' in key.lower()):
                    problematic.append({
                        'path': path,
                        'key': key,
                        'value': value
                    })
                if isinstance(value, (dict, list)):
                    search_recursive(value, f"{path}.{key}" if path else key)
    
    search_recursive(data)
    return problematic

# Основной процесс
def main():
    # Загружаем данные
    try:
        with open('products.json', 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Файл products.json не найден")
        return
    except json.JSONDecodeError as e:
        print(f"Ошибка декодирования JSON: {e}")
        return
    
    # Сначала находим все проблемные ключи
    print("Поиск проблемных ключей...")
    problematic_keys = find_problematic_keys(data)
    
    if not problematic_keys:
        print("Проблемные ключи не найдены")
        return
    
    print(f"Найдено проблемных ключей: {len(problematic_keys)}")
    for item in problematic_keys:
        print(f"  - {item['path']}: '{item['key']}' = {item['value']}")
    
    # Исправляем данные
    print("\nИсправление данных...")
    fixed_data = fix_dimensions(data)
    
    # Сохраняем исправленные данные
    with open('products_fixed.json', 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nИсправления завершены. Результат сохранен в products_fixed.json")

if __name__ == "__main__":
    main()