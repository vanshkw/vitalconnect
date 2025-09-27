'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, AlertTriangle, HeartPulse, Loader2 } from 'lucide-react';

// === UI Helper: Navbar Component ===
const Navbar = () => (
    <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <HeartPulse className="text-violet-400" size={28} />
                <span className="text-xl font-bold text-white">DrugInfo</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-gray-300">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <a href="#" className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
                Get Started
            </a>
        </nav>
    </header>
);

// === FIXED: Component for Streaming Text Animation ===
const StreamedText = ({ text, speed = 15 }) => {
    const [displayedText, setDisplayedText] = useState('');
    // Ensure fullText is always a string to prevent errors
    const fullText = Array.isArray(text) ? text.join(' ') : String(text || '');

    useEffect(() => {
        // Effect to reset the text whenever the source `fullText` changes
        setDisplayedText('');
    }, [fullText]);

    useEffect(() => {
        // Effect to handle the typing animation itself
        if (displayedText.length < fullText.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText(fullText.slice(0, displayedText.length + 1));
            }, speed);
            // Cleanup the timeout if the component unmounts or re-renders
            return () => clearTimeout(timeoutId);
        }
    }, [displayedText, fullText, speed]); // Re-run this effect when displayedText changes

    const isStreaming = displayedText.length < fullText.length;

    return (
        <p className="text-gray-300 leading-relaxed">
            {displayedText}
            {isStreaming && <span className="inline-block w-2 h-5 bg-violet-400 ml-1 translate-y-1 animate-pulse"></span>}
        </p>
    );
};


export default function MedInfoPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState(null);
    const [selectedRxcui, setSelectedRxcui] = useState(null);
    const [drugDetails, setDrugDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailsError, setDetailsError] = useState(null);

    const handleSearch = async (event) => {
        event.preventDefault();
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        setResults(null);
        setDrugDetails(null);
        setSelectedRxcui(null);

        try {
            const response = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(searchTerm)}&maxEntries=12`);
            if (!response.ok) throw new Error("Network response was not ok.");
            const data = await response.json();
            let candidates = data?.approximateGroup?.candidate || [];
            if (candidates && !Array.isArray(candidates)) candidates = [candidates];
            const uniqueCandidates = Array.from(new Map(candidates.map(item => [item.rxcui, item])).values());
            const enrichedCandidates = await Promise.all(
                uniqueCandidates.map(async (candidate) => {
                    try {
                        const propsResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${candidate.rxcui}/properties.json`);
                        if (!propsResponse.ok) return null;
                        const propsData = await propsResponse.json();
                        const drugName = propsData?.properties?.name;
                        const tty = propsData?.properties?.tty;
                        if (!drugName || !['IN', 'PIN', 'SBD', 'SCD', 'BN'].includes(tty)) return null;
                        return { ...candidate, drugName };
                    } catch { return null; }
                })
            );
            const validResults = enrichedCandidates.filter(Boolean);
            setResults(validResults);
            if (validResults.length === 0) {
                setError(`No relevant results found for "${searchTerm}".`);
            } else {
                fetchDrugDetails(validResults[0].rxcui, validResults[0].drugName);
            }
        } catch (err) {
            console.error("Error fetching drugs:", err);
            setError("Failed to fetch drugs. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDrugDetails = async (rxcui, drugName) => {
        if (selectedRxcui === rxcui) {
            setSelectedRxcui(null);
            setDrugDetails(null);
            return;
        }
        setSelectedRxcui(rxcui);
        setIsDetailsLoading(true);
        setDrugDetails(null);
        setDetailsError(null);
        try {
            let data = null;
            const fetchWithFallback = async (url) => {
                if (data && data.results?.length > 0) return;
                const response = await fetch(url);
                data = await response.json();
            };
            await fetchWithFallback(`https://api.fda.gov/drug/label.json?search=openfda.rxcui:"${rxcui}"&limit=1`);
            await fetchWithFallback(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`);
            await fetchWithFallback(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`);
            if (!data.results || data.results.length === 0) {
                setDetailsError("No detailed information found for this drug.");
                return;
            }
            const details = data.results[0];
            const openfda = details.openfda || {};
            setDrugDetails({
                name: openfda.brand_name?.[0] || openfda.generic_name?.[0] || drugName,
                usage: details.indications_and_usage || details.purpose || details.description || "No usage information available.",
                sideEffects: details.adverse_reactions || details.warnings_and_cautions || details.warnings || details.contraindications || "No side effects information available.",
            });
        } catch (error) {
            console.error("Error fetching drug details:", error);
            setDetailsError("An error occurred while fetching drug details.");
        } finally {
            setIsDetailsLoading(false);
        }
    };

    // --- Loading Skeleton Components ---
    const ResultSkeleton = () => (
        <div className="bg-[#1C1C1C] border border-gray-800 p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-5 bg-gray-700 rounded w-1/4"></div>
        </div>
    );
    const DetailsSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    );
    // --- End Skeletons ---

    return (
        <div className="min-h-screen bg-[#111111] text-gray-100 font-sans">
            <div className="absolute inset-0 -z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <Navbar />

            <main className="relative z-10 pt-32 pb-20 flex flex-col items-center px-4">
                <div className="w-full max-w-2xl text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Drug Information Portal
                    </h1>
                    <p className="text-lg text-gray-400 mb-10">
                        Your trusted source for medication details, powered by FDA and NIH data.
                    </p>

                    <div className="bg-[#1C1C1C] rounded-xl border border-gray-800 p-8 text-left">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="e.g., Ibuprofen, Aspirin"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition duration-200"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-3 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                                <span>Search</span>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 w-full max-w-2xl min-h-[100px]">
                    {isLoading ? (
                        <div className="space-y-3"><ResultSkeleton /><ResultSkeleton /><ResultSkeleton /></div>
                    ) : error ? (
                        <p className="text-red-400 text-center font-medium bg-red-900/50 p-4 rounded-lg">{error}</p>
                    ) : results && (
                        <ul className="flex flex-col gap-3">
                            {results.map((drug) => (
                                <li key={drug.rxcui} onClick={() => fetchDrugDetails(drug.rxcui, drug.drugName)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-violet-600/50 ${selectedRxcui === drug.rxcui ? "bg-violet-900/20 border-violet-500" : "bg-[#1C1C1C] border-gray-800"}`}>
                                    <strong className="text-lg text-violet-400 block">{drug.drugName}</strong>
                                    <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                                        <span className="font-mono bg-gray-700 text-gray-300 px-2 py-1 rounded">RxCUI: {drug.rxcui}</span>
                                        <span>Score: {parseFloat(drug.score).toFixed(2)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <AnimatePresence>
                    {selectedRxcui && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="mt-8 w-full max-w-2xl bg-[#1C1C1C] border border-gray-800 rounded-xl p-8">
                            {isDetailsLoading ? <DetailsSkeleton /> : detailsError ? (
                                <p className="text-red-400 text-center bg-red-900/50 p-4 rounded-lg">{detailsError}</p>
                            ) : drugDetails && (
                                <>
                                    <h2 className="text-3xl font-bold text-white mb-5 border-b border-gray-700 pb-4">{drugDetails.name}</h2>
                                    <div className="space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <Info className="text-violet-400 flex-shrink-0 mt-1" size={20} />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-200 mb-2">Usage Information</h3>
                                                <StreamedText text={drugDetails.usage} />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={20} />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-200 mb-2">Side Effects & Warnings</h3>
                                                <StreamedText text={drugDetails.sideEffects} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}