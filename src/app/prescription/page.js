'use client';

import { useState, useRef } from 'react';

import { processImageOnServer } from './actions'; // Import the Server Action

export default function PrescriptionPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExtractedText('');
      setLoadingMessage('');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProcessPrescription = async () => {
    if (!imageFile) return;
    
    setLoading(true);
    setExtractedText('');
    setLoadingMessage('Extracting text from image...');

    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        // Call the imported Server Action
        const result = await processImageOnServer(formData);

        if (result.error) {
            throw new Error(result.error);
        }
        
        setExtractedText(result.text);
        setLoadingMessage('');

    } catch (error) {
        console.error("Error processing prescription:", error);
        setExtractedText('');
        setLoadingMessage(error.message || 'An error occurred while reading the image.');
    } finally {
        setLoading(false);
    }
  };
  
  const handleReset = () => {
      setImageFile(null);
      setImagePreview(null);
      setExtractedText('');
      setLoadingMessage('');
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const renderContent = () => {
      if (loading) {
          return (
             <div className="flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
                <p className="text-lg text-gray-300 capitalize">{loadingMessage}</p>
            </div>
          );
      }
      
      if (extractedText || loadingMessage) {
          return (
              <div className="w-full text-left">
                  <h2 className="text-2xl font-bold mb-4 text-center">Extracted Text</h2>
                  {extractedText && (
                    <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto text-gray-300 font-sans">
                        {extractedText}
                    </pre>
                  )}
                   {loadingMessage && <p className="text-red-400 text-center mt-4">{loadingMessage}</p>}
                  <div className="text-center mt-6">
                      <button onClick={handleReset} className="bg-white text-black px-8 py-2 rounded-md font-semibold hover:bg-gray-200">
                          Process Another Image
                      </button>
                  </div>
              </div>
          );
      }

      return (
        <div className="w-full text-center">
            {imagePreview ? (
                <div className="space-y-6">
                    <img src={imagePreview} alt="Prescription preview" className="max-h-64 mx-auto rounded-lg border-2 border-gray-700" />
                    <button 
                        onClick={handleProcessPrescription}
                        className="bg-white text-black px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition-transform hover:scale-105"
                    >
                       Extract Text
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current.click()}
                    className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                >
                    <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <h3 className="text-lg font-semibold">Upload an Image of the Prescription</h3>
                    <p className="text-gray-400">Click here to select a file</p>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
        </div>
      );
  }

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen flex flex-col">
      
      <main className="pt-16 flex-grow">
        <section className="text-center py-16 lg:py-24">
            <div className="container mx-auto px-4">
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
                    Prescription Text Extractor
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
                    Upload a photo of your prescription to extract all the text.
                </p>
            </div>
        </section>
        <section className="pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl min-h-[400px] flex items-center justify-center mx-auto bg-[#1A1A1A] p-8 rounded-2xl border border-gray-800 shadow-2xl shadow-purple-500/10">
                    {renderContent()}
                </div>
                 <p className="text-center text-xs text-gray-600 mt-4 max-w-2xl mx-auto">
                    Disclaimer: This tool uses AI to read text and may not be 100% accurate. Always double-check with the original image and consult a healthcare professional.
                </p>
            </div>
        </section>
      </main>
      
    </div>
  );
}
