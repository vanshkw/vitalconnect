'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, UploadCloud, Loader2, FileText, RotateCcw } from 'lucide-react';
import { processImageOnServer } from './actions'; // Assuming your Server Action is in './actions'

// === UI Helper: Navbar Component ===
const Navbar = () => (
    <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <HeartPulse className="text-violet-400" size={28} />
                <span className="text-xl font-bold text-white">VitalConnect</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-gray-300">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#" className="hover:text-white transition-colors">Info</a>
                <a href="#" className="hover:text-white transition-colors">Medstores Nearby</a>
            </div>
            <button className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
                Check Availability
            </button>
        </nav>
    </header>
);

export default function PrescriptionPage() {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError('');
            setExtractedText('');
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProcessPrescription = async () => {
        if (!imageFile) return;
        
        setLoading(true);
        setExtractedText('');
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            const result = await processImageOnServer(formData);

            if (result.error) throw new Error(result.error);
            
            setExtractedText(result.text);

        } catch (err) {
            console.error("Error processing prescription:", err);
            setError(err.message || 'An error occurred while reading the image.');
        } finally {
            setLoading(false);
        }
    };
  
    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setExtractedText('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
               <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-400" />
                  <p className="text-lg text-gray-300">Extracting text from image...</p>
              </div>
            );
        }
        
        if (extractedText || error) {
            return (
                <div className="w-full text-left">
                    <h2 className="text-2xl font-bold mb-4 text-center text-white flex items-center justify-center gap-2"><FileText size={24}/> Extracted Text</h2>
                    {extractedText && (
                      <pre className="whitespace-pre-wrap bg-[#2A2A2A] p-4 rounded-lg max-h-80 overflow-y-auto text-gray-300 font-sans border border-gray-700">
                          {extractedText}
                      </pre>
                    )}
                    {error && <p className="text-red-400 text-center mt-4 bg-red-900/30 p-3 rounded-lg">{error}</p>}
                    <div className="text-center mt-6">
                        <button onClick={handleReset} className="bg-transparent border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto">
                            <RotateCcw size={16} />
                            Process Another
                        </button>
                    </div>
                </div>
            );
        }
  
        return (
          <div className="w-full text-center">
              {imagePreview ? (
                  <div className="space-y-6 flex flex-col items-center">
                      <img src={imagePreview} alt="Prescription preview" className="max-h-80 mx-auto rounded-lg border-2 border-gray-700" />
                      <div className="flex gap-4">
                        <button onClick={handleReset} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                            Change Image
                        </button>
                        <button onClick={handleProcessPrescription} className="bg-violet-600 text-white px-10 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors">
                           Extract Text
                        </button>
                      </div>
                  </div>
              ) : (
                  <div 
                      onClick={() => fileInputRef.current.click()}
                      className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-violet-600/50 rounded-xl cursor-pointer hover:bg-violet-900/20 transition-colors"
                  >
                      <UploadCloud className="w-12 h-12 text-violet-400 mb-3" />
                      <h3 className="text-lg font-semibold text-white">Upload an Image of the Prescription</h3>
                      <p className="text-gray-400">Click here to select a file</p>
                  </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>
        );
    }
  
    return (
        <div className="min-h-screen bg-[#111111] text-gray-100 font-sans">
            <div className="absolute inset-0 -z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <Navbar />
            
            <main className="relative z-10 pt-32 pb-20 flex flex-col items-center px-4">
                <div className="w-full max-w-3xl mx-auto text-center">
                    <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Prescription Reader
                    </motion.h1>
                    <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-gray-400 mb-10">
                        Upload a photo of your prescription to automatically extract the text using AI.
                    </motion.p>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full min-h-[400px] flex items-center justify-center bg-[#1C1C1C] p-8 rounded-2xl border border-gray-800">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={imagePreview || extractedText || error || loading}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <p className="text-center text-xs text-gray-600 mt-6 max-w-2xl mx-auto">
                        Disclaimer: This tool uses AI and may not be 100% accurate. Always verify with the original prescription and consult a healthcare professional.
                    </p>
                </div>
            </main>
        </div>
    );
}