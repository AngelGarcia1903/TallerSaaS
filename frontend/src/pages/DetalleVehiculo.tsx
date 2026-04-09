import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
  Wrench,
  Clock,
  CheckCircle,
  ArrowLeft,
  Activity,
  FileText,
  Send,
} from "lucide-react";

interface Props {
  token: string;
  recargar: () => void; // ⬅️ Recibimos la función para actualizar el Dashboard
}

export default function DetalleVehiculo({ token, recargar }: Props) {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [actualizando, setActualizando] = useState(false);
  const [nota, setNota] = useState(""); // Estado para la nueva nota

  const cargarDatos = async () => {
    try {
      const resVehiculo = await fetch(
        `http://localhost:5011/api/vehiculos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const resHistorial = await fetch(
        `http://localhost:5011/api/vehiculos/${id}/historial`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (resVehiculo.ok) setVehiculo(await resVehiculo.json());
      if (resHistorial.ok) setHistorial(await resHistorial.json());
    } catch (error) {
      console.error(error);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    setActualizando(true);
    try {
      const res = await fetch(
        `http://localhost:5011/api/vehiculos/${id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nuevoEstado }),
        },
      );
      if (res.ok) {
        cargarDatos();
        recargar(); // ⬅️ ¡MAGIA! Actualizamos el Dashboard global de App.tsx
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };

  const agregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota.trim()) return;
    setActualizando(true);
    try {
      const res = await fetch(
        `http://localhost:5011/api/vehiculos/${id}/notas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nota }),
        },
      );
      if (res.ok) {
        setNota(""); // Limpiamos la caja
        cargarDatos(); // Recargamos el historial para ver la nueva nota
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (!vehiculo)
    return (
      <div className="p-8 text-center text-gray-500">Cargando vehículo...</div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/vehiculos"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 transition font-medium"
      >
        <ArrowLeft size={20} /> Volver a Vehículos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: INFORMACIÓN Y ACCIONES */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#2a2f3e] rounded-2xl flex items-center justify-center text-gray-500 mb-4">
              <Car size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {vehiculo.placa}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
              {vehiculo.modelo}
            </p>

            <div className="p-4 bg-gray-50 dark:bg-[#0f111a] rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                Problema Reportado (Cliente)
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{vehiculo.problemaReportado}"
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                Flujo de Trabajo
              </p>

              <button
                onClick={() => cambiarEstado("En Espera")}
                disabled={actualizando || vehiculo.estadoActual === "En Espera"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition ${vehiculo.estadoActual === "En Espera" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500 border border-orange-500/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-[#0f111a] dark:text-gray-400 dark:hover:bg-[#2a2f3e]"}`}
              >
                <span className="flex items-center gap-2">
                  <Clock size={18} /> En Espera
                </span>
              </button>

              <button
                onClick={() => cambiarEstado("En Reparación")}
                disabled={
                  actualizando || vehiculo.estadoActual === "En Reparación"
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition ${vehiculo.estadoActual === "En Reparación" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-500/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-[#0f111a] dark:text-gray-400 dark:hover:bg-[#2a2f3e]"}`}
              >
                <span className="flex items-center gap-2">
                  <Wrench size={18} /> En Reparación
                </span>
              </button>

              <button
                onClick={() => cambiarEstado("Listo")}
                disabled={actualizando || vehiculo.estadoActual === "Listo"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition ${vehiculo.estadoActual === "Listo" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500 border border-emerald-500/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-[#0f111a] dark:text-gray-400 dark:hover:bg-[#2a2f3e]"}`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle size={18} /> Listo
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: NOTAS Y LÍNEA DE TIEMPO */}
        <div className="lg:col-span-2 space-y-6">
          {/* NUEVO: CAJA PARA AGREGAR NOTAS TÉCNICAS */}
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <FileText size={20} className="text-rose-500" /> Bitácora del
              Mecánico
            </h3>
            <form onSubmit={agregarNota} className="flex gap-3">
              <input
                type="text"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej. Se reemplazaron las bujías y filtro de aire..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
              />
              <button
                type="submit"
                disabled={actualizando || !nota.trim()}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 rounded-xl font-bold transition flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <Activity size={24} className="text-rose-500" /> Línea de Tiempo
            </h3>

            <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-8">
              {historial.map((item, index) => {
                // Detectamos si es una nota valiosa o un simple cambio de estado
                const esNota = item.descripcion.includes("📝");
                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Punto en la línea (Azul para notas, Gris para estado) */}
                    <span
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a1d27] ${index === 0 ? "bg-rose-500" : esNota ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                    ></span>

                    <div className="mb-1 flex justify-between items-start gap-4">
                      <p
                        className={`text-sm ${esNota ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30" : "font-medium text-gray-600 dark:text-gray-300"}`}
                      >
                        {item.descripcion}
                      </p>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-[#0f111a] px-2 py-1 rounded-md shrink-0">
                        {new Date(item.fechaHora).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(item.fechaHora).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
