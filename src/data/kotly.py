import json
import re

def fix_product_data(data):
    """
    Исправляет данные продуктов согласно требованиям:
    1. Заменяет id на значение из title без "Газовый котел настенный " с заменой пробелов на "-"
    2. Формирует правильные пути для изображений: /kotly-nastennye/старый_id/имя_файла
    3. Добавляет второй элемент в img из full_img с тем же путем и удаляет full_img
    """
    if isinstance(data, list):
        return [fix_product_data(item) for item in data]
    elif isinstance(data, dict):
        new_data = data.copy()
        
        # Проверяем, есть ли необходимые поля
        if 'title' in new_data and 'id' in new_data and 'img' in new_data and len(new_data['img']) > 0:
            # Сохраняем старый id
            old_id = new_data['id']
            
            # 1. Создаем новый id из title
            title = new_data['title']
            if title.startswith('Газовый котел настенный '):
                new_id = title.replace('Газовый котел настенный ', '')
                # Заменяем пробелы на дефисы и удаляем лишние символы
                new_id = re.sub(r'[^\w\s-]', '', new_id)  # Удаляем специальные символы
                new_id = new_id.replace(' ', '-').replace('--', '-').strip('-')
                new_data['id'] = new_id
                
                # 2. Формируем правильный путь для изображений: /kotly-nastennye/старый_id/имя_файла
                if new_data['img']:
                    # Извлекаем имя файла из первого элемента img
                    first_img_filename = new_data['img'][0].split('/')[-1]
                    
                    # Создаем новый путь: /kotly-nastennye/старый_id/имя_файла
                    new_img_path = f"/kotly-nastennye/{old_id}/{first_img_filename}"
                    new_data['img'][0] = new_img_path
                
                # 3. Добавляем второй элемент в img из full_img
                if 'full_img' in new_data and new_data['full_img']:
                    # Извлекаем имя файла из full_img
                    full_img_filename = new_data['full_img'][0].split('/')[-1]
                    
                    # Создаем такой же путь: /kotly-nastennye/старый_id/имя_файла
                    second_img_path = f"/kotly-nastennye/{old_id}/{full_img_filename}"
                    
                    # Добавляем как второй элемент
                    if len(new_data['img']) < 2:
                        new_data['img'].append(second_img_path)
                    else:
                        new_data['img'][1] = second_img_path
                    
                    # Удаляем full_img
                    del new_data['full_img']
        
        return new_data
    else:
        return data

def process_json_file(input_file, output_file=None):
    """
    Обрабатывает JSON файл с продуктами
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
    
    # Исправляем данные
    print("Обработка данных...")
    fixed_data = fix_product_data(data)
    
    # Сохраняем результат
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Обработка завершена. Результат сохранен в {output_file}")

# Пример использования
if __name__ == "__main__":
    input_filename = "products.json"
    output_filename = "products_fixed.json"
    
    process_json_file(input_filename, output_filename)