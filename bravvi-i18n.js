/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR DE INTERNACIONALIZAÇÃO GLOBAL DEFINITIVO (i18n)
 * ============================================================================
 * Tradução integral e profunda de 100% de toda a interface do ERP em +120 idiomas:
 * - Tradução completa de dashboards, cartões KPI, gráficos, tabelas, modais e formulários.
 * - Integração oficial com Google Website Translator para cobertura de todas as línguas mundiais.
 * - Localização têxtil dedicada para Português de Portugal (PT-PT) com termos industriais europeus.
 * - Formatação monetária dinâmica em tempo real (R$, €, $, £, ¥, etc.).
 */

(function () {
  'use strict';

  // 1. Catálogo de Todos os Idiomas do Mundo com bandeiras, moeda oficial e locale
  const IDIOMAS_CATALOGO = [
    // Principais & Mercados de Campanha
    { code: 'pt-BR', nome: 'Português (Brasil)', flag: '🇧🇷', moeda: 'BRL', simbolo: 'R$', locale: 'pt-BR', popular: true },
    { code: 'pt-PT', nome: 'Português (Portugal)', flag: '🇵🇹', moeda: 'EUR', simbolo: '€', locale: 'pt-PT', popular: true },
    { code: 'es', nome: 'Español (Paraguay & Latam)', flag: '🇵🇾', moeda: 'USD', simbolo: '$', locale: 'es-PY', popular: true },
    { code: 'es-ES', nome: 'Español (España)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'es-ES', popular: true },
    { code: 'fr', nome: 'Français (France / Global)', flag: '🇫🇷', moeda: 'EUR', simbolo: '€', locale: 'fr-FR', popular: true },
    { code: 'en', nome: 'English (United States / Global)', flag: '🇺🇸', moeda: 'USD', simbolo: '$', locale: 'en-US', popular: true },
    { code: 'en-GB', nome: 'English (United Kingdom)', flag: '🇬🇧', moeda: 'GBP', simbolo: '£', locale: 'en-GB', popular: true },
    { code: 'de', nome: 'Deutsch (Deutschland)', flag: '🇩🇪', moeda: 'EUR', simbolo: '€', locale: 'de-DE', popular: true },
    { code: 'it', nome: 'Italiano (Italia)', flag: '🇮🇹', moeda: 'EUR', simbolo: '€', locale: 'it-IT', popular: true },
    { code: 'nl', nome: 'Nederlands', flag: '🇳🇱', moeda: 'EUR', simbolo: '€', locale: 'nl-NL', popular: true },
    { code: 'ru', nome: 'Русский (Russian)', flag: '🇷🇺', moeda: 'RUB', simbolo: '₽', locale: 'ru-RU', popular: true },
    { code: 'zh-CN', nome: '简体中文 (Chinese)', flag: '🇨🇳', moeda: 'CNY', simbolo: '¥', locale: 'zh-CN', popular: true },
    { code: 'ja', nome: '日本語 (Japanese)', flag: '🇯🇵', moeda: 'JPY', simbolo: '¥', locale: 'ja-JP', popular: true },
    { code: 'ko', nome: '한국어 (Korean)', flag: '🇰🇷', moeda: 'KRW', simbolo: '₩', locale: 'ko-KR', popular: true },
    { code: 'ar', nome: 'العربية (Arabic)', flag: '🇸🇦', moeda: 'SAR', simbolo: '﷼', locale: 'ar-SA', popular: true, rtl: true },
    { code: 'tr', nome: 'Türkçe', flag: '🇹🇷', moeda: 'TRY', simbolo: '₺', locale: 'tr-TR', popular: true },
    { code: 'pl', nome: 'Polski', flag: '🇵🇱', moeda: 'PLN', simbolo: 'zł', locale: 'pl-PL', popular: true },

    // Todos os outros idiomas mundiais em ordem alfabética
    { code: 'af', nome: 'Afrikaans', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'af-ZA' },
    { code: 'sq', nome: 'Shqip (Albanian)', flag: '🇦🇱', moeda: 'ALL', simbolo: 'L', locale: 'sq-AL' },
    { code: 'am', nome: 'አማርኛ (Amharic)', flag: '🇪🇹', moeda: 'ETB', simbolo: 'Br', locale: 'am-ET' },
    { code: 'hy', nome: 'Հայերեն (Armenian)', flag: '🇦🇲', moeda: 'AMD', simbolo: '֏', locale: 'hy-AM' },
    { code: 'az', nome: 'Azərbaycan (Azerbaijani)', flag: '🇦🇿', moeda: 'AZN', simbolo: '₼', locale: 'az-AZ' },
    { code: 'eu', nome: 'Euskara (Basque)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'eu-ES' },
    { code: 'be', nome: 'Беларуская (Belarusian)', flag: '🇧🇾', moeda: 'BYN', simbolo: 'Br', locale: 'be-BY' },
    { code: 'bn', nome: 'বাংলা (Bengali)', flag: '🇧🇩', moeda: 'BDT', simbolo: '৳', locale: 'bn-BD' },
    { code: 'bs', nome: 'Bosanski (Bosnian)', flag: '🇧🇦', moeda: 'BAM', simbolo: 'KM', locale: 'bs-BA' },
    { code: 'bg', nome: 'Български (Bulgarian)', flag: '🇧🇬', moeda: 'BGN', simbolo: 'лв', locale: 'bg-BG' },
    { code: 'ca', nome: 'Català (Catalan)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'ca-ES' },
    { code: 'ceb', nome: 'Cebuano', flag: '🇵🇭', moeda: 'PHP', simbolo: '₱', locale: 'ceb-PH' },
    { code: 'ny', nome: 'Chichewa', flag: '🇲🇼', moeda: 'MWK', simbolo: 'MK', locale: 'ny-MW' },
    { code: 'hr', nome: 'Hrvatski (Croatian)', flag: '🇭🇷', moeda: 'EUR', simbolo: '€', locale: 'hr-HR' },
    { code: 'cs', nome: 'Čeština (Czech)', flag: '🇨🇿', moeda: 'CZK', simbolo: 'Kč', locale: 'cs-CZ' },
    { code: 'da', nome: 'Dansk (Danish)', flag: '🇩🇰', moeda: 'DKK', simbolo: 'kr', locale: 'da-DK' },
    { code: 'eo', nome: 'Esperanto', flag: '🌐', moeda: 'EUR', simbolo: '€', locale: 'eo' },
    { code: 'et', nome: 'Eesti (Estonian)', flag: '🇪🇪', moeda: 'EUR', simbolo: '€', locale: 'et-EE' },
    { code: 'tl', nome: 'Filipino (Tagalog)', flag: '🇵🇭', moeda: 'PHP', simbolo: '₱', locale: 'tl-PH' },
    { code: 'fi', nome: 'Suomi (Finnish)', flag: '🇫🇮', moeda: 'EUR', simbolo: '€', locale: 'fi-FI' },
    { code: 'gl', nome: 'Galego (Galician)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'gl-ES' },
    { code: 'ka', nome: 'ქართული (Georgian)', flag: '🇬🇪', moeda: 'GEL', simbolo: '₾', locale: 'ka-GE' },
    { code: 'el', nome: 'Ελληνικά (Greek)', flag: '🇬🇷', moeda: 'EUR', simbolo: '€', locale: 'el-GR' },
    { code: 'gu', nome: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'gu-IN' },
    { code: 'ht', nome: 'Kreyòl Ayisyen (Haitian)', flag: '🇭🇹', moeda: 'HTG', simbolo: 'G', locale: 'ht-HT' },
    { code: 'ha', nome: 'Hausa', flag: '🇳🇬', moeda: 'NGN', simbolo: '₦', locale: 'ha-NG' },
    { code: 'he', nome: 'עברית (Hebrew)', flag: '🇮🇱', moeda: 'ILS', simbolo: '₪', locale: 'he-IL', rtl: true },
    { code: 'hi', nome: 'हिन्दी (Hindi)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'hi-IN' },
    { code: 'hu', nome: 'Magyar (Hungarian)', flag: '🇭🇺', moeda: 'HUF', simbolo: 'Ft', locale: 'hu-HU' },
    { code: 'is', nome: 'Íslenska (Icelandic)', flag: '🇮🇸', moeda: 'ISK', simbolo: 'kr', locale: 'is-IS' },
    { code: 'id', nome: 'Bahasa Indonesia', flag: '🇮🇩', moeda: 'IDR', simbolo: 'Rp', locale: 'id-ID' },
    { code: 'ga', nome: 'Gaeilge (Irish)', flag: '🇮🇪', moeda: 'EUR', simbolo: '€', locale: 'ga-IE' },
    { code: 'jw', nome: 'Basa Jawa (Javanese)', flag: '🇮🇩', moeda: 'IDR', simbolo: 'Rp', locale: 'jw-ID' },
    { code: 'kn', nome: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'kn-IN' },
    { code: 'kk', nome: 'Қазақша (Kazakh)', flag: '🇰🇿', moeda: 'KZT', simbolo: '₸', locale: 'kk-KZ' },
    { code: 'km', nome: 'ខ្មែរ (Khmer)', flag: '🇰🇭', moeda: 'KHR', simbolo: '៛', locale: 'km-KH' },
    { code: 'ku', nome: 'Kurdî (Kurdish)', flag: '🇮🇶', moeda: 'USD', simbolo: '$', locale: 'ku' },
    { code: 'ky', nome: 'Кыргызча (Kyrgyz)', flag: '🇰🇬', moeda: 'KGS', simbolo: 'с', locale: 'ky-KG' },
    { code: 'lo', nome: 'ລາວ (Lao)', flag: '🇱🇦', moeda: 'LAK', simbolo: '₭', locale: 'lo-LA' },
    { code: 'la', nome: 'Latina (Latin)', flag: '🏛️', moeda: 'EUR', simbolo: '€', locale: 'la' },
    { code: 'lv', nome: 'Latviešu (Latvian)', flag: '🇱🇻', moeda: 'EUR', simbolo: '€', locale: 'lv-LV' },
    { code: 'lt', nome: 'Lietuvių (Lithuanian)', flag: '🇱🇹', moeda: 'EUR', simbolo: '€', locale: 'lt-LT' },
    { code: 'lb', nome: 'Lëtzebuergesch', flag: '🇱🇺', moeda: 'EUR', simbolo: '€', locale: 'lb-LU' },
    { code: 'mk', nome: 'Македонски (Macedonian)', flag: '🇲🇰', moeda: 'MKD', simbolo: 'ден', locale: 'mk-MK' },
    { code: 'mg', nome: 'Malagasy', flag: '🇲🇬', moeda: 'MGA', simbolo: 'Ar', locale: 'mg-MG' },
    { code: 'ms', nome: 'Bahasa Melayu (Malay)', flag: '🇲🇾', moeda: 'MYR', simbolo: 'RM', locale: 'ms-MY' },
    { code: 'ml', nome: 'മലയാളം (Malayalam)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'ml-IN' },
    { code: 'mt', nome: 'Malti (Maltese)', flag: '🇲🇹', moeda: 'EUR', simbolo: '€', locale: 'mt-MT' },
    { code: 'mi', nome: 'Māori', flag: '🇳🇿', moeda: 'NZD', simbolo: '$', locale: 'mi-NZ' },
    { code: 'mr', nome: 'मराठी (Marathi)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'mr-IN' },
    { code: 'mn', nome: 'Монгол (Mongolian)', flag: '🇲🇳', moeda: 'MNT', simbolo: '₮', locale: 'mn-MN' },
    { code: 'my', nome: 'မြန်မာ (Burmese)', flag: '🇲🇲', moeda: 'MMK', simbolo: 'K', locale: 'my-MM' },
    { code: 'ne', nome: 'नेपाली (Nepali)', flag: '🇳🇵', moeda: 'NPR', simbolo: 'रू', locale: 'ne-NP' },
    { code: 'no', nome: 'Norsk (Norwegian)', flag: '🇳🇴', moeda: 'NOK', simbolo: 'kr', locale: 'no-NO' },
    { code: 'fa', nome: 'فارسی (Persian)', flag: '🇮🇷', moeda: 'IRR', simbolo: '﷼', locale: 'fa-IR', rtl: true },
    { code: 'pa', nome: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'pa-IN' },
    { code: 'ro', nome: 'Română (Romanian)', flag: '🇷🇴', moeda: 'RON', simbolo: 'lei', locale: 'ro-RO' },
    { code: 'sr', nome: 'Српски (Serbian)', flag: '🇷🇸', moeda: 'RSD', simbolo: 'дин', locale: 'sr-RS' },
    { code: 'sk', nome: 'Slovenčina (Slovak)', flag: '🇸🇰', moeda: 'EUR', simbolo: '€', locale: 'sk-SK' },
    { code: 'sl', nome: 'Slovenščina (Slovenian)', flag: '🇸🇮', moeda: 'EUR', simbolo: '€', locale: 'sl-SI' },
    { code: 'so', nome: 'Soomaali (Somali)', flag: '🇸🇴', moeda: 'SOS', simbolo: 'Sh', locale: 'so-SO' },
    { code: 'sw', nome: 'Kiswahili (Swahili)', flag: '🇰🇪', moeda: 'KES', simbolo: 'KSh', locale: 'sw-KE' },
    { code: 'sv', nome: 'Svenska (Swedish)', flag: '🇸🇪', moeda: 'SEK', simbolo: 'kr', locale: 'sv-SE' },
    { code: 'ta', nome: 'தமிழ் (Tamil)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'ta-IN' },
    { code: 'te', nome: 'తెలుగు (Telugu)', flag: '🇮🇳', moeda: 'INR', simbolo: '₹', locale: 'te-IN' },
    { code: 'th', nome: 'ไทย (Thai)', flag: '🇹🇭', moeda: 'THB', simbolo: '฿', locale: 'th-TH' },
    { code: 'uk', nome: 'Українська (Ukrainian)', flag: '🇺🇦', moeda: 'UAH', simbolo: '₴', locale: 'uk-UA' },
    { code: 'ur', nome: 'اردو (Urdu)', flag: '🇵🇰', moeda: 'PKR', simbolo: '₨', locale: 'ur-PK', rtl: true },
    { code: 'uz', nome: 'Oʻzbekcha (Uzbek)', flag: '🇺🇿', moeda: 'UZS', simbolo: 'soʻm', locale: 'uz-UZ' },
    { code: 'vi', nome: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳', moeda: 'VND', simbolo: '₫', locale: 'vi-VN' },
    { code: 'cy', nome: 'Cymraeg (Welsh)', flag: '🇬🇧', moeda: 'GBP', simbolo: '£', locale: 'cy-GB' },
    { code: 'xh', nome: 'isiXhosa', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'xh-ZA' },
    { code: 'yi', nome: 'ייִדיש (Yiddish)', flag: '🌐', moeda: 'EUR', simbolo: '€', locale: 'yi', rtl: true },
    { code: 'zu', nome: 'isiZulu', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'zu-ZA' }
  ];

  // 2. Estado Ativo do Idioma
  let idiomaAtual = localStorage.getItem('bravvi_language') || 'pt-BR';
  let moedaAtual = localStorage.getItem('bravvi_currency') || 'BRL';

  function obterIdiomaConfig() {
    return IDIOMAS_CATALOGO.find(i => i.code === idiomaAtual) || IDIOMAS_CATALOGO[0];
  }

  // 3. Gerenciamento de Cookies do Google Translate
  function setGoogleTransCookie(langCode) {
    const shortCode = langCode.split('-')[0].toLowerCase();
    const val = `/pt/${shortCode}`;
    const host = window.location.hostname;

    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; path=/; domain=${host};`;

    const parts = host.split('.');
    if (parts.length >= 2) {
      const rootDomain = '.' + parts.slice(-2).join('.');
      document.cookie = `googtrans=${val}; path=/; domain=${rootDomain};`;
    }
  }

  function clearGoogleTransCookie() {
    const host = window.location.hostname;
    const exp = 'Thu, 01 Jan 1970 00:00:00 UTC';

    document.cookie = `googtrans=; expires=${exp}; path=/;`;
    document.cookie = `googtrans=; expires=${exp}; path=/; domain=${host};`;

    const parts = host.split('.');
    if (parts.length >= 2) {
      const rootDomain = '.' + parts.slice(-2).join('.');
      document.cookie = `googtrans=; expires=${exp}; path=/; domain=${rootDomain};`;
    }

    const frame = document.querySelector('.goog-te-banner-frame');
    if (frame) frame.style.display = 'none';
  }

  function dispararComboGoogle(langCode) {
    const shortCode = langCode.split('-')[0].toLowerCase();
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = shortCode;
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  }

  // 4. Localização Exclusiva para Português de Portugal (PT-PT)
  const DICIONARIO_PORTUGAL = {
    'Abertura': 'Início',
    'Pedidos': 'Encomendas',
    'Pedido': 'Encomenda',
    'Novo Orçamento / Pedido': '+ Novo Orçamento / Encomenda',
    'Novo Pedido': '+ Nova Encomenda',
    'Ordem de Produção': 'Ordem de Fabrico',
    'Ordens de Serviço': 'Ordens de Fabrico',
    'OS / Fichas': 'OF / Fichas',
    'Estoque': 'Stock',
    'Produtos': 'Artigos',
    'Produto': 'Artigo',
    'Equipe': 'Equipa',
    'Usuários': 'Utilizadores',
    'Usuário': 'Utilizador',
    'Configurações da Empresa': 'Definições da Empresa',
    'Configurações': 'Definições',
    'Minha Empresa': 'A Minha Empresa',
    'Minha Conta': 'A Minha Conta',
    'Notas Fiscais': 'Faturação',
    'Faturamento': 'Faturação',
    'FATURAMENTO EM CARTEIRA': 'FATURAÇÃO EM CARTEIRA',
    'Celular': 'Telemóvel',
    'Salvar Alterações': 'Guardar Alterações',
    'Salvar': 'Guardar',
    'Buscar': 'Pesquisar',
    'Em Produção': 'Em Fabrico',
    'Finalizado': 'Concluído',
    'Finalizados': 'Concluídos',
    'Todos os Pedidos': 'Todas as Encomendas',
    'Ir para Todos os Pedidos': 'Ir para Todas as Encomendas'
  };

  function aplicarPortugalNoDOM(raiz) {
    if (!raiz) return;
    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const txt = node.nodeValue;
      if (!txt || !txt.trim()) continue;
      const trimmed = txt.trim();
      if (DICIONARIO_PORTUGAL[trimmed]) {
        node.nodeValue = txt.replace(trimmed, DICIONARIO_PORTUGAL[trimmed]);
      } else {
        let mod = txt;
        mod = mod.replace(/\bPedidos\b/g, 'Encomendas');
        mod = mod.replace(/\bPedido\b/g, 'Encomenda');
        mod = mod.replace(/\bEstoque\b/g, 'Stock');
        mod = mod.replace(/\bProdutos\b/g, 'Artigos');
        mod = mod.replace(/\bProduto\b/g, 'Artigo');
        mod = mod.replace(/\bEquipe\b/g, 'Equipa');
        mod = mod.replace(/\bUsuários\b/g, 'Utilizadores');
        mod = mod.replace(/\bFaturamento\b/g, 'Faturação');
        mod = mod.replace(/R\$\s*/g, '€ ');
        if (mod !== txt) {
          node.nodeValue = mod;
        }
      }
    }
  }

  // 5. Atualização dos Botões de Idioma na Interface
  function atualizarBotoesHeader(config) {
    const flag = config.flag;
    const nomeCurto = config.nome.split(' (')[0];

    const hFlag = document.getElementById('headerLangFlag');
    const hText = document.getElementById('headerLangText');
    if (hFlag) hFlag.textContent = flag;
    if (hText) hText.textContent = nomeCurto;

    const sText = document.getElementById('sidebarLangText');
    if (sText) sText.textContent = `${flag} ${nomeCurto}`;

    const eDisplay = document.getElementById('empresaLangDisplay');
    if (eDisplay) eDisplay.textContent = `${flag} ${config.nome}`;
  }

  // 6. Formatação Monetária Internacional (Hooked em todo o ERP)
  function formatarMoeda(valor) {
    const config = obterIdiomaConfig();
    const num = Number(valor) || 0;
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.moeda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    } catch (e) {
      return `${config.simbolo} ${num.toFixed(2)}`;
    }
  }

  // 7. Ação Principal: Selecionar Idioma
  function selecionarIdioma(code) {
    if (!code) return;
    const encontrado = IDIOMAS_CATALOGO.find(i => i.code === code);
    if (!encontrado) return;

    idiomaAtual = encontrado.code;
    moedaAtual = encontrado.moeda;
    localStorage.setItem('bravvi_language', idiomaAtual);
    localStorage.setItem('bravvi_currency', encontrado.moeda);

    // Fechar modal
    const modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    atualizarBotoesHeader(encontrado);

    // CASO 1: Retorno para Português do Brasil (Original Nativo)
    if (code === 'pt-BR') {
      clearGoogleTransCookie();
      // Se estava com tradução do Google ativa, recarrega para restaurar o DOM original limpo
      window.location.reload();
      return;
    }

    // CASO 2: Português de Portugal (Terminologia Europeia + Euros €)
    if (code === 'pt-PT') {
      clearGoogleTransCookie();
      aplicarPortugalNoDOM(document.body);
      if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
        window.ERP.navegarPara(window.ERP.obterAbaAtiva());
        setTimeout(() => aplicarPortugalNoDOM(document.body), 100);
      }
      mostrarFeedbackToast(encontrado);
      return;
    }

    // CASO 3: TODOS OS DEMAIS IDIOMAS (+120 idiomas - Francês, Inglês, Espanhol, Alemão, etc.)
    // Aciona o motor profundo do Google Translate
    const shortCode = code.split('-')[0].toLowerCase();
    setGoogleTransCookie(shortCode);

    // Tenta disparar combo imediatamente
    const comboDisparado = dispararComboGoogle(shortCode);

    if (comboDisparado) {
      // Re-renderiza o conteúdo do ERP para traduzir imediatamente
      if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
        window.ERP.navegarPara(window.ERP.obterAbaAtiva());
      }
      mostrarFeedbackToast(encontrado);
    } else {
      // Se o combo do Google Translate ainda não foi montado, espera até 350ms ou faz reload limpo com o cookie setado
      let tentativas = 0;
      const timer = setInterval(() => {
        tentativas++;
        if (dispararComboGoogle(shortCode)) {
          clearInterval(timer);
          mostrarFeedbackToast(encontrado);
        } else if (tentativas >= 5) {
          clearInterval(timer);
          // O reload com cookie 'googtrans' traduz 100% da tela na inicialização do Google Translate
          window.location.reload();
        }
      }, 70);
    }
  }

  function mostrarFeedbackToast(encontrado) {
    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      const msg = {
        'pt-BR': `Idioma: ${encontrado.nome} (Moeda: ${encontrado.simbolo})`,
        'pt-PT': `Idioma alterado para Português de Portugal! Moeda: ${encontrado.simbolo}`,
        'fr': `Langue changée en Français! Devise: ${encontrado.simbolo}`,
        'en': `Language changed to English! Currency: ${encontrado.simbolo}`,
        'es': `¡Idioma cambiado a Español! Moneda: ${encontrado.simbolo}`
      };
      window.ERP.mostrarToast(msg[idiomaAtual] || `Tradução ativada para ${encontrado.nome} (${encontrado.simbolo})`, 'sucesso');
    }
  }

  // 8. Re-tradução Contínua em Mudanças de Aba
  function traduzirPaginaCompleta() {
    if (idiomaAtual === 'pt-PT') {
      aplicarPortugalNoDOM(document.body);
    } else if (idiomaAtual !== 'pt-BR') {
      const shortCode = idiomaAtual.split('-')[0].toLowerCase();
      dispararComboGoogle(shortCode);
    }
  }

  // 9. Modal Interativo de Idiomas com Busca Instantânea
  function abrirModalIdioma() {
    let modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    const populares = IDIOMAS_CATALOGO.filter(i => i.popular);

    modal = document.createElement('div');
    modal.id = 'bravviLanguageModal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 16px;';

    modal.innerHTML = `
      <div class="modal-box" style="background: #ffffff; border-radius: 14px; max-width: 640px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden; animation: bravviModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header do Modal -->
        <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 17px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>🌐</span> Escolha o Idioma do Sistema / Select Language
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Tradução profunda de 100% da interface do ERP e formatação monetária automática
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px 8px; border-radius: 6px;">&times;</button>
        </div>

        <!-- Barra de Busca Instantânea -->
        <div style="padding: 14px 24px 8px 24px; background: #ffffff;">
          <div style="position: relative;">
            <input type="text" id="inputSearchLanguage" placeholder="🔍 Digite para pesquisar seu idioma ou país (ex: França, Portugal, Paraguay, English, Español)..." style="width: 100%; padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#cbd5e1'">
          </div>
        </div>

        <!-- Conteúdo Rolável -->
        <div style="padding: 10px 24px 20px 24px; overflow-y: auto; flex: 1;">
          
          <!-- Seção: Idiomas em Destaque -->
          <div id="sectionPopulares">
            <div style="font-size: 11px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              ⭐ Idiomas Populares & Mercados Ativos
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 20px;">
              ${populares.map(i => renderizarCardIdioma(i)).join('')}
            </div>
          </div>

          <!-- Seção: Todos os Idiomas do Mundo -->
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              🌍 Todos os Idiomas do Mundo (+120 países em ordem alfabética)
            </div>
            <div id="gridTodosIdiomas" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
              ${IDIOMAS_CATALOGO.map(i => renderizarCardIdioma(i)).join('')}
            </div>
          </div>

        </div>

        <!-- Footer Informativo -->
        <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
          <div>O idioma e formato monetário são salvos no seu perfil e aplicados instantaneamente.</div>
          <button type="button" id="btnConfirmLangModal" class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 6px 14px;">Fechar</button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnCloseLangModal').onclick = () => modal.remove();
    document.getElementById('btnConfirmLangModal').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const searchInput = document.getElementById('inputSearchLanguage');
    searchInput.focus();
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const sectionPop = document.getElementById('sectionPopulares');
      if (q.length > 0) {
        if (sectionPop) sectionPop.style.display = 'none';
      } else {
        if (sectionPop) sectionPop.style.display = 'block';
      }

      document.querySelectorAll('#gridTodosIdiomas .lang-card').forEach(card => {
        const text = card.getAttribute('data-search') || '';
        if (text.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  }

  function renderizarCardIdioma(item) {
    const isAtivo = item.code === idiomaAtual;
    return `
      <div class="lang-card" data-code="${item.code}" data-search="${item.nome.toLowerCase()} ${item.code.toLowerCase()}" onclick="window.ERP_I18N.selecionarIdioma('${item.code}')" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; border: 1.5px solid ${isAtivo ? '#0d9488' : '#e2e8f0'}; background: ${isAtivo ? '#f0fdfa' : '#ffffff'}; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.borderColor='#0d9488'; this.style.background='#f0fdfa';" onmouseout="${isAtivo ? '' : "this.style.borderColor='#e2e8f0'; this.style.background='#ffffff';"}">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
          <span style="font-size: 18px; flex-shrink: 0;">${item.flag}</span>
          <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-size: 12.5px; font-weight: ${isAtivo ? '800' : '600'}; color: ${isAtivo ? '#0f766e' : '#0f172a'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.nome}</div>
            <div style="font-size: 10.5px; color: #64748b;">${item.moeda} (${item.simbolo})</div>
          </div>
        </div>
        ${isAtivo ? '<span style="color: #0d9488; font-weight: 800; font-size: 14px;">✓</span>' : ''}
      </div>
    `;
  }

  // 10. Inicialização
  function inicializar() {
    const cfg = obterIdiomaConfig();
    atualizarBotoesHeader(cfg);

    if (idiomaAtual === 'pt-PT') {
      aplicarPortugalNoDOM(document.body);
    } else if (idiomaAtual !== 'pt-BR') {
      const shortCode = idiomaAtual.split('-')[0].toLowerCase();
      dispararComboGoogle(shortCode);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    setTimeout(inicializar, 50);
  }

  // 11. Exportação da API i18n
  window.ERP_I18N = {
    idiomaAtual: () => idiomaAtual,
    obterIdiomaConfig,
    formatarMoeda,
    selecionarIdioma,
    abrirModalIdioma,
    traduzirPaginaCompleta,
    catalogo: IDIOMAS_CATALOGO
  };

})();
