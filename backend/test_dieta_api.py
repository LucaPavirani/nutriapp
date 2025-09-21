import requests
import json
import sys

# API endpoint
BASE_URL = "http://localhost:8000"

def get_patient_diet(patient_id):
    """Get a patient's diet"""
    response = requests.get(f"{BASE_URL}/pazienti/{patient_id}/dieta")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error getting diet: {response.status_code} - {response.text}")
        return None

def update_patient_diet(patient_id, diet_data):
    """Update a patient's diet"""
    response = requests.put(
        f"{BASE_URL}/pazienti/{patient_id}/dieta", 
        json={"dieta": diet_data}
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error updating diet: {response.status_code} - {response.text}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_dieta_api.py <patient_id>")
        return
    
    try:
        patient_id = int(sys.argv[1])
    except ValueError:
        print("Patient ID must be a number")
        return
    
    # Get current diet
    diet_response = get_patient_diet(patient_id)
    if not diet_response or not diet_response.get("success"):
        print("Failed to get diet data")
        return
    
    diet_data = diet_response["data"]
    
    # Add notes to each meal
    diet_data["colazione"]["note"] = "Preferire cereali integrali e frutta fresca."
    diet_data["spuntino"]["note"] = "Scegliere frutta secca o uno yogurt magro."
    diet_data["pranzo"]["note"] = "Abbondare con le verdure e limitare i condimenti."
    diet_data["merenda"]["note"] = "Ottima una spremuta o un frutto di stagione."
    diet_data["cena"]["note"] = "Preferire proteine magre e verdure cotte."
    
    # Update diet with notes
    update_response = update_patient_diet(patient_id, diet_data)
    
    if update_response and update_response.get("success"):
        print("Diet updated successfully with notes!")
        
        # Print the updated diet
        print("\nUpdated Diet with Notes:")
        for meal_name in ["colazione", "spuntino", "pranzo", "merenda", "cena"]:
            meal = update_response["data"][meal_name]
            print(f"\n{meal_name.upper()}:")
            print(f"Note: {meal.get('note', 'No note')}")
            print(f"Total calories: {meal['totale_kcal']}")
    else:
        print("Failed to update diet")

if __name__ == "__main__":
    main()