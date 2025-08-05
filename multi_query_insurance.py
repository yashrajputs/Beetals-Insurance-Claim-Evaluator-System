import os
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify
import faiss
import requests

app = Flask(__name__)

# Load the model for embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

# Parse PDFs
pdf_dir = './pdfs/'
pdf_texts = []
for pdf_file in os.listdir(pdf_dir):
    if pdf_file.endswith('.pdf'):
        with fitz.open(os.path.join(pdf_dir, pdf_file)) as doc:
            for page in doc:
                pdf_texts.append(page.get_text())

# Embed and index with FAISS
embedded_texts = model.encode(pdf_texts)
dimension = embedded_texts.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embedded_texts)

# Flask endpoint
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json.get('queries')
    responses = []
    for query in data:
        query_vec = model.encode([query])[0]
        D, I = index.search(query_vec.reshape(1, -1), k=1)
        matched_text = pdf_texts[I[0][0]] if I.size > 0 else "No match found."
        responses.append(matched_text)
    return jsonify(responses)

# Main bootloader
if __name__ == '__main__':
    app.run(debug=True)
