import { useSelector, useDispatch } from "react-redux";
import { setUnit } from "../redux/weatherSlice";

function Settings() {
  const dispatch = useDispatch();
  const unit = useSelector((state) => state.weather.unit);

  const handleUnitChange = (newUnit) => {
    dispatch(setUnit(newUnit));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚙️ Settings</h1>
          <p className="text-gray-400">Customize your weather dashboard preferences</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-600">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-4">🌡️</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Temperature Unit</h2>
              <p className="text-gray-400">Choose your preferred temperature scale</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleUnitChange("metric")}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                unit === "metric"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "bg-gray-600 text-white hover:bg-gray-500 shadow-md"
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => handleUnitChange("imperial")}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                unit === "imperial"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "bg-gray-600 text-white hover:bg-gray-500 shadow-md"
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;