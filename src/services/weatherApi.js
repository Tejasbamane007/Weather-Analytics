import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
console.log('weatherApi.js: API_KEY loaded:', !!API_KEY);
console.log('weatherApi.js: API_KEY value:', API_KEY);
const BASE_URL = "https://api.weatherapi.com/v1";

const client = axios.create({ baseURL: BASE_URL });

const ensureKey = () => {
  if (!API_KEY) {
    throw new Error("Missing VITE_WEATHER_API_KEY");
  }
};

const unitParam = (unit) => (unit === "imperial" ? "imperial" : "metric");

const normalizeCurrent = (data) => ({
  id: data.id,
  name: data.name,
  coord: data.coord,
  country: data.sys?.country ?? "",
  temperature: data.main?.temp ?? 0,
  feelsLike: data.main?.feels_like ?? 0,
  humidity: data.main?.humidity ?? 0,
  pressure: data.main?.pressure ?? 0,
  windSpeed: data.wind?.speed ?? 0,
  windDeg: data.wind?.deg ?? 0,
  condition: data.weather?.[0]?.main ?? "",
  description: data.weather?.[0]?.description ?? "",
  icon: data.weather?.[0]?.icon ?? "01d",
  visibility: data.visibility ?? 0,
  sunrise: data.sys?.sunrise ?? 0,
  sunset: data.sys?.sunset ?? 0,
  clouds: data.clouds?.all ?? 0,
  dewPoint: data.main?.dew_point ?? null,
  uvIndex: data.uvi ?? null,
  precipitation: data.rain?.["1h"] ?? 0,
});

const normalizeForecast = (data) => {
  const hourly = data.list.map((entry) => ({
    time: entry.dt * 1000,
    temperature: entry.main?.temp ?? 0,
    feelsLike: entry.main?.feels_like ?? 0,
    humidity: entry.main?.humidity ?? 0,
    windSpeed: entry.wind?.speed ?? 0,
    windDeg: entry.wind?.deg ?? 0,
    precipitation: (entry.rain?.["3h"] ?? 0) / 3,
    condition: entry.weather?.[0]?.main ?? "",
    icon: entry.weather?.[0]?.icon ?? "01d",
  }));

  const grouped = new Map();
  hourly.forEach((item) => {
    const date = new Date(item.time).toISOString().split("T")[0];
    const existing = grouped.get(date) ?? [];
    existing.push(item);
    grouped.set(date, existing);
  });

  const daily = Array.from(grouped.entries()).map(([date, items]) => {
    const temps = items.map((value) => value.temperature);
    const precipitationSum = items.reduce((acc, value) => acc + value.precipitation, 0);
    return {
      date,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
      avgTemp: temps.reduce((acc, value) => acc + value, 0) / temps.length,
      precipitation: precipitationSum,
      windSpeed: items.reduce((acc, value) => acc + value.windSpeed, 0) / items.length,
    };
  });

  return { hourly, daily };
};

export const searchCities = async (query) => {
  ensureKey();
  if (!query.trim()) {
    return [];
  }
  // WeatherAPI handles city search directly without separate geocoding
  const { data } = await client.get("/search.json", {
    params: {
      key: API_KEY,
      q: query,
    },
  });
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    region: item.region,
    lat: item.lat,
    lon: item.lon,
  }));
};

export const fetchWeatherBundle = async ({ location, unit }) => {
  ensureKey();
  const { lat, lon, name } = location;

  // WeatherAPI can work with city names directly, no need for separate geocoding
  const query = (lat != null && lon != null) ? `${lat},${lon}` : name;

  const params = {
    key: API_KEY,
    q: query,
    days: 7, // Get 7-day forecast
  };

  const { data } = await client.get("/forecast.json", { params });

  // Normalize current weather data
  const current = {
    id: data.location.name,
    name: data.location.name,
    coord: { lat: data.location.lat, lon: data.location.lon },
    country: data.location.country,
    temperature: data.current.temp_c,
    feelsLike: data.current.feelslike_c,
    humidity: data.current.humidity,
    pressure: data.current.pressure_mb,
    windSpeed: data.current.wind_kph,
    windDeg: data.current.wind_degree,
    condition: data.current.condition.text,
    description: data.current.condition.text,
    icon: data.current.condition.icon.split('/').pop(), // Extract icon filename
    visibility: data.current.vis_km * 1000, // Convert to meters
    sunrise: new Date(data.forecast.forecastday[0].astro.sunrise).getTime() / 1000,
    sunset: new Date(data.forecast.forecastday[0].astro.sunset).getTime() / 1000,
    clouds: data.current.cloud,
    uvIndex: data.current.uv,
  };

  // Normalize forecast data
  const forecast = {
    hourly: data.forecast.forecastday.flatMap(day =>
      day.hour.map(hour => ({
        time: new Date(hour.time).getTime(),
        temperature: hour.temp_c,
        feelsLike: hour.feelslike_c,
        humidity: hour.humidity,
        windSpeed: hour.wind_kph,
        windDeg: hour.wind_degree,
        precipitation: hour.chance_of_rain / 100, // Convert percentage to fraction
        condition: hour.condition.text,
        icon: hour.condition.icon.split('/').pop(),
      }))
    ),
    daily: data.forecast.forecastday.map(day => ({
      date: day.date,
      minTemp: day.day.mintemp_c,
      maxTemp: day.day.maxtemp_c,
      avgTemp: day.day.avgtemp_c,
      precipitation: day.day.daily_chance_of_rain / 100,
      windSpeed: day.day.maxwind_kph,
    }))
  };

  return { current, forecast, location: { ...location, lat: data.location.lat, lon: data.location.lon } };
};
