import { useState } from 'react';
import Toolbar from './ui/Toolbar';
import SearchResults from './ui/SearchResults';

// Dummy star data for testing
const dummyStars = [
  { name: "Sirius", distance_ly: 8.6, ra: "06h 45m 08.9s", dec: "-16° 42′ 58″" },
  { name: "Vega", distance_ly: 25.0, ra: "18h 36m 56.3s", dec: "+38° 47′ 01″" },
  { name: "Alpha Centauri", distance_ly: 4.4, ra: "14h 39m 36.5s", dec: "-60° 50′ 02″" },
  { name: "Betelgeuse", distance_ly: 640.0, ra: "05h 55m 10.3s", dec: "+07° 24′ 25″" },
  { name: "Rigel", distance_ly: 860.0, ra: "05h 14m 32.3s", dec: "-08° 12′ 06″" },
  { name: "Procyon", distance_ly: 11.4, ra: "07h 39m 18.1s", dec: "+05° 13′ 30″" },
  { name: "Capella", distance_ly: 42.9, ra: "05h 16m 41.4s", dec: "+45° 59′ 53″" },
  { name: "Arcturus", distance_ly: 36.7, ra: "14h 15m 39.7s", dec: "+19° 10′ 56″" },
  { name: "Spica", distance_ly: 250.0, ra: "13h 25m 11.6s", dec: "-11° 09′ 40″" },
  { name: "Antares", distance_ly: 550.0, ra: "16h 29m 24.5s", dec: "-26° 25′ 55″" },
  { name: "Groombridge 2018", distance_ly: 14.7, ra: "00h 15m 28.1s", dec: "+27° 01′ 45″" },
  { name: "Groombridge 2019", distance_ly: 15.2, ra: "00h 18m 12.3s", dec: "+28° 15′ 30″" },
  { name: "Groombridge 2020", distance_ly: 16.1, ra: "00h 22m 45.6s", dec: "+29° 30′ 15″" },
  { name: "Groombridge 2021", distance_ly: 17.3, ra: "00h 25m 18.9s", dec: "+30° 45′ 20″" },
  { name: "Groombridge 2022", distance_ly: 18.7, ra: "00h 28m 32.2s", dec: "+31° 20′ 35″" },
  { name: "Groombridge 2023", distance_ly: 19.4, ra: "00h 31m 15.5s", dec: "+32° 35′ 50″" },
  { name: "Groombridge 2024", distance_ly: 20.8, ra: "00h 34m 28.8s", dec: "+33° 50′ 05″" },
  { name: "Groombridge 2025", distance_ly: 21.9, ra: "00h 37m 42.1s", dec: "+34° 15′ 20″" },
  { name: "Groombridge 2026", distance_ly: 23.1, ra: "00h 40m 55.4s", dec: "+35° 30′ 35″" },
  { name: "Groombridge 2027", distance_ly: 24.6, ra: "00h 44m 08.7s", dec: "+36° 45′ 50″" }
];

export default function TestSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchChange = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filteredStars = dummyStars.filter(star => 
      star.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    setSearchResults(filteredStars);
    setShowSearchResults(filteredStars.length > 0);
  };

  const handleSearchResultSelect = (star) => {
    console.log('Selected star:', star);
    setShowSearchResults(false);
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const handleExportSVG = () => {
    console.log('Export SVG clicked');
  };

  const handleExportPNG = () => {
    console.log('Export PNG clicked');
  };

  return (
    <div className="relative">
      <Toolbar 
        onSearchChange={handleSearchChange}
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
      />
      
      <SearchResults
        isVisible={showSearchResults}
        results={searchResults}
        onStarSelect={handleSearchResultSelect}
        onClose={handleCloseSearchResults}
      />
    </div>
  );
}
