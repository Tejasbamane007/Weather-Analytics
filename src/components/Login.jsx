import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithGoogle, logout } from "../firebase/fconfig";
import { loginSuccess, logoutSuccess } from "../redux/authSlice";
function LoginButton() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogin = async () => {
  console.log('Login.jsx: handleLogin called');
  const userData = await signInWithGoogle();
  console.log('Login.jsx: signInWithGoogle returned:', userData);
  if (userData) {
    const safeUser = {
      uid: userData.uid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL,
    };
    console.log('Login.jsx: dispatching loginSuccess with:', safeUser);
    dispatch(loginSuccess(safeUser));
  } else {
    console.log('Login.jsx: No user data returned from signInWithGoogle - likely popup blocked or cancelled');
    // Could show user-friendly error message here
  }
};


  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <img src={user.photoURL} alt="user" className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-gray-400 transition-colors duration-200" />
          <span className="text-white font-medium">{user.displayName}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
            Logout
          </button>
        </>
      ) : (
        <button onClick={handleLogin} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
          <span>🔐</span>
          <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
}

export default LoginButton;