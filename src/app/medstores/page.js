'use client';

import { useState, useEffect, useRef } from 'react';


// A simple SVG icon for the map markers
const pharmacyIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234c1d95" width="32px" height="32px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    <path d="M13 9h-2V7h2v2zm0 2h-2v2h2v-2z"/>
  </svg>
`;

// Helper function to calculate distance between two lat/lng points
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};


export default function StoresPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); // To keep track of markers for cleanup
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Dynamically load Leaflet and initialize map
  useEffect(() => {
    let script, link;

    const initializeMap = () => {
      if (window.L && mapRef.current && !mapInstance.current) {
        mapInstance.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default view of India

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);
        
        setIsMapReady(true); // Signal that the map is ready
      }
    };

    if (window.L) {
      initializeMap();
      return;
    }

    // Load CSS
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = initializeMap; // Initialize map after script loads
    document.body.appendChild(script);

    return () => {
      if (link && document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const findStores = () => {
    // Guard against function being called before map is ready
    if (!mapInstance.current) {
      setError("Map is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError(null);
    setStores([]);

    // Clear previous markers from the map
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Center map on user location
        mapInstance.current.setView([latitude, longitude], 14);
        
        // Add a marker for the user's location
        const userIcon = window.L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-blue-500"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" clip-rule="evenodd" /></svg>`,
            className: 'bg-transparent border-0',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const userMarker = window.L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstance.current)
            .bindPopup('Your Location').openPopup();
        markersRef.current.push(userMarker);
        
        try {
            let pharmacies = [];
            // First, try to find stores within 1km
            const initialQuery = `
              [out:json];
              (
                node["amenity"="pharmacy"](around:1000, ${latitude}, ${longitude});
                way["amenity"="pharmacy"](around:1000, ${latitude}, ${longitude});
                relation["amenity"="pharmacy"](around:1000, ${latitude}, ${longitude});
              );
              out center;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(initialQuery)}`);
            const data = await response.json();
            pharmacies = data.elements.map(el => ({
                id: el.id,
                name: el.tags.name || "Unnamed Pharmacy",
                lat: el.lat || el.center.lat,
                lng: el.lon || el.center.lon
            }));

            // If no stores are found, search a wider area for the 5 closest
            if (pharmacies.length === 0) {
                setError("No stores found within 1km. Searching a wider area for the 5 closest...");
                const widerQuery = `
                  [out:json];
                  (
                    node["amenity"="pharmacy"](around:10000, ${latitude}, ${longitude});
                    way["amenity"="pharmacy"](around:10000, ${latitude}, ${longitude});
                    relation["amenity"="pharmacy"](around:10000, ${latitude}, ${longitude});
                  );
                  out center;
                `;
                const widerResponse = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(widerQuery)}`);
                const widerData = await widerResponse.json();
                const allPharmacies = widerData.elements.map(el => ({
                    id: el.id,
                    name: el.tags.name || "Unnamed Pharmacy",
                    lat: el.lat || el.center.lat,
                    lng: el.lon || el.center.lon,
                    distance: getDistance(latitude, longitude, el.lat || el.center.lat, el.lon || el.center.lon)
                }));

                if (allPharmacies.length > 0) {
                    // Sort by distance and take the closest 5
                    pharmacies = allPharmacies.sort((a, b) => a.distance - b.distance).slice(0, 5);
                }
            }

            if (pharmacies.length === 0) {
                setError("No medical stores found near your location.");
            } else {
                 setError(null); // Clear any searching messages
                 setStores(pharmacies);
                 // Add markers for each store
                const pharmacyIcon = window.L.icon({
                    iconUrl: `data:image/svg+xml,${pharmacyIconSvg}`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });
                pharmacies.forEach(store => {
                    const storeMarker = window.L.marker([store.lat, store.lng], { icon: pharmacyIcon })
                        .addTo(mapInstance.current)
                        .bindPopup(store.name);
                    markersRef.current.push(storeMarker);
                });
            }
        } catch(err) {
            setError("Failed to fetch store data. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }

      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen flex flex-col">
      
      <main className="pt-16 flex-grow">
        <section className="text-center py-16 lg:py-24">
            <div className="container mx-auto px-4">
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
                    Find Nearby Medical Stores
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
                    Click the button below to find pharmacies and medical stores near your current location.
                </p>
                <button 
                    onClick={findStores}
                    disabled={loading || !isMapReady}
                    className="bg-white text-black px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition-transform hover:scale-105 disabled:opacity-60 disabled:scale-100"
                >
                    {loading ? 'Searching...' : !isMapReady ? 'Map Loading...' : 'Find Stores Near Me'}
                </button>
            </div>
        </section>

        <section className="pb-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 rounded-lg overflow-hidden border border-gray-800 shadow-2xl shadow-purple-500/10">
                        <div id="map" ref={mapRef} className="h-[600px] w-full bg-gray-800"></div>
                    </div>
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-800">
                        <h2 className="text-2xl font-bold mb-4">Nearby Stores</h2>
                        {loading && <p>Searching for stores...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {!loading && stores.length > 0 && (
                            <ul className="space-y-4">
                                {stores.map(store => (
                                    <li key={store.id} className="p-3 bg-gray-800 rounded-md">
                                        <h3 className="font-semibold">{store.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            Lat: {store.lat.toFixed(4)}, Lng: {store.lng.toFixed(4)}
                                            {store.distance && (
                                                <span className="italic"> (~{store.distance.toFixed(2)} km away)</span>
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {!loading && !error && stores.length === 0 && (
                             <p className="text-gray-400">Stores will be listed here once you search.</p>
                         )}
                    </div>
                </div>
            </div>
        </section>

      </main>
      
    </div>
  );
}

