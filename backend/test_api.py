#!/usr/bin/env python3
"""
Test script for the NutriApp API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_root_endpoint():
    """Test the root endpoint"""
    print("Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_get_alimenti():
    """Test getting alimenti list"""
    print("Testing get alimenti...")
    response = requests.get(f"{BASE_URL}/alimenti?limit=5")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total: {data['total']}")
        print(f"Retrieved: {len(data['data'])}")
        print("First 3 items:")
        for i, item in enumerate(data['data'][:3]):
            print(f"  {i+1}. {item['alimento']} - {item['kcal']} kcal")
    print()

def test_search_alimenti():
    """Test searching alimenti"""
    print("Testing search alimenti...")
    response = requests.get(f"{BASE_URL}/alimenti?search=mela&limit=3")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found: {len(data['data'])} items")
        for item in data['data']:
            print(f"  - {item['alimento']} - {item['kcal']} kcal")
    print()

def test_get_alimento_by_id():
    """Test getting a specific alimento by ID"""
    print("Testing get alimento by ID...")
    response = requests.get(f"{BASE_URL}/alimenti/1")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        item = response.json()
        print(f"Alimento: {item['alimento']}")
        print(f"Kcal: {item['kcal']}")
        print(f"Proteine: {item['proteine']}g")
        print(f"Lipidi: {item['lipidi']}g")
        print(f"Carboidrati: {item['carboidrati']}g")
        print(f"Fibre: {item['fibre']}g")
        print(f"Sorgente: {item['sorgente']}")
    print()

def test_create_alimento_minimal():
    """Test creating an alimento with minimal data"""
    print("Testing create alimento (minimal data)...")
    
    # Test data with only required field
    test_data = {
        "alimento": "Test Alimento Minimo"
    }
    
    response = requests.post(f"{BASE_URL}/alimenti", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Created ID: {result['data']['id']}")
        print(f"Alimento: {result['data']['alimento']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_create_alimento_complete():
    """Test creating an alimento with complete nutritional data"""
    print("Testing create alimento (complete data)...")
    
    # Test data with nutritional information
    test_data = {
        "alimento": "Test Alimento Completo",
        "sorgente": "Test API",
        "energia_kcal": 150.5,
        "proteine_totali_g": 12.3,
        "lipidi_totali_g": 5.7,
        "carboidrati_disponibili_g": 18.9,
        "fibra_alimentare_totale_g": 3.2
    }
    
    response = requests.post(f"{BASE_URL}/alimenti", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Created ID: {result['data']['id']}")
        print(f"Alimento: {result['data']['alimento']}")
        print(f"Kcal: {result['data']['kcal']}")
        print(f"Proteine: {result['data']['proteine']}g")
        print(f"Lipidi: {result['data']['lipidi']}g")
        print(f"Carboidrati: {result['data']['carboidrati']}g")
        print(f"Fibre: {result['data']['fibre']}g")
        print(f"Sorgente: {result['data']['sorgente']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_create_alimento_partial():
    """Test creating an alimento with partial nutritional data"""
    print("Testing create alimento (partial data)...")
    
    # Test data with only some nutritional fields
    test_data = {
        "alimento": "Test Alimento Parziale",
        "sorgente": "Test API",
        "energia_kcal": 200.0,
        "proteine_totali_g": 15.0,
        # Missing: lipidi, carboidrati, fibre
    }
    
    response = requests.post(f"{BASE_URL}/alimenti", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Created ID: {result['data']['id']}")
        print(f"Alimento: {result['data']['alimento']}")
        print(f"Kcal: {result['data']['kcal']}")
        print(f"Proteine: {result['data']['proteine']}g")
        print(f"Lipidi: {result['data']['lipidi']} (should be None)")
        print(f"Carboidrati: {result['data']['carboidrati']} (should be None)")
        print(f"Fibre: {result['data']['fibre']} (should be None)")
    else:
        print(f"Error: {response.text}")
    print()

# Pazienti tests
def test_get_pazienti():
    """Test getting pazienti list"""
    print("Testing get pazienti...")
    response = requests.get(f"{BASE_URL}/pazienti?limit=5")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total: {data['total']}")
        print(f"Retrieved: {len(data['data'])}")
        print("First 3 items:")
        for i, item in enumerate(data['data'][:3]):
            print(f"  {i+1}. {item['nome']} {item['cognome']} - {item['eta']} anni")
    print()

def test_search_pazienti():
    """Test searching pazienti"""
    print("Testing search pazienti...")
    response = requests.get(f"{BASE_URL}/pazienti?search=test&limit=3")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found: {len(data['data'])} items")
        for item in data['data']:
            print(f"  - {item['nome']} {item['cognome']} - {item['email']}")
    print()

def test_create_paziente_complete():
    """Test creating a paziente with complete data"""
    print("Testing create paziente (complete data)...")
    
    test_data = {
        "nome": "Mario",
        "cognome": "Rossi",
        "eta": 35,
        "email": "mario.rossi@email.com",
        "telefono": "+39 123 456 7890",
        "note": "Paziente per dieta dimagrante"
    }
    
    response = requests.post(f"{BASE_URL}/pazienti", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Created ID: {result['data']['id']}")
        print(f"Paziente: {result['data']['nome']} {result['data']['cognome']}")
        print(f"Età: {result['data']['eta']}")
        print(f"Email: {result['data']['email']}")
        print(f"Telefono: {result['data']['telefono']}")
        print(f"Note: {result['data']['note']}")
        return result['data']['id']  # Return ID for update/delete tests
    else:
        print(f"Error: {response.text}")
        return None
    print()

def test_create_paziente_minimal():
    """Test creating a paziente with minimal data"""
    print("Testing create paziente (minimal data)...")
    
    test_data = {
        "nome": "Giulia",
        "cognome": "Bianchi"
    }
    
    response = requests.post(f"{BASE_URL}/pazienti", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Created ID: {result['data']['id']}")
        print(f"Paziente: {result['data']['nome']} {result['data']['cognome']}")
        print(f"Età: {result['data']['eta']} (should be None)")
        print(f"Email: {result['data']['email']} (should be None)")
    else:
        print(f"Error: {response.text}")
    print()

def test_get_paziente_by_id(paziente_id):
    """Test getting a specific paziente by ID"""
    print(f"Testing get paziente by ID ({paziente_id})...")
    response = requests.get(f"{BASE_URL}/pazienti/{paziente_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        item = response.json()
        print(f"Paziente: {item['nome']} {item['cognome']}")
        print(f"Età: {item['eta']}")
        print(f"Email: {item['email']}")
        print(f"Telefono: {item['telefono']}")
        print(f"Note: {item['note']}")
        print(f"Creato il: {item['created_at']}")
        print(f"Aggiornato il: {item['updated_at']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_update_paziente(paziente_id):
    """Test updating a paziente"""
    print(f"Testing update paziente ({paziente_id})...")
    
    update_data = {
        "eta": 36,
        "note": "Paziente per dieta dimagrante - aggiornato"
    }
    
    response = requests.put(f"{BASE_URL}/pazienti/{paziente_id}", json=update_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Updated paziente: {result['data']['nome']} {result['data']['cognome']}")
        print(f"New age: {result['data']['eta']}")
        print(f"New notes: {result['data']['note']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_delete_paziente(paziente_id):
    """Test deleting a paziente"""
    print(f"Testing delete paziente ({paziente_id})...")
    
    response = requests.delete(f"{BASE_URL}/pazienti/{paziente_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_get_nonexistent_paziente():
    """Test getting a paziente that doesn't exist"""
    print("Testing get non-existent paziente...")
    response = requests.get(f"{BASE_URL}/pazienti/99999")
    print(f"Status: {response.status_code}")
    if response.status_code == 404:
        print("Correctly returned 404 for non-existent paziente")
    else:
        print(f"Unexpected response: {response.text}")
    print()

# Diet tests
def test_get_paziente_dieta():
    """Test getting diet data for a paziente"""
    print("Testing get paziente dieta...")
    paziente_id = 1  # Mario Rossi has sample diet data
    
    response = requests.get(f"{BASE_URL}/pazienti/{paziente_id}/dieta")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        
        dieta = result['data']
        print(f"\n📊 Dieta per paziente {paziente_id}:")
        print(f"   Totale giornaliero: {dieta['totale_giornaliero']['totale_kcal']} kcal")
        print(f"   Colazione: {len(dieta['colazione']['alimenti'])} alimenti")
        print(f"   Pranzo: {len(dieta['pranzo']['alimenti'])} alimenti")
        print(f"   Cena: {len(dieta['cena']['alimenti'])} alimenti")
    else:
        print(f"Error: {response.text}")
    print()

def test_add_alimento_to_pasto():
    """Test adding a food item to a meal"""
    print("Testing add alimento to pasto...")
    paziente_id = 1
    pasto = "spuntino"
    
    # New food item to add
    nuovo_alimento = {
        "id": 15,
        "nome": "Mandorle",
        "quantita": 30,
        "unita": "g",
        "kcal": 180,
        "proteine": 6.0,
        "lipidi": 16.0,
        "carboidrati": 6.0,
        "fibre": 3.0
    }
    
    response = requests.post(
        f"{BASE_URL}/pazienti/{paziente_id}/dieta/{pasto}/alimenti",
        json=nuovo_alimento
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        
        dieta = result['data']
        spuntino = dieta['spuntino']
        print(f"\n🥜 Mandorle aggiunte allo spuntino!")
        print(f"   Nuovo totale spuntino: {spuntino['totale_kcal']} kcal")
        print(f"   Nuovo totale giornaliero: {dieta['totale_giornaliero']['totale_kcal']} kcal")
    else:
        print(f"Error: {response.text}")
    print()

if __name__ == "__main__":
    print("=== NutriApp API Test ===\n")
    
    try:
        test_root_endpoint()
        test_health_check()
        
        print("=== Testing ALIMENTI endpoints ===\n")
        test_get_alimenti()
        test_search_alimenti()
        test_get_alimento_by_id()
        
        print("=== Testing CREATE ALIMENTI endpoints ===\n")
        test_create_alimento_minimal()
        test_create_alimento_complete()
        test_create_alimento_partial()
        
        print("=== Testing PAZIENTI endpoints ===\n")
        test_get_pazienti()
        test_search_pazienti()
        test_create_paziente_minimal()
        
        # Test complete CRUD operations
        paziente_id = test_create_paziente_complete()
        if paziente_id:
            test_get_paziente_by_id(paziente_id)
            test_update_paziente(paziente_id)
            test_delete_paziente(paziente_id)
        
        test_get_nonexistent_paziente()
        
        print("=== Testing DIETA endpoints ===\n")
        test_get_paziente_dieta()
        test_add_alimento_to_pasto()
        
        print("🎉 All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"Error during testing: {e}") 