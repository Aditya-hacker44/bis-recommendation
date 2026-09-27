import json
import os
import faiss
import numpy as np
import time
from sentence_transformers import SentenceTransformer

DATA_FILE = "data/processed/normalized_standards.json"
VECTOR_DIR = "data/vector_store"
MODEL_NAME = "all-MiniLM-L6-v2" # Local sentence-transformers model

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def build_index():
    print(f"Loading local model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"Loading data from {DATA_FILE}...")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    texts = []
    metadata = []
    
    for record in data:
        # validate record
        if "id" not in record or "search_text" not in record:
            continue
            
        texts.append(record['search_text'])
        metadata.append({
            "id": record["id"],
            "is_number": record.get("is_number"),
            "title": record.get("title"),
            "department": record.get("department"),
            "category": record.get("category"),
            "status": record.get("status"),
            "edition": record.get("edition"),
            "source_record_id": record.get("source_record_id"),
            "source_file": record.get("source_file")
        })
        
    total_records = len(texts)
    print(f"Found {total_records} valid records to index.")
    
    print("Generating embeddings (this may take a minute locally)...")
    start_time = time.time()
    
    # SentenceTransformer handles batching efficiently
    embeddings = model.encode(texts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype='float32')
    
    print("Building FAISS index...")
    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d) # Inner product with normalized vectors = cosine similarity
    index.add(embeddings)
    
    ensure_dir(VECTOR_DIR)
    
    print("Saving index and metadata...")
    faiss.write_index(index, os.path.join(VECTOR_DIR, "faiss_index.bin"))
    
    with open(os.path.join(VECTOR_DIR, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False)
        
    config = {
        "model_name": MODEL_NAME,
        "dimension": d,
        "metric": "cosine",
        "index_type": "IndexFlatIP",
        "indexed_records": total_records
    }
    
    with open(os.path.join(VECTOR_DIR, "config.json"), "w", encoding="utf-8") as f:
        json.dump(config, f)
        
    print(f"Successfully indexed {total_records} records in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    build_index()
