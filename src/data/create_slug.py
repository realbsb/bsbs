import json
import re

def generate_abbreviation(slug):
    """
    Генерирует аббревиатуру из slug: первые буквы каждого слова и все цифры
    """
    # Разбиваем slug на слова по не-буквенно-цифровым символам
    words = re.split(r'[^a-zA-Zа-яА-Я0-9]', slug)
    
    abbreviation = []
    for word in words:
        if not word:
            continue
            
        # Добавляем первую букву слова, если она есть
        if word[0].isalpha():
            abbreviation.append(word[0].lower())
        
        # Добавляем все цифры из слова
        digits = re.findall(r'\d+', word)
        abbreviation.extend(digits)
    
    return ''.join(abbreviation)

def process_slug_and_id(data):
    """
    Обрабатывает данные: создает slug из id (если нет) и заменяет id на аббревиатуру
    """
    if isinstance(data, list):
        return [process_slug_and_id(item) for item in data]
    elif isinstance(data, dict):
        new_data = data.copy()
        
        # Если есть id, но нет slug
        if 'id' in new_data and 'slug' not in new_data:
            # Создаем slug из id
            new_data['slug'] = new_data['id']
            
            # Генерируем новое id из slug
            new_data['id'] = generate_abbreviation(new_data['slug'])
        
        return new_data
    else:
        return data

def process_json_file(input_file, output_file=None):
    """
    Обрабатывает JSON файл
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
    
    # Обрабатываем данные
    print("Обработка slug и id...")
    processed_data = process_slug_and_id(data)
    
    # Сохраняем результат
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Обработка завершена. Результат сохранен в {output_file}")

# Пример использования
if __name__ == "__main__":
    input_filename = "products.json"
    output_filename = "products_processed.json"
    
    process_json_file(input_filename, output_filename)