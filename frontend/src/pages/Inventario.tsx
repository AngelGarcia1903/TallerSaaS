import { useState, useEffect } from "react";
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Filter,
  Image as ImageIcon,
  TrendingUp,
  ArrowDown,
  X,
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

  // ESTADOS PARA LOS MODALES
  const [mostrarModalCat, setMostrarModalCat] = useState(false);
  const [mostrarModalProd, setMostrarModalProd] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Formulario Categoría
  const [nuevaCat, setNuevaCat] = useState("");

  // Formulario Producto
  const [formProd, setFormProd] = useState({
    nombre: "",
    marca: "",
    proveedor: "",
    categoriaId: "",
    costoCompra: "",
    precioVenta: "",
    stockActual: "",
    stockMinimo: "",
    imagenUrl: "",
  });

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

  // 💾 FUNCIONES DE GUARDADO
  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch("http://localhost:5011/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevaCat,
          colorHex: "#f43f5e",
          tallerId: 1,
        }),
      });
      if (res.ok) {
        setNuevaCat("");
        setMostrarModalCat(false);
        cargarDatos();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch("http://localhost:5011/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formProd,
          categoriaId: parseInt(formProd.categoriaId),
          costoCompra: parseFloat(formProd.costoCompra),
          precioVenta: parseFloat(formProd.precioVenta),
          stockActual: parseInt(formProd.stockActual),
          stockMinimo: parseInt(formProd.stockMinimo),
          tallerId: 1,
        }),
      });
      if (res.ok) {
        setFormProd({
          nombre: "",
          marca: "",
          proveedor: "",
          categoriaId: "",
          costoCompra: "",
          precioVenta: "",
          stockActual: "",
          stockMinimo: "",
          imagenUrl: "",
        });
        setMostrarModalProd(false);
        cargarDatos();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrado
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
      {/* HEADER */}
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
          <div
            className="relative flex-1 md:w-80"
            title="Busca por nombre, marca o proveedor"
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar producto, marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white shadow-sm"
            />
          </div>

          {/* BOTÓN NUEVO PRODUCTO CON EVENTO ONCLICK Y TITLE */}
          <button
            onClick={() => setMostrarModalProd(true)}
            title="Registrar un nuevo producto en el inventario"
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2 font-bold"
          >
            <PlusCircle size={20} />{" "}
            <span className="hidden sm:block">Nuevo</span>
          </button>
        </div>
      </div>

      {/* CINTA DE CATEGORÍAS */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCatSeleccionada("Todas")}
          title="Ver todos los productos"
          className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${catSeleccionada === "Todas" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md" : "bg-white dark:bg-[#1a1d27] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
        >
          📦 Todas
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCatSeleccionada(cat.id)}
            title={`Filtrar por ${cat.nombre}`}
            className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${catSeleccionada === cat.id ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md" : "bg-white dark:bg-[#1a1d27] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
          >
            {cat.nombre}
          </button>
        ))}

        {/* BOTÓN NUEVA CATEGORÍA CON EVENTO ONCLICK */}
        <button
          onClick={() => setMostrarModalCat(true)}
          title="Añadir una nueva clasificación (Ej. Llantas, Aceites)"
          className="shrink-0 px-4 py-2.5 rounded-full font-bold text-sm border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2f3e] transition flex items-center gap-1"
        >
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
              Agrega categorías y luego productos a tu inventario.
            </p>
          </div>
        ) : (
          productosFiltrados.map((p) => {
            const alertaStock = p.stockActual <= p.stockMinimo;
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/50 transition group overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md"
                title={`Ver detalles de ${p.nombre}`}
              >
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
                    <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div title="Costo al proveedor">
                        <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                          <ArrowDown size={12} /> Costo
                        </p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          ${p.costoCompra}
                        </p>
                      </div>
                      <div
                        className="text-right"
                        title="Precio para el cliente"
                      >
                        <p className="text-[10px] text-emerald-500 uppercase font-bold flex items-center gap-1 justify-end">
                          <TrendingUp size={12} /> Venta
                        </p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ${p.precioVenta}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500"
                        title="Fecha del último resurtido"
                      >
                        <Calendar size={14} className="text-gray-400" />{" "}
                        {new Date(p.ultimoSurtido).toLocaleDateString()}
                      </div>
                      <div
                        title={
                          alertaStock
                            ? "¡Stock bajo! Necesitas resurtir pronto"
                            : "Stock saludable"
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold border ${alertaStock ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 animate-pulse" : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-[#2a2f3e] dark:text-gray-300 dark:border-gray-700"}`}
                      >
                        {alertaStock && <AlertTriangle size={14} />} Stock:{" "}
                        {p.stockActual}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔴 MODAL: NUEVA CATEGORÍA */}
      {mostrarModalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">
                Nueva Categoría
              </h3>
              <button
                onClick={() => setMostrarModalCat(false)}
                className="text-gray-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={guardarCategoria} className="space-y-4">
              <input
                type="text"
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                required
                placeholder="Ej. Aceites, Llantas, Filtros..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
              />
              <button
                disabled={cargando || !nuevaCat}
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
              >
                Guardar Categoría
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 MODAL: NUEVO PRODUCTO */}
      {mostrarModalProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Package className="text-rose-500" /> Registrar Producto
              </h3>
              <button
                onClick={() => setMostrarModalProd(false)}
                className="text-gray-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>

            {categorias.length === 0 ? (
              <div className="bg-orange-50 text-orange-600 p-4 rounded-xl text-center font-medium">
                ⚠️ Primero debes crear al menos una Categoría antes de agregar
                productos.
              </div>
            ) : (
              <form onSubmit={guardarProducto} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Nombre del Producto
                    </label>
                    <input
                      required
                      type="text"
                      value={formProd.nombre}
                      onChange={(e) =>
                        setFormProd({ ...formProd, nombre: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="Ej. Aceite Sintético 5W-30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Categoría
                    </label>
                    <select
                      required
                      value={formProd.categoriaId}
                      onChange={(e) =>
                        setFormProd({
                          ...formProd,
                          categoriaId: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Marca
                    </label>
                    <input
                      required
                      type="text"
                      value={formProd.marca}
                      onChange={(e) =>
                        setFormProd({ ...formProd, marca: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="Ej. Castrol"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Proveedor
                    </label>
                    <input
                      required
                      type="text"
                      value={formProd.proveedor}
                      onChange={(e) =>
                        setFormProd({ ...formProd, proveedor: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="Ej. AutoZone"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Costo de Compra ($)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formProd.costoCompra}
                      onChange={(e) =>
                        setFormProd({
                          ...formProd,
                          costoCompra: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Precio de Venta ($)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formProd.precioVenta}
                      onChange={(e) =>
                        setFormProd({
                          ...formProd,
                          precioVenta: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Stock Ingresado (Cant.)
                    </label>
                    <input
                      required
                      type="number"
                      value={formProd.stockActual}
                      onChange={(e) =>
                        setFormProd({
                          ...formProd,
                          stockActual: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Alerta de Stock Mínimo
                    </label>
                    <input
                      required
                      type="number"
                      value={formProd.stockMinimo}
                      onChange={(e) =>
                        setFormProd({
                          ...formProd,
                          stockMinimo: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="3"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      URL de Imagen (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formProd.imagenUrl}
                      onChange={(e) =>
                        setFormProd({ ...formProd, imagenUrl: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-[#0f111a] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>
                <button
                  disabled={cargando}
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 mt-4 rounded-xl disabled:opacity-50"
                >
                  Guardar en Inventario
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
