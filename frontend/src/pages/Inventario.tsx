import { useState, useEffect } from "react";
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Filter,
  TrendingUp,
  ArrowDown,
  ImageIcon,
} from "lucide-react";

interface Producto {
  id: number;
  nombre: string;
  marca: string;
  proveedor: string;
  costoCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  ultimoSurtido: string;
  categoriaId: number;
  imagenUrl: string;
}

interface Categoria {
  id: number;
  nombre: string;
  colorHex: string;
}

export default function Inventario({ token }: { token: string }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [catSeleccionada, setCatSeleccionada] = useState<number | "Todas">(
    "Todas",
  );

  const cargarDatos = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("http://localhost:5011/api/talleres/1/productos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5011/api/talleres/1/categorias", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica de filtrado combinada (Búsqueda + Categoría)
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      catSeleccionada === "Todas" || p.categoriaId === catSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER: TÍTULO Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-rose-500" size={32} /> Inventario
          </h2>
          <p className="text-gray-500 font-medium">
            Gestiona tus refacciones, aceites y herramientas.
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar producto, marca o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white shadow-sm"
            />
          </div>
          <button className="bg-white dark:bg-[#1a1d27] p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-rose-500 transition shadow-sm">
            <Filter size={20} />
          </button>
          {/* BOTÓN PARA ABRIR MODAL DE NUEVO PRODUCTO (Por hacer) */}
          <button className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2 font-bold">
            <PlusCircle size={20} />{" "}
            <span className="hidden sm:block">Nuevo</span>
          </button>
        </div>
      </div>

      {/* CINTA DE CATEGORÍAS (RIBBON) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCatSeleccionada("Todas")}
          className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${catSeleccionada === "Todas" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md" : "bg-white dark:bg-[#1a1d27] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
        >
          📦 Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCatSeleccionada(cat.id)}
            className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${catSeleccionada === cat.id ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md" : "bg-white dark:bg-[#1a1d27] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
          >
            {cat.nombre}
          </button>
        ))}
        {/* BOTÓN PARA AÑADIR NUEVA CATEGORÍA */}
        <button className="shrink-0 px-4 py-2.5 rounded-full font-bold text-sm border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2f3e] transition flex items-center gap-1">
          <PlusCircle size={16} /> Categoría
        </button>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-[#1a1d27] rounded-3xl border border-gray-100 dark:border-gray-800">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">
              No hay productos
            </h3>
            <p className="text-gray-400 mt-2">
              Agrega productos al inventario o ajusta los filtros.
            </p>
          </div>
        ) : (
          productosFiltrados.map((p) => {
            // LÓGICA DE TU IDEA ESTRELLA: ALERTA DE STOCK
            const alertaStock = p.stockActual <= p.stockMinimo;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/50 transition group overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md"
              >
                {/* IMAGEN DEL PRODUCTO (Placeholder o Real) */}
                <div className="h-40 bg-gray-100 dark:bg-[#0f111a] relative flex items-center justify-center">
                  {p.imagenUrl ? (
                    <img
                      src={p.imagenUrl}
                      alt={p.nombre}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                  ) : (
                    <ImageIcon
                      size={48}
                      className="text-gray-300 dark:text-gray-800"
                    />
                  )}
                  {/* Etiqueta de Marca */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
                    {p.marca}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                      {p.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">
                      {p.proveedor}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4">
                    {/* PRECIOS */}
                    <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                          <ArrowDown size={12} /> Costo
                        </p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          ${p.costoCompra}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-500 uppercase font-bold flex items-center gap-1 justify-end">
                          <TrendingUp size={12} /> Venta
                        </p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ${p.precioVenta}
                        </p>
                      </div>
                    </div>

                    {/* FECHA Y STOCK */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Calendar size={14} className="text-gray-400" />{" "}
                        {new Date(p.ultimoSurtido).toLocaleDateString()}
                      </div>

                      {/* TU ALERTA DE STOCK MINIMO AQUÍ */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold border ${alertaStock ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 animate-pulse" : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-[#2a2f3e] dark:text-gray-300 dark:border-gray-700"}`}
                      >
                        {alertaStock && <AlertTriangle size={14} />}
                        Stock: {p.stockActual}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
