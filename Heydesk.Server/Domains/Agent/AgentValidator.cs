using FluentValidation;
using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Agent;

public class CreateAgentValidator : AbstractValidator<CreateAgentRequest>
{
    public CreateAgentValidator()
    {
        RuleFor(a => a.Name)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(100);
        RuleFor(a => a.Description)
            .MaximumLength(500);
        RuleFor(a => a.SystemPrompt)
            .NotEmpty()
            .MinimumLength(10)
            .WithMessage("System prompt must be at least 10 characters");
        RuleFor(a => a.Type)
            .IsInEnum();
    }
}


