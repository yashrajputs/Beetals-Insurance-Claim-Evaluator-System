import pdfplumber
import sys

def extract_text_with_pdfplumber(pdf_path, output_path=None):
    """Extract text from PDF using pdfplumber and optionally save to file"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            print(f"PDF has {len(pdf.pages)} pages")
            
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
                    text += "\n"
                else:
                    text += f"\n--- Page {page_num + 1} (No text found) ---\n"
        
        # If output path is specified, save to file
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(text)
            print(f"Text extracted and saved to: {output_path}")
        
        return text
        
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

if __name__ == "__main__":
    pdf_file = "test-policy.pdf"
    output_file = "extracted_text_pdfplumber.txt"
    
    print(f"Extracting text from: {pdf_file}")
    text = extract_text_with_pdfplumber(pdf_file, output_file)
    
    if text:
        print("Extraction completed successfully!")
        print(f"Total characters extracted: {len(text)}")
        # Show first 500 characters as preview
        print("\nPreview of extracted text:")
        print("-" * 50)
        print(text[:500])
        if len(text) > 500:
            print("...")
    else:
        print("Failed to extract text from PDF")
