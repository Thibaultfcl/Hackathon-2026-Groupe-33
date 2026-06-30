import json
import os
import re
import hashlib
from tqdm import tqdm

# ============================================================
# CONFIGURATION
# ============================================================
INPUT_FILE = "data/raw/medical_raw.json"
OUTPUT_FILE = "data/processed/medical_clean.json"
MIN_RESPONSE_LENGTH = 20
SIMILARITY_THRESHOLD = 0.9

# ============================================================
# ÉTAPE 1 — Chargement
# ============================================================
print("\n📂 ÉTAPE 1 — Chargement du dataset...")
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"✅ {len(data)} samples chargés")

stats = {"total_initial": len(data)}

# ============================================================
# ÉTAPE 2 — Suppression doublons exacts
# ============================================================
print("\n🔍 ÉTAPE 2 — Suppression doublons exacts...")
seen = set()
deduped = []
for item in tqdm(data):
    key = hashlib.md5((item["instruction"] + item["response"]).encode()).hexdigest()
    if key not in seen:
        seen.add(key)
        deduped.append(item)

stats["apres_dedup_exacts"] = len(deduped)
print(f"✅ {len(data) - len(deduped)} doublons exacts supprimés → {len(deduped)} restants")

# ============================================================
# ÉTAPE 3 — Filtrage réponses trop courtes
# ============================================================
print("\n📏 ÉTAPE 3 — Filtrage réponses < 20 caractères...")
filtered = [item for item in deduped if len(item["response"].strip()) >= MIN_RESPONSE_LENGTH]
stats["apres_filtre_longueur"] = len(filtered)
print(f"✅ {len(deduped) - len(filtered)} samples trop courts supprimés → {len(filtered)} restants")

# ============================================================
# ÉTAPE 4 — Suppression PII
# ============================================================
print("\n🔒 ÉTAPE 4 — Détection et suppression PII...")

PII_PATTERNS = [
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
    (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE]'),
    (r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '[IP]'),
    (r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]'),
    (r'\bMRN[\s:]?\w+\b', '[MRN]'),
    (r'\bDOB[\s:]?\d{4}-\d{2}-\d{2}\b', '[DOB]'),
]

def remove_pii(text):
    for pattern, replacement in PII_PATTERNS:
        text = re.sub(pattern, replacement, text)
    return text

clean_pii = []
pii_count = 0
for item in tqdm(filtered):
    new_instruction = remove_pii(item["instruction"])
    new_response = remove_pii(item["response"])
    if new_instruction != item["instruction"] or new_response != item["response"]:
        pii_count += 1
    clean_pii.append({
        "instruction": new_instruction,
        "response": new_response
    })

stats["apres_filtre_pii"] = len(clean_pii)
stats["samples_avec_pii_nettoyes"] = pii_count
print(f"✅ {pii_count} samples contenaient des PII → anonymisés")
print(f"✅ {len(clean_pii)} samples restants")

# ============================================================
# ÉTAPE 5 — Split train/val 90/10

print("\n✂️ ÉTAPE 5 — Split train/val 90/10...")
split_idx = int(len(clean_pii) * 0.9)
train_data = clean_pii[:split_idx]
val_data = clean_pii[split_idx:]

stats["train_samples"] = len(train_data)
stats["val_samples"] = len(val_data)
print(f"✅ Train : {len(train_data)} samples")
print(f"✅ Val   : {len(val_data)} samples")


# ÉTAPE 6 — Sauvegarde

print("\n💾 ÉTAPE 6 — Sauvegarde...")
os.makedirs("data/processed", exist_ok=True)

output = {"train": train_data, "val": val_data}
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ Sauvegardé dans {OUTPUT_FILE}")

# RÉSUMÉ FINAL
print("\n" + "="*50)
print(" RÉSUMÉ DU NETTOYAGE")
print("="*50)
for k, v in stats.items():
    print(f"  {k}: {v}")
print("="*50)