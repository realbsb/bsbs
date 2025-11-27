import json

def load_json_with_bom_handling(file_path):
    """Загружает JSON файл с обработкой BOM и другими потенциальными проблемами"""
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            content = f.read().strip()
            if not content:
                print(f"Файл {file_path} пустой")
                return None
            return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"Ошибка декодирования JSON в файле {file_path}: {e}")
        return None
    except Exception as e:
        print(f"Ошибка чтения файла {file_path}: {e}")
        return None

# Загружаем фильтр с соответствием ключей
key_mapping = {}
filter_data = load_json_with_bom_handling('filter.json')
if filter_data:
    key_mapping = {v: k for k, v in filter_data.items()}

# Загружаем продукты
products_data = load_json_with_bom_handling('products.json')

if products_data is not None:
    def update_keys(data):
        """Рекурсивно обновляет ключи в данных"""
        if isinstance(data, list):
            return [update_keys(item) for item in data]
        elif isinstance(data, dict):
            return {key_mapping.get(key, key): update_keys(value) for key, value in data.items()}
        else:
            return data

    # Обновляем ключи
    updated_data = update_keys(products_data)

    # Сохраняем результат обратно в products.json (без BOM)
    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=2)

    print("Замена ключей завершена!")
else:
    print("Не удалось загрузить данные для обработки")