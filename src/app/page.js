'use client';


import { useState, useRef } from 'react';

// Icon component for the result cards
const ResultIcon = ({ status }) => {
    if (status === 'Authentic') {
        return (
            <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        );
    }
    if (status === 'Counterfeit') {
        return (
            <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        );
    }
    return (
       <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    );
};


export default function HomePage() {
  const [medicineName, setMedicineName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // To store the actual file for upload

  const fileInputRef = useRef(null);

  const verifyWithRxNorm = async (text) => {
    if (!text || text.trim().length < 3) { // Ignore very short words
        return { found: false, name: null };
    }
    
    // Split the text into individual words to check each one.
    const words = text.trim().split(/[\s\n\r,.]+/);

    for (const word of words) {
        // A simple filter for common non-drug words to reduce API calls
        if (word.length < 3 || !isNaN(word)) continue;
        
        try {
            const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${word}`);
            if (!response.ok) continue; // Try the next word if API fails
            const data = await response.json();
            if (data.drugGroup?.conceptGroup) {
                const match = data.drugGroup.conceptGroup.some(group => 
                    group.conceptProperties?.some(prop => prop.name.toLowerCase().includes(word.toLowerCase()))
                );
                // If a match is found for any word, return immediately as authentic.
                if (match) return { found: true, name: word };
            }
        } catch (error) {
            console.error(`RxNorm API request failed for word "${word}":`, error);
        }
    }
    // If the loop completes without finding any valid drug name
    return { found: false, name: text };
  };

  const handleCheckAuthenticity = async (e) => {
    e.preventDefault();
    
    if (!medicineName && !imageFile) {
        setResult({ status: 'Uncertain', message: 'Please enter a medicine name or upload an image.' });
        return;
    }

    setLoading(true);
    setResult(null);
    let textToVerify = medicineName;

    try {
        if (imageFile) {
            setLoadingMessage('Uploading and analyzing image...');
            const ocrApiKey = 'K87893322888957'; 
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('apikey', ocrApiKey);
            formData.append('language', 'eng');

            const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData,
            });

            if (!ocrResponse.ok) {
                throw new Error('Image analysis API request failed.');
            }

            const ocrData = await ocrResponse.json();
            
            if (ocrData.IsErroredOnProcessing || !ocrData.ParsedResults?.length) {
                 setResult({ status: 'Uncertain', message: `Could not analyze image. ${ocrData.ErrorMessage || 'Please try a clearer picture.'}` });
                 setLoading(false);
                 return;
            }

            textToVerify = ocrData.ParsedResults[0].ParsedText.trim();

            if(!textToVerify) {
                 setResult({ status: 'Uncertain', message: 'Could not read any text from the image. Please try a clearer picture or type the name manually.' });
                 setLoading(false);
                 return;
            }
        }
        
        setLoadingMessage('Verifying with RxNorm database...');
        const verification = await verifyWithRxNorm(textToVerify);

        if (verification.found) {
             setResult({ status: 'Authentic', message: `Verified: "${verification.name}" appears to be an authentic medication name found in the RxNorm database.` });
        } else {
             setResult({ status: 'Counterfeit', message: `Warning: No recognized drug name was found in the text "${textToVerify}". Please check the spelling or be cautious.` });
        }
    } catch (error) {
        console.error(error);
        setResult({ status: 'Uncertain', message: 'An error occurred during verification. Please check your network connection.' });
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResult(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMedicineName('');
    }
  };

  const handleReset = () => {
    setMedicineName('');
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
     if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const getResultCardColor = () => {
      if (!result) return 'border-gray-700';
      switch (result.status) {
          case 'Authentic': return 'border-green-500 bg-green-500/10';
          case 'Counterfeit': return 'border-red-500 bg-red-500/10';
          default: return 'border-yellow-500 bg-yellow-500/10';
      }
  };

  const renderImageSection = () => {
    if (imagePreview) {
         return <img src={imagePreview} alt="Medicine preview" className="max-h-48 mx-auto rounded-lg" />;
    }
    return (
        <>
            <div 
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
            >
                <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <h3 className="text-md font-semibold">Upload an image</h3>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
        </>
    );
  };
  
  const renderContent = () => {
      if (result) {
        return (
            <div className={`text-center p-6 rounded-lg border-2 w-full ${getResultCardColor()}`}>
                <div className="flex flex-col items-center space-y-4">
                    <ResultIcon status={result.status} />
                    <h2 className="text-3xl font-bold">{result.status}</h2>
                    <p className="text-gray-300 max-w-md">{result.message}</p>
                    <button onClick={handleReset} className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-200">
                        Check Another
                    </button>
                </div>
            </div>
        );
      }

      if (loading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[150px]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
                <p className="text-lg text-gray-300 capitalize">{loadingMessage}</p>
            </div>
        );
      }
      
      return (
        <form onSubmit={handleCheckAuthenticity} className="w-full text-center space-y-6">
            <div>
                 <label className="text-xl font-semibold mb-2 block">Enter Medicine Name</label>
                 <p className="text-gray-400 mb-4">Type the name from the packaging to verify.</p>
                 <input 
                    type="text"
                    value={medicineName}
                    onChange={(e) => { setMedicineName(e.target.value); setImageFile(null); setImagePreview(null); }}
                    placeholder="e.g., Aspirin"
                    disabled={!!imagePreview}
                    className="w-full max-w-md mx-auto px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <hr className="w-full border-gray-700"/>
                <span className="text-gray-400">OR</span>
                <hr className="w-full border-gray-700"/>
            </div>

            <div className="w-full max-w-md mx-auto">
                 {renderImageSection()}
            </div>

            <button 
                type="submit"
                className="bg-white text-black px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition-transform hover:scale-105 disabled:opacity-60 disabled:scale-100"
                disabled={!medicineName && !imagePreview}
            >
                Verify
            </button>
        </form>
      );
  }

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen flex flex-col">
      
      <main className="pt-16 flex-grow">
        <section className="text-center py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="w-full h-24 bg-gradient-to-r from-purple-600 to-blue-500 blur-3xl opacity-20 absolute top-10 left-0"></div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
                    Verify Your Medication Instantly
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
                    Type in your medicine's name or upload an image of the packaging to check its authenticity.
                </p>
            </div>
        </section>
        <section className="pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl min-h-[400px] flex items-center justify-center mx-auto bg-[#1A1A1A] p-8 rounded-2xl border border-gray-800 shadow-2xl shadow-purple-500/10">
                    {renderContent()}
                </div>
                 <p className="text-center text-xs text-gray-600 mt-4 max-w-2xl mx-auto">
                    Disclaimer: This tool checks for the existence of a drug name in the NIH RxNorm database. It cannot verify batch numbers or the physical properties of the medication. This service is for informational purposes and is not a substitute for professional medical advice.
                </p>
            </div>
        </section>
      </main>
      
    </div>
  );
}

