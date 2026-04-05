namespace TallerSaaS.Models;

public class Vehiculo
{
    public int Id { get; set; }
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public bool EnMantenimiento { get; set; }

    // ==========================================
    // LA MAGIA MULTITENANT (SaaS)
    // ==========================================
    public int TallerId { get; set; } // El número de identificación del taller
    public Taller? Taller { get; set; } // La conexión virtual con el objeto Taller
}