using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Heydesk.Server.Migrations
{
    /// <inheritdoc />
    public partial class add_org_selectors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerOrganizations");

            migrationBuilder.AddColumn<string>(
                name: "Organizations",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Organizations",
                table: "Customers");

            migrationBuilder.CreateTable(
                name: "CustomerOrganizations",
                columns: table => new
                {
                    CustomerModelId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OrganizationsId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerOrganizations", x => new { x.CustomerModelId, x.OrganizationsId });
                    table.ForeignKey(
                        name: "FK_CustomerOrganizations_Customers_CustomerModelId",
                        column: x => x.CustomerModelId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerOrganizations_Organizations_OrganizationsId",
                        column: x => x.OrganizationsId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrganizations_OrganizationsId",
                table: "CustomerOrganizations",
                column: "OrganizationsId");
        }
    }
}
