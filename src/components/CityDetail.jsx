import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadWeather } from "../redux/weatherSlice";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const locationKey = (location) => {
  if (location.lat == null || location.lon == null) {
    return (location.name ?? "").toLowerCase();
  }
  return `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
};

function CityDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const entities = useSelector((state) => state.weather.entities);
  const unit = useSelector((state) => state.weather.unit);
  const favorites = useSelector((state) => state.weather.favorites);

  const location = favorites.find((fav) => locationKey(fav) === id);
  const data = entities[id];

  useEffect(() => {
    if (location && (!data || data.status !== "succeeded")) {
      dispatch(loadWeather({ location, unit, force: true }));
    }
  }, [location, data, unit, dispatch, id]);

  if (!location) {
    return <div className="p-4 text-white">City not found</div>;
  }

  if (!data || data.status === "loading") {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (data.status === "failed") {
    return <div className="p-4 text-red-500">Error: {data.error}</div>;
  }

  const { current, forecast } = data;
  const unitSymbol = unit === "imperial" ? "°F" : "°C";
  const speedUnit = unit === "imperial" ? "mph" : "m/s";

  // Prepare chart data
  const hourlyData = forecast.hourly.slice(0, 24).map((hour) => ({
    time: new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(hour.temperature),
    precipitation: hour.precipitation,
  }));

  const dailyData = forecast.daily.slice(0, 7).map((day) => ({
    date: new Date(day.date).toLocaleDateString([], { weekday: 'short' }),
    min: Math.round(day.minTemp),
    max: Math.round(day.maxTemp),
    precipitation: day.precipitation,
  }));

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors duration-200 mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Back to Dashboard
        </Link>

        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-600">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{location.name}, {location.country}</h1>
              <p className="text-gray-400 text-lg">Current Weather Conditions</p>
            </div>
            <div className="flex items-center mt-4 lg:mt-0">
              <img src={`https://cdn.weatherapi.com/weather/128x128/day/${current.icon}`} alt={current.description} className="w-32 h-32 drop-shadow-lg" />
              <div className="ml-6 text-right">
                <p className="text-6xl font-bold text-white mb-2">{Math.round(current.temperature)}{unitSymbol}</p>
                <p className="text-2xl capitalize text-gray-300 mb-1">{current.description}</p>
                <p className="text-gray-400">Feels like {Math.round(current.feelsLike)}{unitSymbol}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">💧</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Humidity</p>
              <p className="text-2xl font-bold text-white">{current.humidity}%</p>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">💨</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Wind Speed</p>
              <p className="text-2xl font-bold text-white">{current.windSpeed} {speedUnit}</p>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Pressure</p>
              <p className="text-2xl font-bold text-white">{current.pressure} hPa</p>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">👁️</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Visibility</p>
              <p className="text-2xl font-bold text-white">{(current.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">🌡️</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Dew Point</p>
              <p className="text-2xl font-bold text-white">{current.dewPoint ? `${current.dewPoint}${unitSymbol}` : 'N/A'}</p>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-700/70 transition-colors duration-200">
              <div className="text-3xl mb-2">☀️</div>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">UV Index</p>
              <p className="text-2xl font-bold text-white">{current.uvIndex ?? 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-600">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <span className="mr-3">📈</span>
              24-Hour Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis label={{ value: `Temperature (${unitSymbol})`, angle: -90, position: 'insideLeft', fill: '#ccc' }} stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#ffffff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-600">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <span className="mr-3">📊</span>
              7-Day Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis label={{ value: `Temperature (${unitSymbol})`, angle: -90, position: 'insideLeft', fill: '#ccc' }} stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="min" fill="#ffffff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#cccccc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-600">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <span className="mr-3">🌧️</span>
              Precipitation Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft', fill: '#ccc' }} stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="precipitation" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-600">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <span className="mr-3">💨</span>
              Wind Speed Forecast
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis label={{ value: `Wind Speed (${speedUnit})`, angle: -90, position: 'insideLeft', fill: '#ccc' }} stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="windSpeed" stroke="#60a5fa" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityDetail;