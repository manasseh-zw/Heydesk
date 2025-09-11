using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Heydesk.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCustomerOrganizationRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Tickets_TicketId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Conversations_ConversationModelId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ConversationModelId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "ConversationModelId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Organizations",
                table: "Customers");

            migrationBuilder.AddColumn<Guid>(
                name: "ConversationId",
                table: "Tickets",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Organizations",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<Guid>(
                name: "TicketId",
                table: "Conversations",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "Conversations",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Conversations",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

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
                name: "IX_Organizations_Slug",
                table: "Organizations",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_CustomerId",
                table: "Conversations",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OrganizationId",
                table: "Conversations",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrganizations_OrganizationsId",
                table: "CustomerOrganizations",
                column: "OrganizationsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Customers_CustomerId",
                table: "Conversations",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Organizations_OrganizationId",
                table: "Conversations",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Tickets_TicketId",
                table: "Conversations",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Conversations_ConversationId",
                table: "Messages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Customers_CustomerId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Organizations_OrganizationId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Tickets_TicketId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Conversations_ConversationId",
                table: "Messages");

            migrationBuilder.DropTable(
                name: "CustomerOrganizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_Slug",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_CustomerId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_OrganizationId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Conversations");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Organizations",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "ConversationModelId",
                table: "Messages",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "Organizations",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<Guid>(
                name: "TicketId",
                table: "Conversations",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationModelId",
                table: "Messages",
                column: "ConversationModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Tickets_TicketId",
                table: "Conversations",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Conversations_ConversationModelId",
                table: "Messages",
                column: "ConversationModelId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
