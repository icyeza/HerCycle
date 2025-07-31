import asyncio
from playwright.async_api import async_playwright
import requests

# Backend API to send product data to
BACKEND_API_URL = 'http://127.0.0.1:5000/api/products'

# Starting URL for the category
START_URL = 'https://kasha.rw/product-category/?id=B33'
BASE_URL = 'https://kasha.rw'

async def extract_and_send_product_data(product):
    # Extract individual elements
    title_el = await product.query_selector(".product-item__name")
    price_el = await product.query_selector(".product-item__price")
    image_el = await product.query_selector("img")
    category_el = await product.query_selector(".product-item__cat-name")
    link_el = await product.query_selector("a")

    # Parse data
    title = await title_el.inner_text() if title_el else "No Title"
    price = await price_el.inner_text() if price_el else "0"
    image = await image_el.get_attribute("src") if image_el else ""
    category = await category_el.inner_text() if category_el else ""
    link = await link_el.get_attribute("href") if link_el else ""

    # Clean price
    clean_price = float(price.replace("RWF", "").strip()) if price else 0

    # Build product payload
    payload = {
        'title': title.strip(),
        'price': clean_price,
        'image': image,
        'rating': 0,
        'notes': f"{category} | {BASE_URL + link}"
    }

    # Send to backend
    try:
        res = requests.post(BACKEND_API_URL, json=payload)
        if res.status_code == 201:
            print(f"✅ Added: {payload['title']}")
        else:
            print(f"❌ Failed to add {payload['title']}: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Error sending {payload['title']}: {e}")

async def scrape_kasha():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        current_url = START_URL

        while current_url:
            print(f"\n🌐 Navigating to: {current_url}")
            await page.goto(current_url, timeout=60000)
            await page.wait_for_selector('.product-item__inner', timeout=15000)

            # Select all product cards
            product_cards = await page.query_selector_all('.product-item__inner')

            if not product_cards:
                print("⚠️ No products found on this page.")
                break

            for product in product_cards:
                await extract_and_send_product_data(product)

            # Check if there's a next page
            next_button = await page.query_selector('a.next')
            if next_button:
                next_href = await next_button.get_attribute("href")
                current_url = BASE_URL + next_href
            else:
                print("✅ Reached the last page.")
                break

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_kasha())
