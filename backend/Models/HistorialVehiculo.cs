namespace TallerSaaS.Models;

public class HistorialVehiculo
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty; // Ej: "Iniciado diagnóstico"
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    // Relación: Este historial pertenece a un vehículo en particular
    public int VehiculoId { get; set; }
    public Vehiculo? Vehiculo { get; set; }
}