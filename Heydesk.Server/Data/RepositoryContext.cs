using Heydesk.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Data;

public class RepositoryContext(DbContextOptions<RepositoryContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }

    public DbSet<UserModel> Users { get; set; }
    public DbSet<OrganizationModel> Organizations { get; set; }
}
