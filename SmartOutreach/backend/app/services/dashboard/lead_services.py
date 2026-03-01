from serpapi import GoogleSearch
import os
from dotenv import load_dotenv

API_KEY = os.getenv("SERPAPI_KEY")

def search_google_maps(niche: str, city: str):
    params = {
        "engine": "google_maps",
        "q": f"{niche} in {city}",
        "api_key": API_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    
    # Izvlačimo samo bitne podatke iz gomile rezultata
    local_results = results.get("local_results", [])
    
    leads = []
    for place in local_results:
        leads.append({
            "title": place.get("title"),
            "address": place.get("address"),
            "phone": place.get("phone"),
            "website": place.get("website"),
            "rating": place.get("rating"),
            "reviews": place.get("reviews"),
            "category": place.get("type")
        })
    
    return leads