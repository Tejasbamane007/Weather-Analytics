const API_KEY = "YOUR_OPENWEATHERMAP_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getCurrentWeather = (city) =>
  axios.get(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}`);

export const getForecast = (city, days = 7) =>
  axios.get(`${BASE_URL}/forecast/daily?q=${city}&cnt=${days}&appid=${API_KEY}`);
