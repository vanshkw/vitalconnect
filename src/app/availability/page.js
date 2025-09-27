'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Loader2, 
    CheckCircle, 
    XCircle, 
    UploadCloud, 
    HeartPulse, 
    Mic, 
    FileSearch 
} from 'lucide-react';

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
                <a href="#" className="hover:text-white transition-colors">Prescription Reader</a>
            </div>
            <button className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
                Check Availability
            </button>
        </nav>
    </header>
);


// === Main Page Component ===

export default function StockCheckerPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stockResults, setStockResults] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, loading, finished
    const [error, setError] = useState('');

    // Mock function to simulate checking stock status
    const fetchStockStatus = async (drugName) => {
        console.log(`Checking stock for: ${drugName}`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!drugName || drugName.trim().length < 3) {
            return [];
        }
        
        const stores = [
            { name: 'Tata 1mg', logo: 'https://placehold.co/100x40/ffffff/e53e3e?text=1mg', searchUrl: 'https://www.1mg.com/search/all?name=' },
            { name: 'PharmEasy', logo: 'https://placehold.co/100x40/ffffff/38a169?text=PharmEasy', searchUrl: 'https://pharmeasy.in/search/all?name=' },
            { name: 'Netmeds', logo: 'https://placehold.co/100x40/ffffff/3182ce?text=Netmeds', searchUrl: 'https://www.netmeds.com/catalogsearch/result?q=' },
            { name: 'Apollo Pharmacy', logo: 'https://placehold.co/100x40/ffffff/dd6b20?text=Apollo', searchUrl: 'https://www.apollopharmacy.in/search-medicines/' },
        ];
        
        if (drugName.toLowerCase() === 'notfound') return [];

        return stores.map(store => ({
            storeName: store.name,
            status: Math.random() > 0.3 ? 'In Stock' : 'Out of Stock',
            logoUrl: store.logo,
            url: `${store.searchUrl}${encodeURIComponent(drugName)}`,
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim() || status === 'loading') return;

        setStatus('loading');
        setError('');
        setStockResults([]);

        try {
            const results = await fetchStockStatus(searchTerm);
            setStockResults(results);
        } catch (err) {
            console.error("Stock check failed:", err);
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setStatus('finished');
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
    };
    
    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-gray-100 font-sans">
            <div className="absolute inset-0 -z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <Navbar />

            <main className="relative z-10 pt-32 pb-20 flex flex-col items-center px-4">
                <div className="w-full max-w-2xl text-center">
                    <motion.h1 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl sm:text-5xl font-bold text-white mb-4"
                    >
                        Check Medicine Availability
                    </motion.h1>
                    <motion.p 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-gray-400 mb-12"
                    >
                        Enter your medicine's name to check stock across online pharmacies.
                    </motion.p>

                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-[#1C1C1C] rounded-xl border border-gray-800 p-8"
                    >
                        <form onSubmit={handleSearch}>
                            <label className="block text-sm font-medium text-gray-300 text-left mb-2">
                                Enter Medicine Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="e.g., Aspirin"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition duration-200"
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-400">
                                    <Mic size={20} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" /> : <Search />}
                                <span>{status === 'loading' ? 'Checking...' : 'Check Availability'}</span>
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Results Section */}
                <div className="mt-12 w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                           <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-[#1C1C1C] border border-gray-800 p-4 rounded-lg animate-pulse flex items-center justify-between">
                                        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                                        <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        
                        {status === 'finished' && stockResults.length > 0 && (
                            <motion.div key="results" className="space-y-3" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                {stockResults.map((result) => (
                                    <motion.a key={result.storeName} href={result.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-[#1C1C1C] border border-gray-800 hover:bg-gray-800/50 hover:border-violet-600/50 transition-all duration-200" variants={itemVariants}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <img src={result.logoUrl} alt={`${result.storeName} logo`} className="h-7 bg-white p-1 rounded-sm" />
                                                <span className="font-semibold text-lg text-gray-200">{result.storeName}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${result.status === 'In Stock' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {result.status === 'In Stock' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                                {result.status}
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </motion.div>
                        )}

                        {status === 'finished' && stockResults.length === 0 && (
                             <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-400 py-10 bg-[#1C1C1C] border border-gray-800 rounded-xl">
                                <FileSearch size={48} className="mx-auto mb-4 text-gray-600"/>
                                <h3 className="text-xl font-semibold text-white">No Results Found</h3>
                                <p>We couldn't find stock for "{searchTerm}" at this time.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}