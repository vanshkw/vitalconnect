'use client';

import { useState } from 'react';

// === UI Helper Components ===

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);


// === Main Page Component ===

export default function StockCheckerPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stockResults, setStockResults] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, loading, finished, error
    const [error, setError] = useState('');

    // Mock function to simulate checking stock status
    const fetchStockStatus = async (drugName) => {
        console.log(`Checking stock for: ${drugName}`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!drugName || drugName.trim().length < 3) {
            return [];
        }

        const stores = [
            { name: 'Tata 1mg', logo: 'https://placehold.co/100x40/ffffff/000000?text=1mg', searchUrl: 'https://www.1mg.com/search/all?name=' },
            { name: 'PharmEasy', logo: 'https://placehold.co/100x40/ffffff/000000?text=PharmEasy', searchUrl: 'https://pharmeasy.in/search/all?name=' },
            { name: 'Netmeds', logo: 'https://placehold.co/100x40/ffffff/000000?text=Netmeds', searchUrl: 'https://www.netmeds.com/catalogsearch/result?q=' },
            { name: 'Apollo Pharmacy', logo: 'https://placehold.co/100x40/ffffff/000000?text=Apollo', searchUrl: 'https://www.apollopharmacy.in/search-medicines/' },
        ];
        
        const results = stores.map(store => ({
            storeName: store.name,
            // Randomly assign stock status
            status: Math.random() > 0.3 ? 'In Stock' : 'Out of Stock',
            logoUrl: store.logo,
            url: `${store.searchUrl}${encodeURIComponent(drugName)}`,
        }));

        return results;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setStatus('loading');
        setError('');
        setStockResults([]);

        try {
            const results = await fetchStockStatus(searchTerm);
            if (results.length === 0) {
                setError(`Could not check stock for "${searchTerm}". Please try another medicine.`);
            } else {
                setStockResults(results);
            }
            setStatus('finished');
        } catch (err) {
            console.error("Stock check failed:", err);
            setError("An unexpected error occurred. Please try again later.");
            setStatus('error');
        }
    };

    return (
        <main className="min-h-screen bg-[#0D0D0D] mt-32 text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
            <div className="w-full max-w-2xl">
                <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 shadow-lg shadow-purple-500/10 p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Medicine Availability Checker</h1>
                        <p className="text-gray-300 mt-2">Check stock status across online Indian pharmacies.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-col md:flex-row">
                        <input
                            type="text"
                            placeholder="Enter a medicine name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-white hover:bg-gray-200 text-black font-semibold px-5 py-3 rounded-lg shadow-md transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {status === 'loading' ? <Spinner /> : <SearchIcon />}
                            <span>{status === 'loading' ? 'Checking...' : 'Check'}</span>
                        </button>
                    </form>
                </div>

                <div className="mt-8">
                    {status === 'loading' && (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse flex items-center justify-between">
                                    <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {status === 'finished' && error && (
                         <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>
                    )}

                    {status === 'finished' && stockResults.length > 0 && (
                        <div className="space-y-4">
                            {stockResults.map((result, index) => (
                                <a href={result.url} key={index} target="_blank" rel="noopener noreferrer" className="block p-5 rounded-lg border-2 bg-[#1A1A1A] border-gray-800 hover:border-gray-600 transition-transform hover:-translate-y-1">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <img src={result.logoUrl} alt={`${result.storeName} logo`} className="h-8 mr-4 bg-white p-1 rounded" />
                                            <span className="font-semibold text-lg">{result.storeName}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${result.status === 'In Stock' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                            {result.status === 'In Stock' ? <CheckCircleIcon/> : <XCircleIcon/>}
                                            {result.status}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}