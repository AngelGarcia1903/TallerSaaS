import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ⬅️ La magia para que el modal cubra toda la pantalla
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  Filter,
  Edit3,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
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
  categoria?: Categoria;
}

interface Categoria {
  id: number;
  nombre: string;
  colorHex: string;
}

export default function Inventario({ token }: { token: string }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Pestañas (Tabs)
  const [pestaña, setPestaña] = useState<"Productos" | "Categorias">(
    "Productos",
  );

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [catSeleccionada, setCatSeleccionada] = useState<number | "Todas">(
    "Todas",
  );

  // Estados de Modales
  const [modalCat, setModalCat] = useState<{
    visible: boolean;
    modo: "Crear" | "Editar";
    id?: number;
    nombre: string;
  }>({ visible: false, modo: "Crear", nombre: "" });
  const [mostrarModalProd, setMostrarModalProd] = useState(false);
  const [cargando, setCargando] = useState(false);

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

  // 💾 LÓGICA DE CATEGORÍAS (CRUD Completo)
  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const url =
        modalCat.modo === "Crear"
          ? "http://localhost:5011/api/categorias"
          : `http://localhost:5011/api/categorias/${modalCat.id}`;
      const method = modalCat.modo === "Crear" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: modalCat.nombre,
          colorHex: "#e11d48",
          tallerId: 1,
        }),
      });
      if (res.ok) {
        setModalCat({ visible: false, modo: "Crear", nombre: "" });
        cargarDatos();
      }
    } catch (error) {
      alert("Hubo un error al guardar.");
    } finally {
      setCargando(false);
    }
  };

  const eliminarCategoria = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await fetch(`http://localhost:5011/api/categorias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDatos();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  // 💾 LÓGICA DE PRODUCTOS
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
      alert("Hubo un error al guardar el producto.");
    } finally {
      setCargando(false);
    }
  };

  // Métricas
  const productosBajosStock = productos.filter(
    (p) => p.stockActual <= p.stockMinimo,
  );
  const valorTotal = productos.reduce(
    (acc, p) => acc + p.costoCompra * p.stockActual,
    0,
  );
  const unidadesTotal = productos.reduce((acc, p) => acc + p.stockActual, 0);

  // Filtrado de grid
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      catSeleccionada === "Todas" || p.categoriaId === catSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* 📊 KPI DASHBOARD SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e2230] p-5 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-2">Total Productos</p>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-white">
              {productos.length}
            </h3>
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
              <Package size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2">En el catálogo</p>
        </div>
        <div className="bg-[#1e2230] p-5 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-2">Valor Total (Costo)</p>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-white">
              ${valorTotal.toLocaleString()}
            </h3>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="bg-[#1e2230] p-5 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-gray-400 text-sm mb-2">Unidades Totales</p>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-white">{unidadesTotal}</h3>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        <div className="bg-[#1e2230] p-5 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
          {/* Brillo rojo para advertencia */}
          {productosBajosStock.length > 0 && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 blur-[50px] opacity-20"></div>
          )}
          <p className="text-gray-400 text-sm mb-2 relative z-10">Stock Bajo</p>
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-3xl font-bold text-white">
              {productosBajosStock.length}
            </h3>
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white animate-pulse">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xs text-rose-400 mt-2 relative z-10">
            Requieren atención
          </p>
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <div className="inline-flex bg-[#1a1d27] p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => setPestaña("Productos")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${pestaña === "Productos" ? "bg-[#2a2f3e] text-white shadow" : "text-gray-400 hover:text-white"}`}
        >
          Productos
        </button>
        <button
          onClick={() => setPestaña("Categorias")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${pestaña === "Categorias" ? "bg-[#2a2f3e] text-white shadow" : "text-gray-400 hover:text-white"}`}
        >
          Categorías
        </button>
      </div>

      {/* VISTA 1: CATEGORÍAS */}
      {pestaña === "Categorias" && (
        <div className="space-y-6">
          <div className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Gestión de Categorías
              </h3>
              <p className="text-sm text-gray-400">
                Organiza tu inventario en categorías personalizadas.
              </p>
            </div>
            <button
              onClick={() =>
                setModalCat({ visible: true, modo: "Crear", nombre: "" })
              }
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition"
            >
              <PlusCircle size={18} /> Nueva Categoría
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#1a1d27] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition group flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800/50"
                    style={{ color: cat.colorHex }}
                  >
                    <Package size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() =>
                        setModalCat({
                          visible: true,
                          modo: "Editar",
                          id: cat.id,
                          nombre: cat.nombre,
                        })
                      }
                      className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-lg"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => eliminarCategoria(cat.id)}
                      className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-white">{cat.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {productos.filter((p) => p.categoriaId === cat.id).length}{" "}
                  productos vinculados
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: PRODUCTOS */}
      {pestaña === "Productos" && (
        <div className="space-y-6">
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="bg-[#1a1d27] p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white text-sm"
              />
            </div>
            <select
              value={catSeleccionada}
              onChange={(e) =>
                setCatSeleccionada(
                  e.target.value === "Todas"
                    ? "Todas"
                    : parseInt(e.target.value),
                )
              }
              className="bg-[#0f111a] border border-gray-800 text-white px-4 py-3 rounded-xl outline-none text-sm min-w-[200px]"
            >
              <option value="Todas">Toda las Categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={() => setMostrarModalProd(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/20 whitespace-nowrap"
            >
              <PlusCircle size={18} /> Nuevo Producto
            </button>
          </div>

          {/* BANNER DE ALERTA (SOLO SI HAY STOCK BAJO) */}
          {productosBajosStock.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-2xl flex items-center gap-4">
              <div className="text-rose-500 bg-rose-500/10 p-3 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-rose-500 font-bold text-lg">
                  {productosBajosStock.length} productos con stock bajo
                </h4>
                <p className="text-rose-300/70 text-sm">
                  Considera reabastecer estos productos pronto para no retrasar
                  los servicios.
                </p>
              </div>
            </div>
          )}

          {/* GRID DE PRODUCTOS (DISEÑO FIGMA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((p) => {
              const porcentaje = Math.min(
                (p.stockActual / (p.stockMinimo * 3)) * 100,
                100,
              );
              const alerta = p.stockActual <= p.stockMinimo;

              // Generamos un código falso visual usando el ID
              const codigoFalso = `COD-${p.id.toString().padStart(4, "0")}`;

              return (
                <div
                  key={p.id}
                  className="bg-[#1a1d27] rounded-2xl border border-gray-800 p-6 hover:border-gray-600 transition flex flex-col justify-between h-full"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {p.nombre}
                    </h3>
                    <p className="text-gray-500 text-xs mb-4">
                      Código: {codigoFalso}
                    </p>

                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                        {categorias.find((c) => c.id === p.categoriaId)
                          ?.nombre || "Sin Categoría"}
                      </span>
                      <span className="text-lg font-black text-white">
                        ${p.precioVenta.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-6">
                      Proveedor:{" "}
                      <span className="text-white font-medium">
                        {p.proveedor}
                      </span>
                    </p>
                  </div>

                  {/* BARRA DE PROGRESO DE STOCK */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm text-gray-400">Stock disponible</p>
                      <p
                        className={`font-bold ${alerta ? "text-rose-500" : "text-emerald-500"}`}
                      >
                        {p.stockActual} unidades
                      </p>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${alerta ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mínimo: {p.stockMinimo} unidades
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔴 PORTAL PARA MODALES (Cubre el 100% de la pantalla) */}
      {/* ========================================================= */}

      {modalCat.visible &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1d27] rounded-3xl p-6 w-full max-w-sm border border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {modalCat.modo === "Crear"
                    ? "Nueva Categoría"
                    : "Editar Categoría"}
                </h3>
                <button
                  onClick={() =>
                    setModalCat({ visible: false, modo: "Crear", nombre: "" })
                  }
                  className="text-gray-400 hover:text-rose-500"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={guardarCategoria} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={modalCat.nombre}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, nombre: e.target.value })
                    }
                    required
                    placeholder="Ej. Llantas, Filtros..."
                    className="w-full px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                  />
                </div>
                <button
                  disabled={cargando || !modalCat.nombre.trim()}
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition"
                >
                  {cargando ? "Guardando..." : "Guardar"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {mostrarModalProd &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1d27] rounded-3xl p-8 w-full max-w-3xl border border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
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
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-4 rounded-xl text-center font-medium">
                  ⚠️ Ve a la pestaña de Categorías y crea al menos una antes de
                  agregar productos.
                </div>
              ) : (
                <form onSubmit={guardarProducto} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Nombre
                      </label>
                      <input
                        required
                        type="text"
                        value={formProd.nombre}
                        onChange={(e) =>
                          setFormProd({ ...formProd, nombre: e.target.value })
                        }
                        className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                        placeholder="Ej. Aceite Sintético 5W-30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
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
                        className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
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
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Proveedor
                      </label>
                      <input
                        required
                        type="text"
                        value={formProd.proveedor}
                        onChange={(e) =>
                          setFormProd({
                            ...formProd,
                            proveedor: e.target.value,
                          })
                        }
                        className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                        placeholder="Ej. AutoZone"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
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
                        className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
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
                        className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">
                          Stock Actual
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
                          className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">
                          Alerta (Mínimo)
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
                          className="w-full mt-1.5 px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl outline-none focus:border-rose-500 text-white"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={cargando}
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition mt-4"
                  >
                    Guardar Producto
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
