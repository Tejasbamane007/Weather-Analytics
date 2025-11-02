import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import CityCard from "./CityCard";
import { loadWeather } from "../redux/weatherSlice";

const locationKey = (location) => {
  if (location.lat == null || location.lon == null) {
    return (location.name ?? "").toLowerCase();
  }
  return `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
};

function Dashboard() {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.weather.favorites);
  const entities = useSelector((state) => state.weather.entities);
  const unit = useSelector((state) => state.weather.unit);

  useEffect(() => {
    favorites.forEach((favorite) => {
      const key = locationKey(favorite);
      if (!entities[key] || entities[key].status !== "succeeded") {
        dispatch(loadWeather({ location: favorite, unit }));
      }
    });
  }, [favorites, entities, unit, dispatch]);

  return (
    <div className="space-y-8">
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Weather Analytics</h2>
          <p className="text-gray-400 text-lg">Search for cities to add them to your dashboard and get detailed weather information.</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Weather Dashboard</h2>
            <p className="text-gray-400">Monitor weather conditions for your favorite cities</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const key = locationKey(favorite);
              const data = entities[key];
              if (!data || data.status !== "succeeded") {
                return (
                  <div key={key} className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-lg border border-gray-600 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="mt-4 text-white font-medium">Loading {favorite.name}...</div>
                  </div>
                );
              }
              return <CityCard key={key} data={data} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
