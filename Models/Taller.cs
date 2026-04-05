namespace TallerSaaS.Models;

public class Taller
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Dueño { get; set; } = string.Empty;
    
    // Relación: Un taller tiene una lista de muchos vehículos
    public List<Vehiculo> Vehiculos { get; set; } = new();
}