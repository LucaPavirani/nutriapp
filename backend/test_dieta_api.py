#!/usr/bin/env python3
"""
Test script for the NutriApp Diet API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

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
        print(f"\n📊 Dieta per {paziente_id}:")
        print(f"   Colazione: {len(dieta['colazione']['alimenti'])} alimenti, {dieta['colazione']['totale_kcal']} kcal")
        print(f"   Spuntino: {len(dieta['spuntino']['alimenti'])} alimenti, {dieta['spuntino']['totale_kcal']} kcal")
        print(f"   Pranzo: {len(dieta['pranzo']['alimenti'])} alimenti, {dieta['pranzo']['totale_kcal']} kcal")
        print(f"   Merenda: {len(dieta['merenda']['alimenti'])} alimenti, {dieta['merenda']['totale_kcal']} kcal")
        print(f"   Cena: {len(dieta['cena']['alimenti'])} alimenti, {dieta['cena']['totale_kcal']} kcal")
        print(f"   Totale giornaliero: {dieta['totale_giornaliero']['totale_kcal']} kcal")
        
        # Show some food details
        print(f"\n🍽️  Esempi di alimenti:")
        for pasto_name, pasto_data in dieta.items():
            if pasto_name != "totale_giornaliero" and pasto_data['alimenti']:
                print(f"   {pasto_name.capitalize()}:")
                for alimento in pasto_data['alimenti'][:2]:  # Show first 2 foods
                    print(f"     - {alimento['nome']} ({alimento['quantita']}{alimento['unita']}) - {alimento['kcal']} kcal")
    else:
        print(f"Error: {response.text}")
    print()

def test_add_alimento_to_pasto():
    """Test adding a food item to a meal"""
    print("Testing add alimento to pasto...")
    paziente_id = 1
    pasto = "colazione"
    
    # New food item to add
    nuovo_alimento = {
        "id": 9,
        "nome": "Banana",
        "quantita": 120,
        "unita": "g",
        "kcal": 105,
        "proteine": 1.3,
        "lipidi": 0.4,
        "carboidrati": 27.0,
        "fibre": 3.1
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
        colazione = dieta['colazione']
        print(f"\n🍌 Banana aggiunta alla colazione!")
        print(f"   Nuovo totale colazione: {colazione['totale_kcal']} kcal")
        print(f"   Nuovo totale giornaliero: {dieta['totale_giornaliero']['totale_kcal']} kcal")
        print(f"   Alimenti nella colazione: {len(colazione['alimenti'])}")
    else:
        print(f"Error: {response.text}")
    print()

def test_update_complete_dieta():
    """Test updating the complete diet"""
    print("Testing update complete dieta...")
    paziente_id = 2  # Use paziente 2 (Giulia Bianchi)
    
    # Create a new complete diet
    nuova_dieta = {
        "colazione": {
            "alimenti": [
                {
                    "id": 10,
                    "nome": "Caffè",
                    "quantita": 30,
                    "unita": "ml",
                    "kcal": 2,
                    "proteine": 0.3,
                    "lipidi": 0.1,
                    "carboidrati": 0.2,
                    "fibre": 0
                },
                {
                    "id": 11,
                    "nome": "Biscotti integrali",
                    "quantita": 40,
                    "unita": "g",
                    "kcal": 160,
                    "proteine": 4.0,
                    "lipidi": 6.0,
                    "carboidrati": 24.0,
                    "fibre": 2.0
                }
            ],
            "totale_kcal": 162,
            "totale_proteine": 4.3,
            "totale_lipidi": 6.1,
            "totale_carboidrati": 24.2,
            "totale_fibre": 2.0
        },
        "spuntino": {
            "alimenti": [],
            "totale_kcal": 0,
            "totale_proteine": 0,
            "totale_lipidi": 0,
            "totale_carboidrati": 0,
            "totale_fibre": 0
        },
        "pranzo": {
            "alimenti": [
                {
                    "id": 12,
                    "nome": "Riso integrale",
                    "quantita": 100,
                    "unita": "g",
                    "kcal": 350,
                    "proteine": 7.0,
                    "lipidi": 2.0,
                    "carboidrati": 72.0,
                    "fibre": 3.5
                }
            ],
            "totale_kcal": 350,
            "totale_proteine": 7.0,
            "totale_lipidi": 2.0,
            "totale_carboidrati": 72.0,
            "totale_fibre": 3.5
        },
        "merenda": {
            "alimenti": [],
            "totale_kcal": 0,
            "totale_proteine": 0,
            "totale_lipidi": 0,
            "totale_carboidrati": 0,
            "totale_fibre": 0
        },
        "cena": {
            "alimenti": [
                {
                    "id": 13,
                    "nome": "Salmone",
                    "quantita": 150,
                    "unita": "g",
                    "kcal": 280,
                    "proteine": 35.0,
                    "lipidi": 15.0,
                    "carboidrati": 0,
                    "fibre": 0
                }
            ],
            "totale_kcal": 280,
            "totale_proteine": 35.0,
            "totale_lipidi": 15.0,
            "totale_carboidrati": 0,
            "totale_fibre": 0
        },
        "totale_giornaliero": {
            "totale_kcal": 792,
            "totale_proteine": 46.3,
            "totale_lipidi": 23.1,
            "totale_carboidrati": 96.2,
            "totale_fibre": 5.5
        }
    }
    
    response = requests.put(
        f"{BASE_URL}/pazienti/{paziente_id}/dieta",
        json={"dieta": nuova_dieta}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        
        dieta = result['data']
        print(f"\n📊 Nuova dieta creata per paziente {paziente_id}:")
        print(f"   Totale giornaliero: {dieta['totale_giornaliero']['totale_kcal']} kcal")
        print(f"   Proteine: {dieta['totale_giornaliero']['totale_proteine']}g")
        print(f"   Lipidi: {dieta['totale_giornaliero']['totale_lipidi']}g")
        print(f"   Carboidrati: {dieta['totale_giornaliero']['totale_carboidrati']}g")
        print(f"   Fibre: {dieta['totale_giornaliero']['totale_fibre']}g")
    else:
        print(f"Error: {response.text}")
    print()

def test_invalid_pasto():
    """Test adding alimento to invalid pasto"""
    print("Testing invalid pasto name...")
    paziente_id = 1
    invalid_pasto = "invalid_pasto"
    
    alimento_data = {
        "id": 14,
        "nome": "Test alimento",
        "quantita": 100,
        "unita": "g",
        "kcal": 100,
        "proteine": 5.0,
        "lipidi": 2.0,
        "carboidrati": 15.0,
        "fibre": 2.0
    }
    
    response = requests.post(
        f"{BASE_URL}/pazienti/{paziente_id}/dieta/{invalid_pasto}/alimenti",
        json=alimento_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 400:
        print("✅ Correctly returned 400 for invalid pasto name")
        error_data = response.json()
        print(f"   Error: {error_data['detail']}")
    else:
        print(f"❌ Unexpected response: {response.text}")
    print()

def test_nonexistent_paziente():
    """Test diet operations with non-existent paziente"""
    print("Testing non-existent paziente...")
    paziente_id = 99999
    
    response = requests.get(f"{BASE_URL}/pazienti/{paziente_id}/dieta")
    print(f"Status: {response.status_code}")
    if response.status_code == 404:
        print("✅ Correctly returned 404 for non-existent paziente")
    else:
        print(f"❌ Unexpected response: {response.text}")
    print()

if __name__ == "__main__":
    print("=== NutriApp Diet API Test ===\n")
    
    try:
        test_get_paziente_dieta()
        test_add_alimento_to_pasto()
        test_update_complete_dieta()
        test_invalid_pasto()
        test_nonexistent_paziente()
        
        print("🎉 All diet API tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"Error during testing: {e}") 