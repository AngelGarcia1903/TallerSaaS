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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<VehiculoServicio>()
            .HasOne(vs => vs.Vehiculo)
            .WithMany()
            .HasForeignKey(vs => vs.VehiculoId)
            .OnDelete(DeleteBehavior.Restrict); // Apaga la cascada de Autos

        modelBuilder.Entity<VehiculoServicio>()
            .HasOne(vs => vs.Servicio)
            .WithMany()
            .HasForeignKey(vs => vs.ServicioId)
            .OnDelete(DeleteBehavior.Restrict); // Apaga la cascada de Servicios
    }
}