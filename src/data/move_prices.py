import json

def extract_prices(input_file, prices_file):
    """
    Извлекает цены из products.json в prices.json и удаляет поле price из products.json
    """
    # Загружаем данные products.json
    try:
        with open(input_file, 'r', encoding='utf-8-sig') as f:
            products_data = json.load(f)
    except FileNotFoundError:
        print(f"Файл {input_file} не найден")
        return
    except json.JSONDecodeError as e:
        print(f"Ошибка декодирования JSON: {e}")
        return
    
    # Создаем объект для цен
    prices_data = {}
    
    # Функция для обработки данных
    def process_data(data):
        if isinstance(data, list):
            return [process_data(item) for item in data]
        elif isinstance(data, dict):
            new_data = data.copy()
            
            # Если есть поле price и id
            if 'price' in new_data and 'id' in new_data:
                product_id = new_data['id']
                price = new_data['price']
                
                # Добавляем цену в prices_data
                prices_data[product_id] = price
                
                # Удаляем price из products_data
                del new_data['price']
                print(f"Цена {price} для товара {product_id} перемещена в prices.json")
            
            return new_data
        else:
            return data
    
    # Обрабатываем данные
    print("Извлечение цен...")
    updated_products_data = process_data(products_data)
    
    # Сохраняем обновленный products.json
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(updated_products_data, f, ensure_ascii=False, indent=2)
    
    # Сохраняем prices.json
    with open(prices_file, 'w', encoding='utf-8') as f:
        json.dump(prices_data, f, ensure_ascii=False, indent=2)
    
    print(f"Цены извлечены. Обновлен {input_file}, создан {prices_file}")
    print(f"Всего перемещено цен: {len(prices_data)}")

# Пример использования
if __name__ == "__main__":
    products_filename = "products.json"
    prices_filename = "prices.json"
    
    extract_prices(products_filename, prices_filename)