import { useState, useEffect } from "react";

// Le decimos a TypeScript qué datos esperamos recibir
interface PanelProps {
  token: string;
  onLogout: () => void;
}

interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  enMantenimiento: boolean;
}

export default function PanelVehiculos({ token, onLogout }: PanelProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [modoOscuro, setModoOscuro] = useState(false);

  // 🌙 Lógica del Modo Oscuro
  const toggleTema = () => {
    if (modoOscuro) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setModoOscuro(!modoOscuro);
  };

  // 🚗 GET: Traer los vehículos del backend CON EL TOKEN
  const cargarVehiculos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:5011/api/talleres/1/vehiculos",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ⬅️ ¡Aquí mostramos la pulsera VIP!
          },
        },
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setVehiculos(datos);
      }
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  // 📝 POST: Registrar un auto nuevo CON EL TOKEN
  const registrarAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await fetch("http://localhost:5011/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ⬅️ Guardia activado
        },
        body: JSON.stringify({
          placa,
          modelo,
          enMantenimiento: true,
          tallerId: 1,
        }),
      });

      if (respuesta.ok) {
        setPlaca("");
        setModelo("");
        cargarVehiculos(); // Recargamos la lista automáticamente
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  // Esto hace que los vehículos se carguen solos al abrir el panel
  useEffect(() => {
    cargarVehiculos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darkbg text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4 md:p-8">
      {/* NAVEGACIÓN */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white dark:bg-brand-darkcard p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-brand-darkborder mb-8 gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          ⚙️ AutoTrace{" "}
          <span className="text-brand-orange dark:text-brand-yellow">
            Panel
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTema}
            className="p-2 rounded-lg bg-gray-100 dark:bg-brand-darkbg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            {modoOscuro ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-brand-cherry text-white rounded-lg hover:bg-brand-burgundy transition font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL (Grid Responsivo) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="bg-white dark:bg-brand-darkcard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-brand-darkborder h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-yellow rounded-full"></span> Nuevo
            Ingreso
          </h2>
          <form onSubmit={registrarAuto} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa</label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-brand-darkbg border border-gray-200 dark:border-brand-darkborder rounded-lg outline-none uppercase dark:text-white"
                placeholder="ABC-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-brand-darkbg border border-gray-200 dark:border-brand-darkborder rounded-lg outline-none dark:text-white"
                placeholder="Honda Civic"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md mt-2"
            >
              Registrar Vehículo
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTA DE AUTOS */}
        <div className="lg:col-span-2 bg-white dark:bg-brand-darkcard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-brand-darkborder">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-purple rounded-full"></span>{" "}
            Vehículos en Servicio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehiculos.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                No hay vehículos registrados.
              </p>
            ) : (
              vehiculos.map((auto) => (
                <div
                  key={auto.id}
                  className={`p-4 rounded-xl border-l-4 ${auto.enMantenimiento ? "border-brand-cherry bg-brand-cherry/5" : "border-emerald-500 bg-emerald-50"} dark:bg-brand-darkbg dark:border-y dark:border-r border border-gray-200 dark:border-brand-darkborder transition`}
                >
                  <h3 className="text-xl font-bold uppercase">{auto.placa}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {auto.modelo}
                  </p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${auto.enMantenimiento ? "text-brand-cherry" : "text-emerald-600"}`}
                  >
                    {auto.enMantenimiento ? "🛠️ En Reparación" : "✅ Listo"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
