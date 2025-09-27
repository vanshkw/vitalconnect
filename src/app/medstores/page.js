'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Search, MapPin } from 'lucide-react';

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

// An SVG icon for the map markers, themed with the violet accent color
const pharmacyIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238B5CF6" width="36px" height="36px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
`;

// Helper function to calculate distance between two lat/lng points
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

export default function StoresPage() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [manualLocation, setManualLocation] = useState('');

    // Dynamically load Leaflet and initialize map
    useEffect(() => {
        let script, link;
        const initializeMap = () => {
            if (window.L && mapRef.current && !mapInstance.current) {
                mapInstance.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5);
                
                // --- THIS IS THE LINE THAT WAS CHANGED ---
                window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                }).addTo(mapInstance.current);
                // --- END OF CHANGE ---

                setIsMapReady(true);
            }
        };

        if (window.L) {
            initializeMap();
            return;
        }
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.body.appendChild(script);
        return () => {
            if (link) document.head.removeChild(link);
            if (script) document.body.removeChild(script);
        };
    }, []);

    const fetchAndDisplayStores = async (latitude, longitude) => {
        mapInstance.current.setView([latitude, longitude], 14);
        const userIcon = window.L.divIcon({
            html: `<div class="relative flex items-center justify-center w-8 h-8"><span class="absolute inline-flex w-full h-full bg-violet-400 rounded-full opacity-75 animate-ping"></span><span class="relative inline-flex w-6 h-6 bg-violet-500 border-2 border-white rounded-full"></span></div>`,
            className: 'bg-transparent border-0',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const userMarker = window.L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstance.current).bindPopup('Your Location').openPopup();
        markersRef.current.push(userMarker);

        try {
            const overpassQuery = (radius) => `[out:json];(node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});way["amenity"="pharmacy"](around:${radius},${latitude},${longitude}););out center;`;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery(1000))}`);
            let data = await response.json();
            let pharmacies = data.elements.map(el => ({ id: el.id, name: el.tags.name || "Unnamed Pharmacy", lat: el.lat || el.center.lat, lng: el.lon || el.center.lon }));
            
            if (pharmacies.length === 0) {
                setError("No stores found within 1km. Searching a wider area...");
                const widerResponse = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery(10000))}`);
                const widerData = await widerResponse.json();
                const allPharmacies = widerData.elements.map(el => ({ ...el, distance: getDistance(latitude, longitude, el.lat || el.center.lat, el.lon || el.center.lon) }));
                pharmacies = allPharmacies.sort((a, b) => a.distance - b.distance).slice(0, 5).map(el => ({ id: el.id, name: el.tags.name || "Unnamed Pharmacy", lat: el.lat || el.center.lat, lng: el.lon || el.center.lon, distance: el.distance }));
            }
            if (pharmacies.length === 0) {
                setError("No medical stores found near your location.");
            } else {
                setError(null);
                setStores(pharmacies);
                const pharmacyIcon = window.L.icon({ iconUrl: `data:image/svg+xml,${encodeURIComponent(pharmacyIconSvg)}`, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
                pharmacies.forEach(store => {
                    const storeMarker = window.L.marker([store.lat, store.lng], { icon: pharmacyIcon }).addTo(mapInstance.current).bindPopup(store.name);
                    markersRef.current.push(storeMarker);
                });
            }
        } catch (err) {
            setError("Failed to fetch store data. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const findStores = async () => {
        if (!isMapReady) {
            setError("Map is not ready yet.");
            return;
        }
        setLoading(true);
        setError(null);
        setStores([]);
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (manualLocation.trim()) {
            try {
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}`);
                const geoData = await geoResponse.json();
                if (geoData && geoData.length > 0) {
                    await fetchAndDisplayStores(parseFloat(geoData[0].lat), parseFloat(geoData[0].lon));
                } else {
                    setError(`Could not find location: "${manualLocation}".`);
                    setLoading(false);
                }
            } catch (err) {
                setError("Failed to find location. Please try again.");
                setLoading(false);
            }
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchAndDisplayStores(position.coords.latitude, position.coords.longitude),
                () => {
                    setError("Unable to retrieve location. Please enable location services or enter a location manually.");
                    setLoading(false);
                }
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-gray-100 font-sans">
            <div className="absolute inset-0 -z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <Navbar />

            <main className="relative z-10 pt-32 pb-20 flex flex-col items-center px-4">
                <div className="w-full max-w-5xl">
                    <div className="text-center">
                        <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-4xl sm:text-5xl font-bold text-white mb-4">
                            Find Nearby Medical Stores
                        </motion.h1>
                        <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                            Use your current location or enter a location to find pharmacies near you.
                        </motion.p>

                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[#1C1C1C] rounded-xl border border-gray-800 p-6 max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="e.g., Sonipat, Haryana, India" className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition duration-200" />
                                </div>
                                <button onClick={findStores} disabled={loading || !isMapReady} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    <Search size={20} />
                                    <span>{loading ? 'Searching...' : !isMapReady ? 'Map Loading...' : 'Find Stores'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-gray-200 rounded-xl border border-gray-800 overflow-hidden shadow-2xl p-1">
                            <div id="map" ref={mapRef} className="h-[600px] w-full rounded-lg"></div>
                        </div>
                        <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800">
                            <h2 className="text-2xl font-bold mb-4 text-white">Nearby Stores</h2>
                            <div className="h-[520px] overflow-y-auto pr-2">
                                {error && <p className="text-red-400">{error}</p>}
                                {!loading && !error && stores.length === 0 && <p className="text-gray-400">Stores will be listed here once you search.</p>}
                                <ul className="space-y-3">
                                    {stores.map(store => (
                                        <li key={store.id} className="p-4 bg-[#2A2A2A] rounded-lg border border-gray-700">
                                            <h3 className="font-semibold text-violet-400">{store.name}</h3>
                                            <p className="text-sm text-gray-400">
                                                {store.distance && `~${store.distance.toFixed(2)} km away`}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}