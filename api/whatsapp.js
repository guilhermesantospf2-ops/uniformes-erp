// Endpoint de Redirecionamento Ultrarrápido e Blindado para WhatsApp
// Otimizado para Instagram In-App Browser, iOS Safari e Android Chrome

module.exports = (req, res) => {
  const phone = '554499856245';
  const defaultText = 'Olá Guilherme! Vi o vídeo do Texfy ERP e quero conhecer o sistema para minha confecção.';
  const textParam = req.query.text || defaultText;
  const msg = encodeURIComponent(textParam);

  const deepLink = `whatsapp://send?phone=${phone}&text=${msg}`;
  const waMeLink = `https://wa.me/${phone}?text=${msg}`;
  const webLink = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Abrindo WhatsApp...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0b0f19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(37, 211, 102, 0.2);
      border-top-color: #25d366;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #f8fafc; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn-zap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #25d366;
      color: #052e16;
      font-weight: 800;
      font-size: 16px;
      padding: 16px 24px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
      transition: transform 0.15s ease, background 0.15s ease;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    .btn-zap:active { transform: scale(0.98); }
    .icon { width: 22px; height: 22px; fill: currentColor; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Abrindo seu WhatsApp...</h2>
    <p>Conectando diretamente com o Guilherme da Texfy ERP.</p>
    <a href="${deepLink}" id="zapLink" class="btn-zap">
      <svg class="icon" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
      Toque Aqui para Abrir
    </a>
  </div>

  <script>
    // Dispara a abertura nativa sem conflito de timer
    (function() {
      var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      var target = isMobile ? "${deepLink}" : "${waMeLink}";
      
      // Tentativa de abertura imediata
      try {
        window.location.href = target;
      } catch(e) {}

      // Se o usuário clicar, força a chamada
      document.getElementById('zapLink').onclick = function(e) {
        window.location.href = isMobile ? "${deepLink}" : "${waMeLink}";
      };
    })();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
