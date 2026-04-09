import { useState } from "react";
import { Settings } from "lucide-react";

export default function Login({ setToken }: { setToken: (t: string) => void }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await fetch("http://localhost:5011/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      if (!respuesta.ok) throw new Error("Credenciales incorrectas");

      const datos = await respuesta.json();
      localStorage.setItem("token", datos.token);
      setToken(datos.token);
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="bg-[#1a1d27] p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-800 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-gradient-to-br from-rose-600 to-fuchsia-800 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-rose-600/20">
            <Settings size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AutoTrace <span className="text-rose-500">SaaS</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Accede al panel de tu taller
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm mb-6 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition text-white"
              placeholder="taller@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-600 to-fuchsia-700 hover:from-rose-500 hover:to-fuchsia-600 text-white font-bold py-3.5 mt-2 rounded-xl shadow-lg shadow-rose-600/20 transition flex justify-center items-center gap-2"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
