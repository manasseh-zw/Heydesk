using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Heydesk.Server.Migrations
{
    /// <inheritdoc />
    public partial class update_agentschema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_CustomerModel_CustomerId",
                table: "Tickets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomerModel",
                table: "CustomerModel");

            migrationBuilder.RenameTable(
                name: "CustomerModel",
                newName: "Customers");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Customers",
                table: "Customers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Customers_CustomerId",
                table: "Tickets",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Customers_CustomerId",
                table: "Tickets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Customers",
                table: "Customers");

            migrationBuilder.RenameTable(
                name: "Customers",
                newName: "CustomerModel");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomerModel",
                table: "CustomerModel",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_CustomerModel_CustomerId",
                table: "Tickets",
                column: "CustomerId",
                principalTable: "CustomerModel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
