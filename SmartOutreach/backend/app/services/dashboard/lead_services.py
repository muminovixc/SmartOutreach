from serpapi import GoogleSearch
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import re




API_KEY = os.getenv("SERPAPI_KEY")

def search_google_maps(niche: str, city: str):
    params = {
        "engine": "google_maps",
        "q": f"{niche} in {city}",
        "api_key": API_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    
    
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


async def scrape_lead_info(url: str):
    """Izvlači email i tekstualni sadržaj sa sajta za personalizaciju."""
    if not url or url == "No website":
        return "no email", ""
    
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        async with httpx.AsyncClient(timeout=7.0, follow_redirects=True) as client:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                return "no email", ""
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            
            email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            emails = re.findall(email_regex, response.text)
            valid_emails = [e for e in emails if not e.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg'))]
            found_email = valid_emails[0] if valid_emails else "no email"

           
            for script in soup(["script", "style"]):
                script.decompose()
            
            
            text_content = soup.get_text(separator=' ', strip=True)[:2000]
            
            return found_email, text_content
    except Exception as e:
        print(f"Scrape error: {e}")
        return "no email", ""