<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>{{ $body }}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", sans-serif; background: #fafaf9; margin: 0; padding: 30px; color: #0b0b0d; }
  .wrap { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ececec; border-radius: 24px; padding: 32px; }
  p { line-height: 1.6; margin: 0 0 14px; font-size: 15px; }
  .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f2f2f2; font-size: 11px; color: #737373; }
</style>
</head>
<body>
  <div class="wrap">
    {!! nl2br(e($body)) !!}
    <div class="footer">
      Este email fue enviado desde Realtes.
    </div>
  </div>
</body>
</html>
