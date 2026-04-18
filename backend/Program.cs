using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TallerSaaS.Data;
using TallerSaaS.Models;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURACIÓN BASE Y BASE DE DATOS
// ==========================================
builder.Services.AddEndpointsApiExplorer();

// Le enseñamos a Swagger a pedir y enviar el Token JWT
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Pega tu token JWT aquí (sin comillas)."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddCors(opciones => {
    opciones.AddPolicy("PermitirTodo", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var connectionString = builder.Configuration.GetConnectionString("ConexionSQL");
builder.Services.AddDbContext<TallerContext>(opciones => opciones.UseSqlServer(connectionString));

// ==========================================
// 2. CONFIGURACIÓN DE SEGURIDAD (JWT)
// ==========================================
// Leemos la llave secreta que pusiste en appsettings.json
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = Encoding.UTF8.GetBytes(jwtKey!);

// Le decimos a C# cómo debe leer y validar las "pulseras VIP"
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true, // Validar que la firma sea nuestra
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
builder.Services.AddAuthorization(); // Encendemos el guardia de seguridad

var app = builder.Build();

// ==========================================
// 3. ACTIVACIÓN DE MIDDLEWARES
// ==========================================
app.UseCors("PermitirTodo");
app.UseAuthentication(); // 🚨 IMPORTANTE: Primero identificamos quién es (Login)
app.UseAuthorization();  // 🚨 IMPORTANTE: Luego vemos si tiene permiso de pasar
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==========================================
// 4. ENDPOINTS: AUTENTICACIÓN (LOGIN Y REGISTRO)
// ==========================================

// REGISTRO DE USUARIO (Mecánico/Dueño)
app.MapPost("/api/auth/registro", (RegistroRequest request, TallerContext db) =>
{
    // 1. Verificamos que el correo no exista ya
    if (db.Usuarios.Any(u => u.Correo == request.Correo))
        return Results.BadRequest("El correo ya está registrado.");

    // 2. Verificamos que el taller al que se quiere unir exista
    if (!db.Talleres.Any(t => t.Id == request.TallerId))
        return Results.BadRequest("El Taller especificado no existe.");

    // 3. Creamos el usuario HASHEANDO la contraseña con BCrypt
    var nuevoUsuario = new Usuario
    {
        NombreCompleto = request.Nombre,
        Correo = request.Correo,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password), // ⬅️ LA LICUADORA MÁGICA
        TallerId = request.TallerId
    };

    db.Usuarios.Add(nuevoUsuario);
    db.SaveChanges();

    return Results.Ok("Usuario registrado exitosamente.");
});

// LOGIN (Donde fabricamos la pulsera JWT)
app.MapPost("/api/auth/login", (LoginRequest request, TallerContext db) =>
{
    // 1. Buscamos al usuario por su correo
    var usuario = db.Usuarios.FirstOrDefault(u => u.Correo == request.Correo);
    if (usuario == null) return Results.Unauthorized();

    // 2. Comparamos la contraseña escrita con el Hash guardado en SQL
    bool passwordValido = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);
    if (!passwordValido) return Results.Unauthorized();

    // 3. ¡Si todo está bien, FABRICAMOS EL TOKEN (La pulsera VIP)!
    // Aquí guardamos el ID del usuario y a qué Taller pertenece directamente en el token
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
        new Claim(ClaimTypes.Email, usuario.Correo),
        new Claim("TallerId", usuario.TallerId.ToString()) // ⬅️ EL SECRETO DEL MULTITENANT
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddHours(8), // El token caduca en 8 horas
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);

    // Devolvemos el token al Frontend
    return Results.Ok(new { Token = tokenHandler.WriteToken(token) });
});


// ==========================================
// 5. ENDPOINTS: GESTIÓN DE TALLERES, VEHÍCULOS E HISTORIAL
// ==========================================

// Talleres (Se quedan igual)
app.MapPost("/api/talleres", (Taller nuevoTaller, TallerContext db) => {
    db.Talleres.Add(nuevoTaller); db.SaveChanges(); return Results.Ok(nuevoTaller);
});
app.MapGet("/api/talleres", (TallerContext db) => db.Talleres.ToList());


// 🚗 POST: Registrar Vehículo (Actualizado para el diseño de Figma)
app.MapPost("/api/vehiculos", (Vehiculo nuevoVehiculo, TallerContext db) => {
    
    // 1. Aseguramos valores por defecto si el frontend no los manda
    nuevoVehiculo.FechaIngreso = DateTime.UtcNow;
    nuevoVehiculo.EstadoActual = "En Espera"; // Todo auto nuevo entra en espera
    
    // 2. Guardamos el vehículo
    db.Vehiculos.Add(nuevoVehiculo);
    db.SaveChanges(); // Lo guardamos aquí para que SQL le asigne un ID real

    // 3. MAGIA DE TRAZABILIDAD: Creamos su primer registro en el historial automáticamente
    var primerHistorial = new HistorialVehiculo {
        VehiculoId = nuevoVehiculo.Id,
        Descripcion = $"Ingreso al taller. Problema reportado: {nuevoVehiculo.ProblemaReportado}",
        FechaHora = DateTime.UtcNow
    };
    db.Historiales.Add(primerHistorial);
    db.SaveChanges();

    return Results.Ok(nuevoVehiculo);
}).RequireAuthorization();


// 🚗 GET: Traer vehículos de un taller (Actualizado)
app.MapGet("/api/talleres/{idTaller}/vehiculos", (int idTaller, TallerContext db) => {
    // Retornamos los autos ordenados del más reciente al más antiguo
    return db.Vehiculos
             .Where(v => v.TallerId == idTaller)
             .OrderByDescending(v => v.FechaIngreso) 
             .ToList();
}).RequireAuthorization();


// 📜 NUEVO GET: Traer la actividad reciente (Historial) de un auto específico
app.MapGet("/api/vehiculos/{idVehiculo}/historial", (int idVehiculo, TallerContext db) => {
    return db.Historiales
             .Where(h => h.VehiculoId == idVehiculo)
             .OrderByDescending(h => h.FechaHora)
             .ToList();
}).RequireAuthorization();

// 🚗 GET: Traer UN SOLO vehículo por su ID
app.MapGet("/api/vehiculos/{id}", (int id, TallerContext db) => {
    var vehiculo = db.Vehiculos.Find(id);
    return vehiculo is not null ? Results.Ok(vehiculo) : Results.NotFound();
}).RequireAuthorization();


// 🔄 PUT: Actualizar el Estado del Vehículo
app.MapPut("/api/vehiculos/{id}/estado", (int id, ActualizarEstadoRequest request, TallerContext db) => {
    var vehiculo = db.Vehiculos.Find(id);
    if (vehiculo == null) return Results.NotFound();

    vehiculo.EstadoActual = request.NuevoEstado;

    // MAGIA: Cada vez que cambias el estado, se genera una huella en el historial
    var nuevoHistorial = new HistorialVehiculo {
        VehiculoId = id,
        Descripcion = $"Cambio de estado: El vehículo ahora está {request.NuevoEstado}",
        FechaHora = DateTime.UtcNow
    };
    
    db.Historiales.Add(nuevoHistorial);
    db.SaveChanges();

    return Results.Ok(vehiculo);
}).RequireAuthorization();

// 📝 POST: Agregar Nota Técnica al Historial sin cambiar el estado
app.MapPost("/api/vehiculos/{id}/notas", (int id, AgregarNotaRequest request, TallerContext db) => {
    var vehiculo = db.Vehiculos.Find(id);
    if (vehiculo == null) return Results.NotFound();

    var nuevaNota = new HistorialVehiculo {
        VehiculoId = id,
        // Le ponemos un emoji de libretita para distinguirlo en el frontend
        Descripcion = $"📝 Nota Técnica: {request.Nota}", 
        FechaHora = DateTime.UtcNow
    };
    
    db.Historiales.Add(nuevaNota);
    db.SaveChanges();
    return Results.Ok();
}).RequireAuthorization();

// ==========================================
// 7. ENDPOINTS: CATÁLOGO DE SERVICIOS Y ASIGNACIÓN
// ==========================================

// 📋 POST: Crear un nuevo servicio en el catálogo del taller
app.MapPost("/api/servicios", (Servicio nuevoServicio, TallerContext db) => {
    db.Servicios.Add(nuevoServicio);
    db.SaveChanges();
    return Results.Ok(nuevoServicio);
}).RequireAuthorization();

// 📋 GET: Traer todos los servicios disponibles de un taller
app.MapGet("/api/talleres/{idTaller}/servicios", (int idTaller, TallerContext db) => {
    return db.Servicios.Where(s => s.TallerId == idTaller).ToList();
}).RequireAuthorization();

// 🔧 POST: Asignarle un servicio específico a un vehículo (Ej: Ponerle "Cambio de Aceite" al Fiesta)
app.MapPost("/api/vehiculos/{idVehiculo}/servicios", (int idVehiculo, AsignarServicioRequest req, TallerContext db) => {
    var nuevoPuente = new VehiculoServicio {
        VehiculoId = idVehiculo,
        ServicioId = req.ServicioId
    };
    db.VehiculoServicios.Add(nuevoPuente);
    db.SaveChanges();
    return Results.Ok();
}).RequireAuthorization();

// 🔧 GET: Ver qué servicios necesita un vehículo y si ya están terminados
app.MapGet("/api/vehiculos/{idVehiculo}/servicios", (int idVehiculo, TallerContext db) => {
    return db.VehiculoServicios
             .Include(vs => vs.Servicio) // Le pedimos a SQL que traiga el Nombre y Precio también
             .Where(vs => vs.VehiculoId == idVehiculo)
             .Select(vs => new {
                 vs.Id,
                 vs.Terminado,
                 ServicioNombre = vs.Servicio!.Nombre,
                 ServicioPrecio = vs.Servicio.Precio,
                 TiempoEstimado = vs.Servicio.TiempoEstimadoMinutos
             })
             .ToList();
}).RequireAuthorization();


// ==========================================
// 8. ENDPOINTS: INVENTARIO
// ==========================================

// 📋 Traer Categorías (Con autogeneración por defecto)
app.MapGet("/api/talleres/{idTaller}/categorias", (int idTaller, TallerContext db) => {
    var categorias = db.CategoriasInventario.Where(c => c.TallerId == idTaller).ToList();
    
    // Si no hay categorías, inyectamos las de tu diseño por defecto
    if (!categorias.Any()) {
        categorias = new List<CategoriaInventario> {
            new CategoriaInventario { Nombre = "Aceites y Lubricantes", ColorHex = "#e11d48", TallerId = idTaller },
            new CategoriaInventario { Nombre = "Filtros", ColorHex = "#ea580c", TallerId = idTaller },
            new CategoriaInventario { Nombre = "Frenos", ColorHex = "#db2777", TallerId = idTaller },
            new CategoriaInventario { Nombre = "Baterías", ColorHex = "#ca8a04", TallerId = idTaller }
        };
        db.CategoriasInventario.AddRange(categorias);
        db.SaveChanges();
    }
    return categorias;
}).RequireAuthorization();

// 📋 Crear Categoría
app.MapPost("/api/categorias", (CategoriaInventario cat, TallerContext db) => {
    db.CategoriasInventario.Add(cat); db.SaveChanges(); return Results.Ok(cat);
}).RequireAuthorization();

// ✏️ Modificar Categoría
app.MapPut("/api/categorias/{id}", (int id, CategoriaInventario actualizada, TallerContext db) => {
    var cat = db.CategoriasInventario.Find(id);
    if (cat == null) return Results.NotFound();
    cat.Nombre = actualizada.Nombre;
    db.SaveChanges();
    return Results.Ok(cat);
}).RequireAuthorization();

// 🗑️ Eliminar Categoría
app.MapDelete("/api/categorias/{id}", (int id, TallerContext db) => {
    var cat = db.CategoriasInventario.Find(id);
    if (cat == null) return Results.NotFound();
    db.CategoriasInventario.Remove(cat);
    db.SaveChanges();
    return Results.Ok();
}).RequireAuthorization();

// (Mantén tus rutas de Productos tal como están abajo de esto...)
app.Run();

// ==========================================
// 6. DTOs (Data Transfer Objects) - Moldes temporales para recibir datos de internet
// ==========================================
public record ActualizarEstadoRequest(string NuevoEstado);
public record RegistroRequest(string Nombre, string Correo, string Password, int TallerId);
public record LoginRequest(string Correo, string Password);
public record AgregarNotaRequest(string Nota);
public record AsignarServicioRequest(int ServicioId);