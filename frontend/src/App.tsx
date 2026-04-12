import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Car,
  PlusCircle,
  LayoutDashboard,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Archive,
  Wrench,
} from "lucide-react";

// IMPORTACIONES
import Dashboard from "./pages/Dashboard";
import Vehiculos from "./pages/Vehiculos";
import NuevoIngreso from "./pages/NuevoIngreso";
import Login from "./pages/Login"; // ⬅️ Nuevo Login limpio
import DetalleVehiculo from "./pages/DetalleVehiculo";
import Servicios from "./pages/Servicios";
import RastreoCliente from "./pages/RastreoCliente";
import Inventario from "./pages/Inventario";

// ==========================================
// 1. EL ESQUELETO (SIDEBAR COLAPSABLE, HEADER Y MODAL)
// ==========================================
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [modoOscuro, setModoOscuro] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [colapsado, setColapsado] = useState(false); // ⬅️ Estado del Sidebar

  const toggleTema = () => {
    document.documentElement.classList.toggle("dark");
    setModoOscuro(!modoOscuro);
  };

  const confirmarCierreSesion = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Menú con las nuevas secciones en planeación
  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Vehículos", path: "/vehiculos", icon: <Car size={20} /> },
    { name: "Nuevo Ingreso", path: "/nuevo", icon: <PlusCircle size={20} /> },
    { name: "Inventario", path: "/inventario", icon: <Package size={20} /> },
    {
      name: "Historial Global",
      path: "/historial",
      icon: <Archive size={20} />,
    },
    {
      name: "Servicios",
      path: "/servicios",
      icon: <Wrench size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 font-sans flex transition-colors duration-300">
      {/* 🟢 SIDEBAR COLAPSABLE */}
      <aside
        className={`bg-white dark:bg-[#1a1d27] border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col transition-all duration-300 ${colapsado ? "w-20" : "w-64"}`}
      >
        <div
          className={`p-6 flex items-center border-b border-gray-200 dark:border-gray-800 ${colapsado ? "justify-center" : "gap-3 justify-between"}`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-600 to-fuchsia-800 p-2 rounded-xl text-white shadow-lg shadow-rose-600/20 shrink-0">
              <Settings size={24} />
            </div>
            {!colapsado && (
              <h1 className="text-xl font-extrabold tracking-tight whitespace-nowrap">
                AutoTrace
              </h1>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          {menu.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={colapsado ? item.name : ""}
                className={`flex items-center mx-4 px-3 py-3 rounded-xl transition font-medium ${
                  activo
                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2f3e]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!colapsado && (
                  <span className="ml-3 whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
          {/* Botón para colapsar */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="flex items-center justify-center p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2f3e] transition w-full mb-2"
          >
            {colapsado ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            title={colapsado ? "Cerrar Sesión" : ""}
            className="flex items-center px-3 py-3 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-500 transition font-medium"
          >
            <span className="shrink-0">
              <LogOut size={20} />
            </span>
            {!colapsado && (
              <span className="ml-3 whitespace-nowrap">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* 🟢 CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER TOP DEGRADADO */}
        <header className="bg-gradient-to-r from-rose-600 to-[#520444] border-b border-fuchsia-900/50 sticky top-0 z-40 shadow-md">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white capitalize drop-shadow-sm">
              {location.pathname === "/"
                ? "Dashboard"
                : location.pathname.replace("/", "")}
            </h2>
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
              <button className="flex items-center gap-2 hover:text-white transition font-medium text-sm">
                <User size={20} />{" "}
                <span className="hidden md:block">Admin Taller</span>
              </button>
            </div>
          </div>
        </header>

        {/* ÁREA DE RENDERIZADO */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* 🔴 MODAL DE CERRAR SESIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-500">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">
              ¿Cerrar Sesión?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              Tendrás que volver a ingresar tus credenciales para acceder.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2f3e] hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCierreSesion}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. LA APLICACIÓN PRINCIPAL (ENRUTADOR)
// ==========================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [vehiculos, setVehiculos] = useState([]);

  const cargarVehiculos = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:5011/api/talleres/1/vehiculos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setVehiculos(await res.json());
  };

  useEffect(() => {
    cargarVehiculos();
  }, [token]);

  if (!token) return <Login setToken={setToken} />;

  // Componente temporal para las páginas en construcción
  const PaginaEnConstruccion = ({ titulo }: { titulo: string }) => (
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
      <p className="text-gray-500 dark:text-gray-400 font-medium">
        Módulo de {titulo} en planeación 🚧
      </p>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 1. RUTA PÚBLICA (Afuera del Layout para que no tenga menú lateral) */}
        <Route path="/rastreo/:placa" element={<RastreoCliente />} />

        {/* 🔐 2. RUTAS DE ADMINISTRADOR (Envueltas en el Layout) */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard vehiculos={vehiculos} />} />
                <Route
                  path="/vehiculos"
                  element={<Vehiculos vehiculos={vehiculos} />}
                />
                <Route
                  path="/nuevo"
                  element={
                    <NuevoIngreso token={token} recargar={cargarVehiculos} />
                  }
                />
                <Route
                  path="/servicios"
                  element={<Servicios token={token} />}
                />
                <Route
                  path="/vehiculo/:id"
                  element={
                    <DetalleVehiculo token={token} recargar={cargarVehiculos} />
                  }
                />

                {/* Rutas en planeación */}

                <Route
                  path="/historial"
                  element={<PaginaEnConstruccion titulo="Historial Global" />}
                />

                <Route
                  path="/inventario"
                  element={<Inventario token={token} />}
                />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
