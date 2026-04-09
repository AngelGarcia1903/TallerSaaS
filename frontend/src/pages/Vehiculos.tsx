import { Car, Wrench } from "lucide-react";
import { Link } from "react-router-dom"; // ⬅️ 1. IMPORTAMOS LINK

interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  problemaReportado: string;
  estadoActual: string;
  fechaIngreso: string;
}

export default function Vehiculos({ vehiculos }: { vehiculos: Vehiculo[] }) {
  if (vehiculos.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#1a1d27] rounded-3xl border border-gray-100 dark:border-gray-800">
        <Car
          size={48}
          className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
        />
        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
          No hay vehículos registrados
        </h3>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Los autos que ingreses aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiculos.map((auto) => (
        <Link
          to={`/vehiculo/${auto.id}`}
          key={auto.id}
          className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/50 hover:shadow-md transition group shadow-sm flex flex-col justify-between h-full cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#2a2f3e] text-gray-600 dark:text-gray-400">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                    {auto.placa}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {auto.modelo}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-4 line-clamp-2">
              "{auto.problemaReportado || "Sin problema especificado"}"
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border 
              ${
                auto.estadoActual === "Listo"
                  ? "border-emerald-600/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-500"
                  : auto.estadoActual === "En Reparación"
                    ? "border-yellow-600/20 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-500"
                    : "border-orange-600/20 text-orange-600 bg-orange-50 dark:bg-orange-900/10 dark:text-orange-500"
              }`}
            >
              <Wrench size={12} /> {auto.estadoActual}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {new Date(auto.fechaIngreso).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
