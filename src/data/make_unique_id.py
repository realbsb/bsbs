import json
from collections import defaultdict

def make_ids_unique(input_file, output_file=None):
    """
    Находит неуникальные ID в products.json и делает их уникальными добавлением суффиксов
    """
    if output_file is None:
        output_file = input_file
    
    # Загружаем данные
    try:
        with open(input_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Файл {input_file} не найден")
        return
    except json.JSONDecodeError as e:
        print(f"Ошибка декодирования JSON: {e}")
        return
    
    # Собираем статистику по ID
    id_count = defaultdict(int)
    id_positions = defaultdict(list)
    
    # Функция для сбора ID
    def collect_ids(obj, path=""):
        if isinstance(obj, list):
            for i, item in enumerate(obj):
                collect_ids(item, f"{path}[{i}]")
        elif isinstance(obj, dict):
            if 'id' in obj:
                id_value = obj['id']
                id_count[id_value] += 1
                id_positions[id_value].append(path)
            for key, value in obj.items():
                collect_ids(value, f"{path}.{key}" if path else key)
    
    collect_ids(data)
    
    # Находим неуникальные ID
    duplicate_ids = {id_val: count for id_val, count in id_count.items() if count > 1}
    
    if not duplicate_ids:
        print("Все ID уникальны. Изменения не требуются.")
        return
    
    print(f"Найдено неуникальных ID: {len(duplicate_ids)}")
    for id_val, count in duplicate_ids.items():
        print(f"  - '{id_val}': встречается {count} раз")
    
    # Функция для обновления неуникальных ID
    def update_duplicate_ids(obj, path=""):
        if isinstance(obj, list):
            return [update_duplicate_ids(item, f"{path}[{i}]") for i, item in enumerate(obj)]
        elif isinstance(obj, dict):
            new_obj = obj.copy()
            if 'id' in new_obj:
                id_value = new_obj['id']
                if id_value in duplicate_ids:
                    # Находим индекс этого вхождения в списке позиций
                    current_path = path
                    positions = id_positions[id_value]
                    if current_path in positions:
                        index = positions.index(current_path)
                        if index > 0:  # Оставляем первый ID без изменений
                            new_id = f"{id_value}_{index}"
                            new_obj['id'] = new_id
                            print(f"Обновлен ID: '{id_value}' -> '{new_id}' (позиция: {current_path})")
            for key, value in new_obj.items():
                new_obj[key] = update_duplicate_ids(value, f"{path}.{key}" if path else key)
            return new_obj
        else:
            return obj
    
    # Обновляем данные
    print("\nОбновление неуникальных ID...")
    updated_data = update_duplicate_ids(data)
    
    # Сохраняем результат
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nОбновление завершено. Результат сохранен в {output_file}")

# Пример использования
if __name__ == "__main__":
    input_filename = "products.json"
    output_filename = "products_unique.json"
    
    make_ids_unique(input_filename, output_filename)