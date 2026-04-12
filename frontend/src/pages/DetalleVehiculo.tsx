import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
  Clock,
  CheckCircle,
  ArrowLeft,
  Activity,
  FileText,
  Send,
  Wrench,
  PlusCircle,
  DollarSign,
  Play,
} from "lucide-react";

interface Props {
  token: string;
  recargar: () => void;
}

// Interfaz para lo que nos devuelve C#
interface ServicioAsignado {
  id: number;
  terminado: boolean;
  servicioNombre: string;
  servicioPrecio: number;
  tiempoEstimado: number;
}

export default function DetalleVehiculo({ token, recargar }: Props) {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [nota, setNota] = useState("");
  const [actualizando, setActualizando] = useState(false);

  // --- NUEVOS ESTADOS PARA SERVICIOS ---
  const [serviciosCatalogo, setServiciosCatalogo] = useState<any[]>([]);
  const [serviciosAsignados, setServiciosAsignados] = useState<
    ServicioAsignado[]
  >([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");

  const cargarDatos = async () => {
    try {
      const [resVehiculo, resHistorial, resCatalogo, resAsignados] =
        await Promise.all([
          fetch(`http://localhost:5011/api/vehiculos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5011/api/vehiculos/${id}/historial`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5011/api/talleres/1/servicios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5011/api/vehiculos/${id}/servicios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (resVehiculo.ok) setVehiculo(await resVehiculo.json());
      if (resHistorial.ok) setHistorial(await resHistorial.json());
      if (resCatalogo.ok) setServiciosCatalogo(await resCatalogo.json());
      if (resAsignados.ok) setServiciosAsignados(await resAsignados.json());
    } catch (error) {
      console.error(error);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    // 🔴 Agregamos un Modal Nativo de confirmación antes de iniciar
    if (nuevoEstado === "En Reparación" && serviciosAsignados.length === 0) {
      alert(
        "⚠️ Debes asignar al menos un servicio antes de iniciar la reparación.",
      );
      return;
    }

    if (nuevoEstado === "En Reparación") {
      const confirmacion = window.confirm(
        `¿Iniciar reparación? Tiempo estimado: ${tiempoTotal} minutos.`,
      );
      if (!confirmacion) return;
    }

    if (nuevoEstado === "Listo") {
      const confirmacion = window.confirm(
        "¿Confirmas que el vehículo está terminado y listo para entrega?",
      );
      if (!confirmacion) return;
    }

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
        recargar();
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
      await fetch(`http://localhost:5011/api/vehiculos/${id}/notas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nota }),
      });
      setNota("");
      cargarDatos();
    } catch (error) {
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };

  const asignarServicio = async () => {
    if (!servicioSeleccionado) return;
    setActualizando(true);
    try {
      await fetch(`http://localhost:5011/api/vehiculos/${id}/servicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ servicioId: parseInt(servicioSeleccionado) }),
      });
      setServicioSeleccionado("");
      cargarDatos();
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
    return <div className="p-8 text-center">Cargando vehículo...</div>;

  // Cálculos matemáticos de la cotización
  const tiempoTotal = serviciosAsignados.reduce(
    (total, s) => total + s.tiempoEstimado,
    0,
  );
  const precioTotal = serviciosAsignados.reduce(
    (total, s) => total + s.servicioPrecio,
    0,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        to="/vehiculos"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 transition font-medium"
      >
        <ArrowLeft size={20} /> Volver a Vehículos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: INFORMACIÓN, COTIZACIÓN Y FLUJO ESTRICTO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1a1d27] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {vehiculo.placa}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">
              {vehiculo.modelo}
            </p>

            <div className="p-3 bg-gray-50 dark:bg-[#0f111a] rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                Reporte del Cliente
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{vehiculo.problemaReportado}"
              </p>
            </div>

            {/* 🛠️ ASIGNACIÓN DE SERVICIOS */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                Servicios Requeridos
              </h3>

              {vehiculo.estadoActual === "En Espera" && (
                <div className="flex gap-2">
                  <select
                    value={servicioSeleccionado}
                    onChange={(e) => setServicioSeleccionado(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none text-sm dark:text-white focus:border-rose-500 transition"
                  >
                    <option value="">Seleccionar del catálogo...</option>
                    {serviciosCatalogo.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} - ${s.precio}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={asignarServicio}
                    disabled={!servicioSeleccionado || actualizando}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 rounded-xl hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition disabled:opacity-50"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              )}

              {/* LISTA DE SERVICIOS COTIZADOS */}
              <div className="space-y-2">
                {serviciosAsignados.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Ningún servicio asignado aún.
                  </p>
                ) : (
                  serviciosAsignados.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center bg-gray-50 dark:bg-[#0f111a] p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {s.servicioNombre}
                      </span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-500">
                        ${s.servicioPrecio}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* TOTALES */}
              {serviciosAsignados.length > 0 && (
                <div className="flex justify-between items-center pt-2 px-1">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                    <Clock size={16} /> {tiempoTotal} min
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                    <DollarSign size={18} /> {precioTotal.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* 🚦 MÁQUINA DE ESTADOS ESTRICTA */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 font-bold uppercase mb-3">
                Acción Principal
              </p>

              {vehiculo.estadoActual === "En Espera" && (
                <button
                  onClick={() => cambiarEstado("En Reparación")}
                  disabled={actualizando || serviciosAsignados.length === 0}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={20} className="fill-current" /> Iniciar Reparación
                </button>
              )}

              {vehiculo.estadoActual === "En Reparación" && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-xl flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-500 font-bold animate-pulse">
                    <Wrench size={18} /> Vehículo en el taller
                  </div>
                  <button
                    onClick={() => cambiarEstado("Listo")}
                    disabled={actualizando}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition"
                  >
                    <CheckCircle size={20} /> Marcar como Terminado
                  </button>
                </div>
              )}

              {vehiculo.estadoActual === "Listo" && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-500 font-black">
                  <CheckCircle size={24} /> Entregado / Terminado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: NOTAS Y LÍNEA DE TIEMPO (Se mantiene igual, ¡Funciona perfecto!) */}
        <div className="lg:col-span-2 space-y-6">
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
                placeholder="Ej. Se encontraron balatas cristalizadas..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
              />
              <button
                type="submit"
                disabled={actualizando || !nota.trim()}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 rounded-xl font-bold transition"
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
                const esNota = item.descripcion.includes("📝");
                return (
                  <div key={item.id} className="relative pl-6">
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
