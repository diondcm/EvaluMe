import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const CORRECT_USER = 'devpost';
const CORRECT_PASS_HASH = 'f97ae8f6984a8529ce236f98578a6daf3c2b6f59df15202f12da7468711031cc'; // SHA-256 for "#CloudRunHackathon"

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (username.trim() !== CORRECT_USER) {
      setError('Invalid username or password.');
      setIsLoading(false);
      return;
    }

    try {
      const passHash = await sha256(password);
      if (passHash === CORRECT_PASS_HASH) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error('Hashing failed:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="devpost"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#CloudRunHackathon"
            required
          />
        </div>
        {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
