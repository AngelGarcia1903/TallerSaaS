import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Car,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  Wrench,
} from "lucide-react";

export default function RastreoCliente() {
  const { placa } = useParams();
  const [datos, setDatos] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5011/api/publico/rastreo/${placa}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setDatos(data))
      .catch(() => setError(true));
  }, [placa]);

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-100 p-4 rounded-full text-rose-600 mb-4">
          <Car size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Vehículo no encontrado
        </h1>
        <p className="text-gray-500 mt-2">
          Verifica que la placa sea correcta o contacta a tu taller.
        </p>
      </div>
    );

  if (!datos)
    return <div className="p-10 text-center">Consultando estatus...</div>;

  const { Vehiculo, Historial } = datos;

  // Lógica del "Pizza Tracker"
  const estados = ["En Espera", "En Reparación", "Listo"];
  const pasoActual = estados.indexOf(Vehiculo.estadoActual);

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-10 font-sans">
      {/* HEADER PREMIUM */}
      <header className="bg-gradient-to-r from-rose-600 to-fuchsia-800 text-white p-8 rounded-b-[2.5rem] shadow-lg">
        <div className="max-w-md mx-auto">
          <p className="text-rose-100 text-sm font-bold uppercase tracking-widest mb-1">
            Estatus de Servicio
          </p>
          <h1 className="text-4xl font-black mb-2 uppercase">
            {Vehiculo.placa}
          </h1>
          <p className="text-white/80 font-medium">
            {Vehiculo.marca} {Vehiculo.modelo}
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* PROGRESS TRACKER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
            <div
              className={`absolute top-5 left-0 h-1 bg-rose-500 transition-all duration-500 -z-0`}
              style={{ width: `${(pasoActual / 2) * 100}%` }}
            ></div>

            {estados.map((est, idx) => (
              <div key={est} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${idx <= pasoActual ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  {idx < pasoActual ? (
                    <CheckCircle size={18} />
                  ) : idx === 1 ? (
                    <Wrench size={18} />
                  ) : (
                    <Clock size={18} />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-2 font-bold uppercase ${idx <= pasoActual ? "text-rose-600" : "text-gray-400"}`}
                >
                  {est}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <p className="text-rose-900 font-bold text-lg">
              {Vehiculo.estadoActual === "En Reparación"
                ? "🛠️ Estamos trabajando en tu auto"
                : Vehiculo.estadoActual === "Listo"
                  ? "✅ ¡Tu auto está listo!"
                  : "🕒 En fila de espera"}
            </p>
          </div>
        </div>

        {/* INFO DEL TALLER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-widest">
            Información del Taller
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {Vehiculo.tallerNombre}
                </p>
                <p className="text-sm text-gray-500">
                  {Vehiculo.tallerDireccion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LÍNEA DE TIEMPO PÚBLICA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-6 tracking-widest flex items-center gap-2">
            <Activity size={16} /> Historial de Servicio
          </h3>
          <div className="space-y-6 border-l-2 border-gray-50 ml-2">
            {Historial.map((h: any) => (
              <div key={h.id} className="relative pl-6 pb-2">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-rose-500 rounded-full"></div>
                <p className="text-sm font-bold text-gray-800">
                  {h.descripcion}
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase">
                  {new Date(h.fechaHora).toLocaleDateString()} •{" "}
                  {new Date(h.fechaHora).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center px-6">
        <p className="text-xs text-gray-400">
          Desarrollado por AutoTrace SaaS • Control de Calidad Industrial
        </p>
      </footer>
    </div>
  );
}
