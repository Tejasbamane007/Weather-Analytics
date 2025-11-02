console.log('App.jsx: App component loaded');
import { useSelector } from "react-redux";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SearchBar from "./components/SearchBar";
import CityDetail from "./components/CityDetail";
import Settings from "./components/Settings";

function App() {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-white">Weather Analytics Dashboard</h1>
          <Login />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg border-b border-gray-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Weather Analytics Dashboard
            </h1>
            <Login />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <SearchBar />
          <Link to="/settings" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">Settings</Link>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/city/:id" element={<CityDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
