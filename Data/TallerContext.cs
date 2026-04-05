using Microsoft.EntityFrameworkCore;
using TallerSaaS.Models; // Le decimos dónde buscar los moldes

namespace TallerSaaS.Data;

public class TallerContext : DbContext
{
    public TallerContext(DbContextOptions<TallerContext> options) : base(options) { }

    // Nuestras dos tablas principales para el SaaS
    public DbSet<Taller> Talleres { get; set; }
    public DbSet<Vehiculo> Vehiculos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
}