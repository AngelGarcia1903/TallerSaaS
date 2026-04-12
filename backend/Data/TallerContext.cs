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

    public DbSet<Mecanico> Mecanicos { get; set; }
    public DbSet<HistorialVehiculo> Historiales { get; set; }
    public DbSet<Servicio> Servicios { get; set; }
    public DbSet<VehiculoServicio> VehiculoServicios { get; set; }
    public DbSet<CategoriaInventario> CategoriasInventario { get; set; }
    public DbSet<Producto> Productos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Bloqueo de Cascada para VehiculoServicio (Lo que ya tenías)
        modelBuilder.Entity<VehiculoServicio>()
            .HasOne(vs => vs.Vehiculo)
            .WithMany()
            .HasForeignKey(vs => vs.VehiculoId)
            .OnDelete(DeleteBehavior.Restrict); 

        modelBuilder.Entity<VehiculoServicio>()
            .HasOne(vs => vs.Servicio)
            .WithMany()
            .HasForeignKey(vs => vs.ServicioId)
            .OnDelete(DeleteBehavior.Restrict); 

        // 🛑 NUEVO: Bloqueo de Cascada para el Inventario
        modelBuilder.Entity<Producto>()
            .HasOne(p => p.Taller)
            .WithMany()
            .HasForeignKey(p => p.TallerId)
            .OnDelete(DeleteBehavior.Restrict); // Apaga la cascada directa desde el Taller al Producto
            
        modelBuilder.Entity<Producto>()
            .HasOne(p => p.Categoria)
            .WithMany()
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict); // Apaga la cascada desde la Categoría al Producto
    }
}