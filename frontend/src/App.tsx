import { useState, useEffect } from "react";
import {
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Car,
  Wrench,
  TrendingUp,
  Clock,
  PlusCircle,
} from "lucide-react";

// 1. ACTUALIZAMOS EL MOLDE PARA QUE COINCIDA CON TU NUEVO C#
interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  problemaReportado: string;
  fechaIngreso: string;
  estadoActual: string; // Ya no usamos booleano
}

// ==========================================
// COMPONENTE: EL SÚPER PANEL DE CONTROL
// ==========================================
function PanelVehiculos({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [problema, setProblema] = useState("");
  const [modoOscuro, setModoOscuro] = useState(true);

  // GET: Traer vehículos (Ahora C# manda fechas y estados reales)
  const cargarVehiculos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:5011/api/talleres/1/vehiculos",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (respuesta.ok) setVehiculos(await respuesta.json());
    } catch (error) {
      console.error(error);
    }
  };

  // POST: Registrar auto (Ahora mandamos el Problema Reportado real)
  const registrarAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await fetch("http://localhost:5011/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Mandamos los datos tal cual los espera tu nuevo backend
        body: JSON.stringify({
          placa,
          modelo,
          problemaReportado: problema,
          tallerId: 1,
        }),
      });
      if (respuesta.ok) {
        setPlaca("");
        setModelo("");
        setProblema("");
        cargarVehiculos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarVehiculos();
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTema = () => {
    document.documentElement.classList.toggle("dark");
    setModoOscuro(!modoOscuro);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 font-sans pb-10 transition-colors duration-300">
      {/* HEADER DEGRADADO */}
      <header className="bg-gradient-to-r from-rose-600 to-[#520444] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-tight">
                AutoTrace
              </h1>
              <p className="text-xs font-medium text-white/70">
                Panel de Control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-white/90">
            <button className="hover:text-white transition">
              <Search size={20} />
            </button>
            <button className="relative hover:text-white transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-fuchsia-800"></span>
            </button>
            <button
              onClick={toggleTema}
              className="hover:text-white transition"
            >
              {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-6 w-px bg-white/30 hidden md:block"></div>
            <button className="hidden md:flex items-center gap-2 hover:text-white transition font-medium">
              <User size={20} /> Admin
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 hover:text-white transition font-medium text-sm bg-white/10 px-3 py-1.5 rounded-lg"
            >
              <LogOut size={18} />{" "}
              <span className="hidden md:block">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-6">
        {/* ROW 1: TARJETAS DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                Total Vehículos
              </p>
              <h3 className="text-2xl font-bold text-rose-600 mb-2">
                {vehiculos.length}
              </h3>
              <p className="text-xs text-gray-400">Registrados</p>
            </div>
            <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-xl text-rose-600 dark:text-rose-400">
              <Car size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                En Espera
              </p>
              <h3 className="text-2xl font-bold text-orange-500 mb-2">
                {vehiculos.filter((v) => v.estadoActual === "En Espera").length}
              </h3>
              <p className="text-xs text-gray-400">Por diagnosticar</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                En Reparación
              </p>
              <h3 className="text-2xl font-bold text-yellow-500 mb-2">
                {
                  vehiculos.filter((v) => v.estadoActual === "En Reparación")
                    .length
                }
              </h3>
              <p className="text-xs text-gray-400">En taller</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Wrench size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                Completados
              </p>
              <h3 className="text-2xl font-bold text-emerald-500 mb-2">
                {vehiculos.filter((v) => v.estadoActual === "Listo").length}
              </h3>
              <p className="text-xs text-gray-400">Listos para entrega</p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* ROW 2: FORMULARIO Y LISTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="text-yellow-500">
                <PlusCircle size={24} />
              </span>{" "}
              Nuevo Ingreso
            </h2>
            <form onSubmit={registrarAuto} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Placa
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 uppercase dark:text-white"
                  placeholder="ABC-123"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  placeholder="Honda Civic"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Problema Reportado
                </label>
                <textarea
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white resize-none"
                  placeholder="El auto no enciende..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <PlusCircle size={20} /> Registrar Vehículo
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 bg-gray-200 dark:bg-[#1a1d27] p-1 rounded-xl">
                <button className="px-4 py-1.5 bg-white dark:bg-[#2a2f3e] text-gray-900 dark:text-white rounded-lg text-sm font-bold shadow-sm">
                  Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiculos.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No hay vehículos registrados aún.
                </p>
              ) : (
                vehiculos.map((auto) => (
                  <div
                    key={auto.id}
                    className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/50 transition group shadow-sm flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#2a2f3e] text-gray-600 dark:text-gray-400">
                            <Car size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase">
                              {auto.placa}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {auto.modelo}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-4">
                        "{auto.problemaReportado || "Sin problema especificado"}
                        "
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-600/20 text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/10">
                        <Wrench size={12} /> {auto.estadoActual}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(auto.fechaIngreso).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL (RUTEADOR BÁSICO Y LOGIN REDISEÑADO)
// ==========================================
function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 LÓGICA DE LOGIN RESTAURADA Y CONECTADA
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

  if (token)
    return (
      <PanelVehiculos
        token={token}
        onLogout={() => {
          localStorage.removeItem("token");
          setToken("");
        }}
      />
    );

  // 🎨 PANTALLA DE LOGIN (Rediseñada para combinar con Figma)
  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Fondo decorativo */}
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

export default App;
