using Heydesk.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Heydesk.Server.Data;

public class RepositoryContext(DbContextOptions<RepositoryContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OrganizationModel>(entity =>
        {
            entity.ToTable("Organizations");
            entity.HasMany(o => o.Members)
                .WithOne(u => u.Organization)
                .HasForeignKey(u => u.OrganizationId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(o => o.Documents)
                .WithOne(d => d.Organization)
                .HasForeignKey(d => d.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(o => o.Agents)
                .WithOne(a => a.Organization)
                .HasForeignKey(a => a.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TicketModel>(entity =>
        {
            entity.ToTable("Tickets");
            entity.HasOne(t => t.Organization)
                .WithMany()
                .HasForeignKey(t => t.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Customer)
                .WithMany()
                .HasForeignKey(t => t.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Conversation stored as JSON using value converter
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
            };

            entity.Property(t => t
            .Conversation)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => JsonSerializer.Deserialize<ConversationModel>(v, jsonOptions) ?? new ConversationModel())
                .HasColumnType("json");
        });

        modelBuilder.Entity<AgentModel>().ToTable("AgentModel");
        modelBuilder.Entity<UserModel>().ToTable("Users");
        modelBuilder.Entity<DocumentModel>().ToTable("Documents");
    }

    public DbSet<UserModel> Users { get; set; }
    public DbSet<OrganizationModel> Organizations { get; set; }
    public DbSet<DocumentModel> Documents { get; set; }
    public DbSet<TicketModel> Tickets { get; set; }
    public DbSet<AgentModel> Agents { get; set; }
}
