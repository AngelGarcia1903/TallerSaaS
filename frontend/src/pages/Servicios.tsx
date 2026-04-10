import { useState, useEffect } from "react";
import { ClipboardList, PlusCircle, Clock, DollarSign } from "lucide-react";

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  tiempoEstimadoMinutos: number;
}

export default function Servicios({ token }: { token: string }) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarServicios = async () => {
    try {
      const res = await fetch(
        "http://localhost:5011/api/talleres/1/servicios",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setServicios(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const agregarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch("http://localhost:5011/api/servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          precio: parseFloat(precio),
          tiempoEstimadoMinutos: parseInt(tiempo),
          tallerId: 1,
        }),
      });
      if (res.ok) {
        setNombre("");
        setPrecio("");
        setTiempo("");
        cargarServicios();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORMULARIO PARA CREAR SERVICIO */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <PlusCircle className="text-rose-500" /> Nuevo Servicio
            </h2>
            <form onSubmit={agregarServicio} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ej. Cambio de Aceite"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Precio (MXN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
                    placeholder="850.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Tiempo Estimado (Minutos)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Clock size={18} />
                  </div>
                  <input
                    type="number"
                    value={tiempo}
                    onChange={(e) => setTiempo(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
                    placeholder="45"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 mt-2 rounded-xl transition shadow-lg shadow-rose-600/30 flex justify-center items-center gap-2"
              >
                {cargando ? "Guardando..." : "Guardar al Catálogo"}
              </button>
            </form>
          </div>
        </div>

        {/* LISTA DEL CATÁLOGO */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[500px]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <ClipboardList className="text-rose-500" /> Catálogo Actual
            </h3>

            {servicios.length === 0 ? (
              <div className="text-center py-20">
                <ClipboardList
                  size={48}
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                />
                <h4 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                  Aún no hay servicios
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  Agrega tu primer servicio para empezar a cotizar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {servicios.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f111a] border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {srv.nombre}
                      </h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-lg">
                        <DollarSign size={14} /> {srv.precio.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Clock size={14} /> {srv.tiempoEstimadoMinutos} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
