namespace Heydesk.Server.Data.Models;

public class OrganizationModel
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Url { get; set; }
    public string IconUrl { get; set; }
    public List<UserModel> Members { get; set; }
}
