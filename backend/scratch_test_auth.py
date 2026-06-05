import requests

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    # 1. Register a new user
    import time
    email = f"test_{int(time.time())}@example.com"
    reg_data = {
        "username": "Test User",
        "email": email,
        "password": "password123"
    }
    print(f"Registering {email}...")
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print("Register Status:", r.status_code)
    print("Register Response:", r.json())
    
    if r.status_code != 201:
        return
        
    # 2. Login
    login_data = {
        "email": email,
        "password": "password123"
    }
    print("Logging in...")
    r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print("Login Status:", r.status_code)
    print("Login Response:", r.json())
    
    if r.status_code != 200:
        return
        
    token = r.json()["access_token"]
    
    # 3. Get students
    print("Getting students...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/students", headers=headers)
    print("Get Students Status:", r.status_code)
    print("Get Students Response:", r.json())

if __name__ == "__main__":
    test_flow()
