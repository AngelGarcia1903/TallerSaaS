namespace TallerSaaS.Models;

public class Vehiculo
{
    public int Id { get; set; }
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    
    // --- NUEVOS CAMPOS DEL DISEÑO DE FIGMA ---
    public string ProblemaReportado { get; set; } = string.Empty;
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow; // Se guarda la fecha exacta automáticamente
    
    // Cambiamos el booleano por un string para tener más opciones: "En Reparación", "Listo", "En Espera"
    public string EstadoActual { get; set; } = "En Espera"; 

    // Relación Multitenant
    public int TallerId { get; set; } 
    public Taller? Taller { get; set; } 
}