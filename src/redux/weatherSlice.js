import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWeatherBundle, searchCities } from "../services/weatherApi";

const FAVORITES_KEY = "weather-favorites";
const UNIT_KEY = "weather-unit";

const loadFavorites = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const value = window.localStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

const loadUnit = () => {
  if (typeof window === "undefined") {
    return "metric";
  }
  try {
    const value = window.localStorage.getItem(UNIT_KEY);
    return value ? JSON.parse(value) : "metric";
  } catch {
    return "metric";
  }
};

const persistFavorites = (favorites) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore localStorage errors
  }
};

const persistUnit = (unit) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(UNIT_KEY, JSON.stringify(unit));
  } catch {
    // Ignore localStorage errors
  }
};

const locationKey = (location) => {
  if (location.lat == null || location.lon == null) {
    return (location.name ?? "").toLowerCase();
  }
  return `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
};

export const loadWeather = createAsyncThunk(
  "weather/loadWeather",
  async ({ location, unit }, { rejectWithValue }) => {
    try {
      const response = await fetchWeatherBundle({ location: { ...location }, unit });
      return { ...response, unit };
    } catch (error) {
      return rejectWithValue(error.message ?? "Failed to load weather");
    }
  },
  {
    condition: ({ location }, { getState }) => {
      const state = getState();
      const entry = state.weather.entities[locationKey(location)];
      if (!entry) {
        return true;
      }
      const age = Date.now() - entry.updatedAt;
      return age > 60000;
    },
  }
);

export const searchLocations = createAsyncThunk(
  "weather/searchLocations",
  async (query, { rejectWithValue }) => {
    try {
      return await searchCities(query);
    } catch (error) {
      return rejectWithValue(error.message ?? "Search failed");
    }
  }
);

const initialState = {
  unit: loadUnit(),
  favorites: loadFavorites(),
  entities: {},
  search: {
    query: "",
    results: [],
    status: "idle",
    error: null,
  },
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setUnit: (state, action) => {
      state.unit = action.payload;
      persistUnit(state.unit);
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    toggleFavorite: (state, action) => {
      const key = locationKey(action.payload);
      const exists = state.favorites.find((item) => locationKey(item) === key);
      if (exists) {
        state.favorites = state.favorites.filter((item) => locationKey(item) !== key);
      } else {
        // Normalize the location data before adding
        const normalizedLocation = {
          id: action.payload.id,
          name: action.payload.name,
          country: action.payload.country,
          region: action.payload.region || "",
          state: action.payload.state || "",
          lat: action.payload.lat,
          lon: action.payload.lon,
        };
        state.favorites.push(normalizedLocation);
      }
      persistFavorites(state.favorites);
    },
    hydrateFavorite: (state, action) => {
      const normalized = action.payload.map((item) => ({
        id: item.id ?? locationKey(item),
        name: item.name,
        country: item.country ?? "",
        state: item.state ?? "",
        lat: item.lat,
        lon: item.lon,
      }));
      state.favorites = normalized;
      persistFavorites(state.favorites);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWeather.pending, (state, action) => {
        const key = locationKey(action.meta.arg.location);
        const entry = state.entities[key] ?? {};
        state.entities[key] = { ...entry, status: "loading", error: null };
      })
      .addCase(loadWeather.fulfilled, (state, action) => {
        const key = locationKey(action.payload.location);
        state.entities[key] = {
          location: action.payload.location,
          current: action.payload.current,
          forecast: action.payload.forecast,
          unit: action.payload.unit,
          updatedAt: Date.now(),
          status: "succeeded",
          error: null,
        };
      })
      .addCase(loadWeather.rejected, (state, action) => {
        const key = locationKey(action.meta.arg.location);
        const entry = state.entities[key] ?? {};
        state.entities[key] = {
          ...entry,
          status: "failed",
          error: action.payload ?? action.error.message,
        };
      })
      .addCase(searchLocations.pending, (state) => {
        state.search.status = "loading";
        state.search.error = null;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.search.status = "succeeded";
        state.search.results = action.payload.map((item) => ({
          ...item,
          id: item.id ?? locationKey(item),
        }));
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.search.status = "failed";
        state.search.error = action.payload ?? action.error.message;
      });
  },
});

export const { setUnit, setSearchQuery, toggleFavorite, hydrateFavorite } = weatherSlice.actions;

export default weatherSlice.reducer;
