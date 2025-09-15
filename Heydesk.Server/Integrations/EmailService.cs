using Resend;
using Heydesk.Server.Config;

namespace Heydesk.Server.Integrations;

public interface IEmailService
{
    Task SendSupportEmailAsync(string organizationSlug, string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}

public class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly string _fromDomain;

    public EmailService(IResend resend)
    {
        _resend = resend;
        _fromDomain = Environment.GetEnvironmentVariable("RESEND_FROM_DOMAIN") ?? "heydesk.cc";
    }

    public async Task SendSupportEmailAsync(string organizationSlug, string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            From = $"{organizationSlug}@{_fromDomain}",
            Subject = subject,
            HtmlBody = htmlBody,
        };

        message.To.Add(toEmail);

        await _resend.EmailSendAsync(message, cancellationToken);
    }
}


