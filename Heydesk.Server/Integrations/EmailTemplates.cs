namespace Heydesk.Server.Integrations;

public static class EmailTemplates
{
    public static string SupportResponseTemplate(
        string organizationName,
        string organizationSlug,
        string customerName,
        string messageHtml
    )
    {
        var year = DateTime.UtcNow.Year;

        return $"""
<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html dir='ltr' lang='en'>
  <head>
    <meta content='text/html; charset=UTF-8' http-equiv='Content-Type' />
    <meta name='x-apple-disable-message-reformatting' />
  </head>
  <body style='background-color:#f6f7f8'>
    <table border='0' width='100%' cellpadding='0' cellspacing='0' role='presentation' align='center'>
      <tbody>
        <tr>
          <td style='background-color:#f6f7f8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'>
            <table align='center' width='100%' border='0' cellpadding='0' cellspacing='0' role='presentation' style='max-width:680px;margin:30px auto;background-color:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)'>
              <tbody>
                <tr style='width:100%'>
                  <td style='padding:24px 28px;border-bottom:1px solid #eef1f4;'>
                    <table width='100%'>
                      <tr>
                        <td>
                          <img src='https://heydesk.cc/logo.svg' alt='Heydesk' height='28' style='display:block' />
                        </td>
                        <td style='text-align:right;color:#64748b;font-size:12px;'>
                          {organizationName} Support
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style='padding:28px 28px 16px 28px;'>
                    <p style='font-size:14px;line-height:22px;color:#0f172a;margin:0 0 12px 0;'>Hello {customerName},</p>
                    <div style='font-size:14px;line-height:22px;color:#0f172a;'>{messageHtml}</div>
                  </td>
                </tr>
                <tr>
                  <td style='padding:12px 28px 28px 28px;'>
                    <p style='font-size:14px;line-height:22px;color:#0f172a;margin:16px 0 0 0;'>Best regards,<br /><strong>{organizationName} Support</strong><br /><a href='https://support/{organizationSlug}' style='color:#2563eb;text-decoration:none;'>support/{organizationSlug}</a></p>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style='font-size:12px;line-height:20px;color:#64748b;text-align:center;margin:12px 0;'>&copy; {year} Heydesk</p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
""";
    }
}


