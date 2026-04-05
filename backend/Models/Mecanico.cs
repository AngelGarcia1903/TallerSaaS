namespace TallerSaaS.Models;

public class Mecanico
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;

    // Relación: El mecánico trabaja en un taller específico
    public int TallerId { get; set; }
    public Taller? Taller { get; set; }
}