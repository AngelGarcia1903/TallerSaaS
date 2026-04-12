namespace TallerSaaS.Models;

public class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Proveedor { get; set; } = string.Empty;
    public string ImagenUrl { get; set; } = string.Empty;
    
    // Finanzas
    public decimal CostoCompra { get; set; }
    public decimal PrecioVenta { get; set; }
    
    // Control de Stock
    public int StockActual { get; set; }
    public int StockMinimo { get; set; } // ¡Tu idea brillante!
    public DateTime UltimoSurtido { get; set; } = DateTime.UtcNow;

    // Relaciones
    public int CategoriaId { get; set; }
    public CategoriaInventario? Categoria { get; set; }

    public int TallerId { get; set; }
    public Taller? Taller { get; set; }
}