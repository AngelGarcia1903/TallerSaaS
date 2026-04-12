import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";

interface Props {
  token: string;
  recargar: () => void;
}

export default function NuevoIngreso({ token, recargar }: Props) {
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [problema, setProblema] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const registrarAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:5011/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placa,
          marca,
          modelo,
          problemaReportado: problema,
          tallerId: 1,
        }),
      });

      if (respuesta.ok) {
        recargar(); // Actualizamos la lista global en App.tsx
        navigate("/vehiculos"); // Redirigimos al usuario a la tabla
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#1a1d27] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <span className="text-rose-500">
          <PlusCircle size={28} />
        </span>{" "}
        Ingresar Vehículo
      </h2>

      <form onSubmit={registrarAuto} className="space-y-5">
        {/* Placa */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Placa
          </label>
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white uppercase transition-colors"
            placeholder="ABC-123"
          />
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Marca
          </label>
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
            placeholder="Ej. Nissan, Honda, Ford..."
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Modelo
          </label>
          <input
            type="text"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white transition-colors"
            placeholder="Honda Civic"
          />
        </div>

        {/* Problema Reportado */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Problema Reportado
          </label>
          <textarea
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            rows={3}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white resize-none transition-colors"
            placeholder="Describe el problema del cliente..."
          />
        </div>

        {/*Boton de guardar*/}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-rose-600/30 flex justify-center items-center gap-2"
        >
          {cargando ? "Guardando..." : "Guardar Vehículo"}
        </button>
      </form>
    </div>
  );
}
