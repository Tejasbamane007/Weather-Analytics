import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleFavorite } from "../redux/weatherSlice";

const locationKey = (location) => {
  if (location.lat == null || location.lon == null) {
    return (location.name ?? "").toLowerCase();
  }
  return `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
};

function CityCard({ data }) {
  const dispatch = useDispatch();
  const unit = useSelector((state) => state.weather.unit);
  const favorites = useSelector((state) => state.weather.favorites);

  const { current, location } = data;
  const isFavorite = favorites.some((fav) => locationKey(fav) === locationKey(location));

  const iconUrl = `https://cdn.weatherapi.com/weather/64x64/day/${current.icon}`;
  const temp = Math.round(current.temperature);
  const unitSymbol = unit === "imperial" ? "°F" : "°C";

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    dispatch(toggleFavorite(location));
  };

  return (
    <Link to={`/city/${locationKey(location)}`} className="block group">
      <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative cursor-pointer border border-gray-600 hover:border-gray-500">
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-4 right-4 text-2xl transition-colors duration-200 ${isFavorite ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-gray-300"}`}
        >
          ♥
        </button>
        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-blue-300 transition-colors duration-200">{location.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <img src={iconUrl} alt={current.description} className="w-20 h-20 drop-shadow-lg" />
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{temp}{unitSymbol}</p>
            <p className="text-gray-300 capitalize text-sm">{current.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Humidity</p>
            <p className="text-white font-semibold">{current.humidity}%</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Wind</p>
            <p className="text-white font-semibold">{current.windSpeed} {unit === "imperial" ? "mph" : "m/s"}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CityCard;
