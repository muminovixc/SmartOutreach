import re

def clean_gmail_body(text):
    if not text:
        return ""
    
    # 1. Uklanja Outlook "Get Outlook for iOS/Android" signature
    # Ovo se često pojavljuje prije samog citiranog teksta
    text = re.sub(r'(?i)Dohvati Outlook za (iOS|Android)<https://aka\.ms/.*?>', '', text)
    text = re.sub(r'(?i)Get Outlook for (iOS|Android)<https://aka\.ms/.*?>', '', text)

    # 2. Uklanja sve redove koji počinju sa '>' (klasični citati/replies)
    text = re.sub(r'(?m)^>.*$', '', text)
    
    # 3. Markeri za splitanje teksta (sve poslije ovoga se briše)
    marker_patterns = [
        # Outlook marker: horizontalna crta od donjih crta (barem 10+)
        r'________________________________', 
        
        # Outlook headeri (Šalje:, Poslano:, From:, Sent:)
        r'(?i)^Šalje: .*',
        r'(?i)^From: .*',
        
        # Standardni Gmail/Apple Mail markeri
        r'(?i)(.{0,100}(napisao je|wrote|sent|from):.*)', 
        r'(?i)(--+ original message --+)',
        r'(?i)(---------- forwarded message ----------)',
        
        # Slučaj kada Outlook ne stavi crtu ali krene sa "From:" u novom redu
        r'(?m)^From: .*\nSent: .*\nTo: .*'
    ]
    
    for pattern in marker_patterns:
        # Splitamo tekst i uzimamo samo ono što je bilo PRIJE markera
        parts = re.split(pattern, text, flags=re.MULTILINE)
        if parts:
            text = parts[0]
            
    # 4. Finalno čišćenje suvišnih praznina i "ostataka" od potpisa
    # (Opcionalno: ukloni "Zainteresiran sam" ako želiš samo tijelo, 
    # ali to je obično dio odgovora pa to ostavljamo)
    
    return text.strip()