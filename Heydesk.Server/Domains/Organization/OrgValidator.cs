using FluentValidation;

namespace Heydesk.Server.Domains.Organization;

public class CreateOrgValidator : AbstractValidator<CreateOrgRequest>
{
    public CreateOrgValidator()
    {
        RuleFor(o => o.Name)
            .NotNull()
            .NotEmpty()
            .WithMessage("Organization name is required")
            .MinimumLength(2)
            .WithMessage("Organization name must be at least 2 characters")
            .MaximumLength(100)
            .WithMessage("Organization name must not exceed 100 characters");

        RuleFor(o => o.Slug)
            .NotNull()
            .NotEmpty()
            .WithMessage("Organization slug is required")
            .MinimumLength(2)
            .WithMessage("Organization slug must be at least 2 characters")
            .MaximumLength(50)
            .WithMessage("Organization slug must not exceed 50 characters")
            .Matches(@"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")
            .WithMessage("Organization slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen");

        RuleFor(o => o.Url)
            .NotNull()
            .NotEmpty()
            .WithMessage("Organization URL is required")
            .Must(BeValidUrl)
            .WithMessage("Organization URL must be a valid URL");
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}