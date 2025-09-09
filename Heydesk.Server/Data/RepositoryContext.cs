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

            entity.HasOne(t => t.Conversation)
                .WithOne(c => c.Ticket)
                .HasForeignKey<ConversationModel>(c => c.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AgentModel>().ToTable("AgentModel");
        modelBuilder.Entity<UserModel>().ToTable("Users");
        modelBuilder.Entity<DocumentModel>().ToTable("Documents");

        modelBuilder.Entity<ConversationModel>(entity =>
        {
            entity.ToTable("Conversations");
            entity.HasMany(c => c.Messages)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MessageModel>(entity =>
        {
            entity.ToTable("Messages");
        });

        modelBuilder.Entity<CustomerModel>().ToTable("Customers");
    }

    public DbSet<UserModel> Users { get; set; }
    public DbSet<CustomerModel> Customers { get; set; }
    public DbSet<OrganizationModel> Organizations { get; set; }
    public DbSet<DocumentModel> Documents { get; set; }
    public DbSet<TicketModel> Tickets { get; set; }
    public DbSet<AgentModel> Agents { get; set; }
    public DbSet<ConversationModel> Conversations { get; set; }
    public DbSet<MessageModel> Messages { get; set; }
}
