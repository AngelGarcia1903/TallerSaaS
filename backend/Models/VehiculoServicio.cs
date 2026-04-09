namespace TallerSaaS.Models;

public class VehiculoServicio
{
    public int Id { get; set; }
    
    // Conectamos con el Auto
    public int VehiculoId { get; set; }
    public Vehiculo? Vehiculo { get; set; }

    // Conectamos con el Servicio del catálogo
    public int ServicioId { get; set; }
    public Servicio? Servicio { get; set; }

    // Para que el mecánico marque con una palomita cuando termine esta tarea específica
    public bool Terminado { get; set; } = false; 
}