namespace TallerSaaS.Models;

public class Usuario
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    
    // NUNCA guardamos contraseñas reales, guardamos un "Hash" (texto encriptado irreversible)
    public string PasswordHash { get; set; } = string.Empty;

    // Relación: Este usuario trabaja para un taller específico
    public int TallerId { get; set; }
    public Taller? Taller { get; set; }
}