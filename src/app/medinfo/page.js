'use client';

import { useState } from 'react';



// SVG Icon Components for UI enhancement
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);


export default function MedInfoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [selectedRxcui, setSelectedRxcui] = useState(null);
  const [drugDetails, setDrugDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  // Step 1: Fetch drug candidates and enrich them with accurate names
  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setDrugDetails(null);
    setSelectedRxcui(null);

    try {
      const response = await fetch(
        `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(
          searchTerm
        )}&maxEntries=12`
      );
      if (!response.ok) throw new Error("Network response was not ok.");
      
      const data = await response.json();

      let candidates = data?.approximateGroup?.candidate || [];
      if (candidates && !Array.isArray(candidates)) {
        candidates = [candidates];
      }

      const uniqueCandidates = Array.from(
        new Map(candidates.map((item) => [item.rxcui, item])).values()
      );

      const enrichedCandidates = await Promise.all(
        uniqueCandidates.map(async (candidate) => {
          try {
            const propsResponse = await fetch(
              `https://rxnav.nlm.nih.gov/REST/rxcui/${candidate.rxcui}/properties.json`
            );
            if (!propsResponse.ok) return null; 
            const propsData = await propsResponse.json();
            const drugName = propsData?.properties?.name;
            const tty = propsData?.properties?.tty;
            
            if (!drugName) return null;
            
            const preferredTTYs = ['IN', 'PIN', 'SBD', 'SCD', 'BN'];
            if (!preferredTTYs.includes(tty)) {
                return null; 
            }

            return { ...candidate, drugName };
          } catch {
            return null;
          }
        })
      );
      
      const validResults = enrichedCandidates.filter(Boolean);
      
      setResults(validResults);

      if (validResults.length === 0) {
        setError(`No relevant results found for "${searchTerm}".`);
      } else {
        // Automatically fetch details for the first result
        const firstResult = validResults[0];
        fetchDrugDetails(firstResult.rxcui, firstResult.drugName);
      }

    } catch (err) {
      console.error("Error fetching drugs:", err);
      setError("Failed to fetch drugs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Fetch details with a multi-step fallback system
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

      let response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.rxcui:"${rxcui}"&limit=1`
      );
      data = await response.json();

      if (!data.results || data.results.length === 0) {
        response = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`
        );
        data = await response.json();
      }

      if (!data.results || data.results.length === 0) {
        response = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`
        );
        data = await response.json();
      }
      
      if (!data.results || data.results.length === 0) {
        setDetailsError("No detailed information found for this drug.");
        return;
      }

      const details = data.results[0];
      const openfda = details.openfda || {};

      const usageInfo = details.indications_and_usage || details.purpose || details.description || "No usage information available.";
      const sideEffectsInfo = details.adverse_reactions || details.warnings_and_cautions || details.warnings || details.contraindications || "No side effects information available.";

      setDrugDetails({
        name: (openfda.brand_name?.[0]) || (openfda.generic_name?.[0]) || drugName,
        usage: usageInfo,
        sideEffects: sideEffectsInfo,
      });

    } catch (error) {
      console.error("Error fetching drug details:", error);
      setDetailsError("An error occurred while fetching drug details.");
    } finally {
      setIsDetailsLoading(false);
    }
  };
  
  // Loading Skeleton Components
  const ResultSkeleton = () => (
    <div className="p-5 bg-gray-800 rounded-xl animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-700 rounded w-1/4"></div>
        </div>
    </div>
  );

  const DetailsSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
    </div>
  );

  return (
    <div className="bg-[#0D0D0D] mt-32 text-white min-h-screen flex flex-col">
        
        <main className="min-h-screen bg-[#0D0D0D] text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans flex-grow">
        <div className="w-full max-w-2xl">
            <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 shadow-lg shadow-purple-500/10 p-6 sm:p-8 transition-all duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    Drug Information Portal
                    </h1>
                    <p className="text-gray-300 mt-2">Your trusted source for medication details.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-col md:flex-row ">
                <input
                    type="text"
                    placeholder="e.g., Ibuprofen, Aspirin"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white hover:bg-gray-200 text-black font-semibold px-5 py-3 rounded-lg shadow-md transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? "Searching..." : <><SearchIcon /><span>Search</span></>}
                </button>
                </form>

                <div className="min-h-[100px]">
                    {isLoading ? (
                        <div className="space-y-4">
                            <ResultSkeleton />
                            <ResultSkeleton />
                            <ResultSkeleton />
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-center font-medium bg-red-900/50 p-4 rounded-lg">{error}</p>
                    ) : results && (
                        <ul className="flex flex-col gap-3">
                            {results.length > 0 ? (
                            results.map((drug) => (
                                <li
                                key={drug.rxcui}
                                onClick={() => fetchDrugDetails(drug.rxcui, drug.drugName)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                                    selectedRxcui === drug.rxcui
                                    ? "bg-purple-900/50 border-purple-500 shadow-md"
                                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                                }`}
                                >
                                <strong className="text-lg text-purple-400 block">
                                    {drug.drugName}
                                </strong>
                                <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                                    <span className="font-mono bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                    RxCUI: {drug.rxcui}
                                    </span>
                                    <span>Score: {parseFloat(drug.score).toFixed(2)}</span>
                                </div>
                                </li>
                            ))
                            ) : (
                            <p className="text-gray-400 text-center py-4">No results found.</p>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            {selectedRxcui && (
                <div className="bg-[#1A1A1A] border border-gray-800 shadow-lg shadow-purple-500/10 rounded-2xl p-8 mt-8 transition-opacity duration-500 animate-fade-in">
                {isDetailsLoading ? <DetailsSkeleton/> : detailsError ? (
                    <p className="text-red-400 text-center bg-red-900/50 p-4 rounded-lg">{detailsError}</p>
                ) : drugDetails && (
                    <>
                    <h2 className="text-3xl font-bold text-white mb-5 border-b border-gray-800 pb-4">
                        {drugDetails.name}
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <InfoIcon/>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-2">Usage Information</h3>
                                <p className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                                    {Array.isArray(drugDetails.usage) ? drugDetails.usage.join(' ') : drugDetails.usage}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <AlertTriangleIcon/>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-2">Side Effects & Warnings</h3>
                                <p className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                                    {Array.isArray(drugDetails.sideEffects) ? drugDetails.sideEffects.join(' ') : drugDetails.sideEffects}
                                </p>
                            </div>
                        </div>
                    </div>
                    </>
                )}
                </div>
            )}
        </div>
        <style jsx global>{`
            .prose-invert {
                --tw-prose-body: theme(colors.gray[300]);
                --tw-prose-headings: theme(colors.white);
                --tw-prose-lead: theme(colors.gray[400]);
                --tw-prose-links: theme(colors.purple[400]);
                --tw-prose-bold: theme(colors.white);
            }
            .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
        </main>
        
    </div>
  );
}