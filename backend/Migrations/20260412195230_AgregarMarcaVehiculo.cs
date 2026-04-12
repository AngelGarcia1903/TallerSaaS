using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TallerSaaS.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMarcaVehiculo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Marca",
                table: "Vehiculos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Marca",
                table: "Vehiculos");
        }
    }
}
