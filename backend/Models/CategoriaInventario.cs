namespace TallerSaaS.Models;

public class CategoriaInventario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string ColorHex { get; set; } = "#f05b32"; // Para que el usuario le ponga color a su categoría

    public int TallerId { get; set; }
    public Taller? Taller { get; set; }
}