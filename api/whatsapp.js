// Endpoint de Redirecionamento Inteligente de Alta Conversão para o WhatsApp
// Dispara o Deep Link nativo (whatsapp://) para abrir o aplicativo instantaneamente no celular

module.exports = (req, res) => {
  const phone = '554499856245';
  const defaultText = 'Olá Guilherme! Vi o vídeo do Bravvi ERP e quero conhecer o sistema para minha confecção.';
  const msg = encodeURIComponent(req.query.text || defaultText);
  
  const deepLink = `whatsapp://send?phone=${phone}&text=${msg}`;
  const webLink = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;

  // Retorna HTML ultrarrápido com redirecionamento de protocolo nativo + fallback
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abrindo WhatsApp...</title>
  <style>
    body {
      background: #090d16;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn-zap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #25d366;
      color: #000000;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 99px;
      text-decoration: none;
      margin-top: 16px;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
    }
  </style>
  <script>
    // 1. Tenta abrir o App Nativo do WhatsApp na hora
    window.location.href = "${deepLink}";

    // 2. Fallback para api.whatsapp.com após 600ms
    setTimeout(function() {
      window.location.href = "${webLink}";
    }, 600);
  </script>
</head>
<body>
  <div class="spinner"></div>
  <h2 style="font-size: 18px; margin-bottom: 8px;">Conectando ao WhatsApp do Guilherme...</h2>
  <p style="font-size: 13px; color: #94a3b8; max-width: 320px;">Se o aplicativo não abrir automaticamente em 1 segundo, toque no botão abaixo:</p>
  <a href="${webLink}" class="btn-zap">Abrir WhatsApp Agora &rarr;</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
