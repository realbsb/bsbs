import json
import os

# Читаем products.json
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Извлекаем акционные цены
action_prices = {}
for product in products:
    if 'actionPrice' in product and product['actionPrice'] is not None:
        action_prices[product['id']] = product['actionPrice']
        # Удаляем actionPrice из основного продукта
        del product['actionPrice']

# Сохраняем actionPrices.json
with open('actionPrices.json', 'w', encoding='utf-8') as f:
    json.dump(action_prices, f, ensure_ascii=False, indent=2)

# Сохраняем обновлённый products.json (без actionPrice)
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Извлечено {len(action_prices)} акционных цен")
print("Файлы actionPrices.json и products.json обновлены")