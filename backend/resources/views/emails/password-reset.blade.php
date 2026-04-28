<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f3ecdf;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1612;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3ecdf;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px -25px rgba(80,60,30,0.18);">

          {{-- Header --}}
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;">
                Realtes<span style="color:#c9a96e;">*</span>
              </div>
            </td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:30px;line-height:1.15;letter-spacing:-0.5px;color:#1a1612;">
                Restablece tu contraseña
              </h1>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:rgba(26,22,18,0.75);">
                Hola {{ $name }}, recibimos una solicitud para restablecer la contraseña de tu cuenta en Realtes.
              </p>
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;color:rgba(26,22,18,0.75);">
                Haz click en el botón para crear una contraseña nueva. El enlace es válido durante <strong>60 minutos</strong>.
              </p>

              {{-- CTA --}}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="border-radius:999px;background:#1a1612;">
                    <a href="{{ $resetUrl }}"
                       style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:999px;">
                      Restablecer contraseña →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:13px;line-height:1.5;color:rgba(26,22,18,0.55);">
                ¿El botón no funciona? Copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 32px 0;font-size:12px;line-height:1.5;color:rgba(26,22,18,0.55);word-break:break-all;background:#faf6ec;padding:12px 14px;border-radius:12px;border:1px solid rgba(26,22,18,0.06);">
                {{ $resetUrl }}
              </p>

              <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(26,22,18,0.55);">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este email — tu cuenta sigue segura.
              </p>
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="padding:32px 40px;border-top:1px solid rgba(26,22,18,0.06);">
              <p style="margin:0;font-size:12px;line-height:1.5;color:rgba(26,22,18,0.45);text-align:center;">
                © {{ date('Y') }} Realtes · Hecho con cuidado en Santiago de Chile.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:24px 0 0 0;font-size:11px;color:rgba(26,22,18,0.4);">
          Este email fue enviado a {{ $user->email }} porque alguien (probablemente tú) solicitó restablecer la contraseña.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
