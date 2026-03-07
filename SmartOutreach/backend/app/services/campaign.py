import re
import datetime

def clean_gmail_body(text):
    if not text:
        return ""
    
    # 1. Uklanja sve redove koji počinju sa '>' (klasični citati)
    text = re.sub(r'(?m)^>.*$', '', text)
    
    # 2. Glavni Regex za marker: prepoznaje "Dan, datum u vrijeme <email> napisao je:"
    # Pokriva i hrvatski i engleski format
    marker_patterns = [
        r'(?i)(.{0,100}(napisao je|wrote|sent|from):.*)', # Traži bilo šta što završava sa "napisao je:" ili "wrote:"
        r'(?i)(--+ original message --+)',
        r'(?i)(---------- forwarded message ----------)'
    ]
    
    for pattern in marker_patterns:
        # Splitamo tekst na prvi pronalazak markera i uzimamo samo prvi dio (prije markera)
        parts = re.split(pattern, text)
        if parts:
            text = parts[0]
            
    # 3. Čišćenje praznih redova na početku i kraju
    return text.strip()