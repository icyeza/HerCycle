import requests

API_URL = "http://localhost:5000/api/products"  # Update this if needed

def delete_all_products():
    try:
        response = requests.delete(API_URL)

        if response.status_code == 200:
            print(response.json().get('msg', 'All products deleted.'))
        else:
            print(f"Failed to delete products: {response.status_code}")
            print(response.text)

    except requests.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    delete_all_products()
