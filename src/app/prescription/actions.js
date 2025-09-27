'use server';

// This function now lives in its own file and is explicitly marked as a server-side action.
export async function processImageOnServer(formData) {
    try {
        const file = formData.get('file');
        if (!file || file.size === 0) {
            return { error: 'No file uploaded.' };
        }

        // This logic runs securely on the server.
        const ocrFormData = new FormData();
        ocrFormData.append('file', file);
        ocrFormData.append('apikey', 'K87893322888957'); // The API key remains safe on the server.
        ocrFormData.append('language', 'eng');
        // Use OCR Engine 2 for better handwriting recognition
        ocrFormData.append('OCREngine', '2');

        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: ocrFormData,
        });

        if (!ocrResponse.ok) {
            const errorText = await ocrResponse.text();
            console.error('OCR API Error:', errorText);
            return { error: `OCR API request failed: ${ocrResponse.statusText}` };
        }

        const ocrData = await ocrResponse.json();
        
        // Handle potential errors from the OCR service
        if (ocrData.IsErroredOnProcessing || !ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
            return { error: ocrData.ErrorMessage || 'Could not process the image.' };
        }
        
        const text = ocrData.ParsedResults[0].ParsedText;
        if (!text) {
             return { error: 'No text could be extracted from the image.' };
        }

        // Filter the extracted text to only include lines with medicine-related keywords
        const lines = text.split('\n');
        const medicineKeywords = [
            'tab', 'tablet', 'cap', 'capsule', 'syr', 'syrup', 
            'inj', 'injection', 'oint', 'ointment', 'cream', 
            'lotion', 'drops', 'mg', 'ml', 'g', 'mcg',
            'suspension', 'powder', 'gel'
        ];

        // Add a list of unwanted keywords to filter out common non-medicine lines
        const unwantedKeywords = [
            'age', 'sex', 'date', 'name', 'patient', 
            'doctor', 'dr.', 'rx', 'signature', 'address'
        ];

        const filteredLines = lines.filter(line => {
            const lowerLine = line.toLowerCase();
            
            // The line must contain a medicine keyword
            const hasMedicineKeyword = medicineKeywords.some(keyword => lowerLine.includes(keyword));
            
            // But it must NOT contain any unwanted keywords
            const hasUnwantedKeyword = unwantedKeywords.some(keyword => lowerLine.includes(keyword));

            return hasMedicineKeyword && !hasUnwantedKeyword;
        });

        const filteredText = filteredLines.join('\n');

        // Return the filtered text to the client
        return { text: filteredText };

    } catch (error) {
        console.error('Internal Server Error in Server Action:', error);
        return { error: 'An internal server error occurred.' };
    }
}
