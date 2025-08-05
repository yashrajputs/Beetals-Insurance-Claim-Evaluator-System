import PyPDF2
import sys

def extract_text_from_pdf(pdf_path, output_path=None):
    """Extract text from PDF and optionally save to file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.extract_text()
            
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
    output_file = "extracted_text.txt"
    
    print(f"Extracting text from: {pdf_file}")
    text = extract_text_from_pdf(pdf_file, output_file)
    
    if text:
        print("Extraction completed successfully!")
        print(f"Total characters extracted: {len(text)}")
    else:
        print("Failed to extract text from PDF")
