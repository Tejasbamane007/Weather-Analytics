import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { searchLocations, toggleFavorite, loadWeather } from "../redux/weatherSlice";

function SearchBar() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchResults = useSelector((state) => state.weather.search.results);
  const searchStatus = useSelector((state) => state.weather.search.status);
  const unit = useSelector((state) => state.weather.unit);

  const handleSearch = () => {
    if (query.trim()) {
      dispatch(searchLocations(query.trim()));
    }
  };

  const handleAddCity = (location) => {
    dispatch(toggleFavorite(location));
    dispatch(loadWeather({ location, unit }));
    setQuery("");
    // Navigate to the city detail page
    const locationKey = location.lat != null && location.lon != null
      ? `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`
      : (location.name ?? "").toLowerCase();
    navigate(`/city/${locationKey}`);
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-80 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={searchStatus === "loading"}
        >
          {searchStatus === "loading" ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </div>
          ) : (
            "Search"
          )}
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="absolute top-full mt-2 bg-gray-700 border border-gray-600 rounded-xl shadow-2xl max-w-md w-full z-50 overflow-hidden">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-4 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0 text-white transition-colors duration-150 flex items-center space-x-3"
              onClick={() => handleAddCity(result)}
            >
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="text-gray-400 text-sm">{result.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
