import { Car, Clock, Wrench, TrendingUp } from "lucide-react";

// Le decimos a TypeScript qué datos esperamos recibir
interface Vehiculo {
  id: number;
  estadoActual: string;
}

export default function Dashboard({ vehiculos }: { vehiculos: Vehiculo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* TARJETA 1: TOTAL */}
      <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
            Total Vehículos
          </p>
          <h3 className="text-2xl font-bold text-rose-600 mb-2">
            {vehiculos.length}
          </h3>
          <p className="text-xs text-gray-400">Registrados en sistema</p>
        </div>
        <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-xl text-rose-600 dark:text-rose-400">
          <Car size={24} />
        </div>
      </div>

      {/* TARJETA 2: EN ESPERA */}
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

      {/* TARJETA 3: EN REPARACIÓN */}
      <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
            En Reparación
          </p>
          <h3 className="text-2xl font-bold text-yellow-500 mb-2">
            {vehiculos.filter((v) => v.estadoActual === "En Reparación").length}
          </h3>
          <p className="text-xs text-gray-400">En taller activo</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-600 dark:text-yellow-400">
          <Wrench size={24} />
        </div>
      </div>

      {/* TARJETA 4: COMPLETADOS */}
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
  );
}
