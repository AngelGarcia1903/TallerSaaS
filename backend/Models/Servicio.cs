namespace TallerSaaS.Models;

public class Servicio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; } // Usamos decimal para dinero
    public int TiempoEstimadoMinutos { get; set; }

    // Relación: Cada servicio le pertenece a un Taller específico
    public int TallerId { get; set; }
    public Taller? Taller { get; set; }
}