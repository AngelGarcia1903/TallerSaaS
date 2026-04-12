namespace TallerSaaS.Models;

public class Vehiculo
{
    public int Id { get; set; }
    public string Marca { get; set; } = string.Empty; // ⬅️ NUEVO CAMPO
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string ProblemaReportado { get; set; } = string.Empty;
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;
    public string EstadoActual { get; set; } = "En Espera"; 
    public int TallerId { get; set; } 
    public Taller? Taller { get; set; } 
}