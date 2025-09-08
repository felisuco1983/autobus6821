import os, json

PARADAS_DIR = "paradas_json"
salida = {"paradas": []}

for fname in os.listdir(PARADAS_DIR):
    if fname.endswith(".json") and fname != "index.json":
        nombre = fname[:-5]  # quitar .json
        salida["paradas"].append(nombre)

with open(os.path.join(PARADAS_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(salida, f, ensure_ascii=False, indent=2)

print(f"✅ Generado index.json con {len(salida['paradas'])} paradas")
