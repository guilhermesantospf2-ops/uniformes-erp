/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR 100% NATIVO DE INTERNACIONALIZAÇÃO (i18n)
 * ============================================================================
 * - Sem dependência de Google Translate, sem banners e sem atrasos de rede.
 * - Tradução instantânea (0ms), segura e offline de todos os módulos industriais.
 * - Formatação monetária dinâmica em tempo real (R$, €, $, £, ¥).
 * - Varredura de nós DOM em tempo real via MutationObserver ultra-otimizado.
 */

(function () {
  'use strict';

  // 1. Expulsão Definitiva de Cookies Anteriores do Google Translate
  function expulsarGoogleCookies() {
    try {
      const exp = 'Thu, 01 Jan 1970 00:00:00 UTC';
      const h = window.location.hostname;
      document.cookie = `googtrans=; expires=${exp}; path=/;`;
      document.cookie = `googtrans=; expires=${exp}; path=/; domain=${h};`;
      const parts = h.split('.');
      if (parts.length >= 2) {
        document.cookie = `googtrans=; expires=${exp}; path=/; domain=.${parts.slice(-2).join('.')};`;
      }
    } catch (e) {}
  }
  expulsarGoogleCookies();

  // 2. Catálogo Oficial de Idiomas e Moedas
  const IDIOMAS_CATALOGO = [
    // Principais & Mercados de Campanha
    { code: 'pt-BR', nome: 'Português (Brasil)', flag: '🇧🇷', moeda: 'BRL', simbolo: 'R$', locale: 'pt-BR', popular: true },
    { code: 'pt-PT', nome: 'Português (Portugal)', flag: '🇵🇹', moeda: 'EUR', simbolo: '€', locale: 'pt-PT', popular: true },
    { code: 'es', nome: 'Español (Paraguay & Latam)', flag: '🇵🇾', moeda: 'USD', simbolo: '$', locale: 'es-PY', popular: true },
    { code: 'es-ES', nome: 'Español (España)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'es-ES', popular: true },
    { code: 'en', nome: 'English (United States / Global)', flag: '🇺🇸', moeda: 'USD', simbolo: '$', locale: 'en-US', popular: true },
    { code: 'en-GB', nome: 'English (United Kingdom)', flag: '🇬🇧', moeda: 'GBP', simbolo: '£', locale: 'en-GB', popular: true },
    { code: 'fr', nome: 'Français (France / Global)', flag: '🇫🇷', moeda: 'EUR', simbolo: '€', locale: 'fr-FR', popular: true },
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

  let idiomaAtual = localStorage.getItem('bravvi_language') || 'pt-BR';
  let moedaAtual = localStorage.getItem('bravvi_currency') || 'BRL';

  function obterIdiomaConfig() {
    return IDIOMAS_CATALOGO.find(i => i.code === idiomaAtual) || IDIOMAS_CATALOGO[0];
  }

  // 3. Dicionários Nativos Industriais de Alta Cobertura
  const DICIONARIOS = {
    'es': {
  "Abertura": "Inicio",
  "Pedidos": "Pedidos",
  "OS / Fichas": "OT / Fichas",
  "Nesting": "Nesting DTF",
  "Estoque": "Inventario",
  "Produtos": "Productos",
  "Financeiro": "Finanzas",
  "Compras": "Compras",
  "Clientes": "Clientes",
  "Quarentena": "Control de Calidad",
  "Equipe": "Equipo",
  "Notas Fiscais": "Facturación",
  "Minha Empresa": "Mi Empresa",
  "Minha Conta": "Mi Cuenta",
  "Planos & Upgrade": "Planes & Upgrade",
  "PORTAL DO CLIENTE": "PORTAL DEL CLIENTE",
  "Portal do Cliente • Bravvi ERP": "Portal del Cliente • Bravvi ERP",
  "Abertura & Visão Geral da Fábrica": "Inicio & Visión General de la Fábrica",
  "SISTEMA > ABERTURA": "SISTEMA > INICIO",
  "FATURAMENTO EM CARTEIRA": "FACTURACIÓN EN CARTERA",
  "CARGA DA FÁBRICA (PEÇAS)": "CARGA DE FÁBRICA (PIEZAS)",
  "QUARENTENA (APROVAÇÃO)": "CONTROL DE CALIDAD (APROBACIÓN)",
  "MARGEM MÉDIA BRUTA": "MARGEN BRUTO PROMEDIO",
  "Acima da média industrial têxtil": "Por encima del promedio industrial textil",
  "Aguardando checklist rigoroso": "Esperando checklist riguroso",
  "RADAR DE PRAZOS:": "RADAR DE PLAZOS:",
  "Atrasados:": "Atrasados:",
  "Vencem Hoje:": "Vencen Hoy:",
  "Vencem Amanhã:": "Vencen Mañana:",
  "Atenção (2-3d):": "Atención (2-3d):",
  "No Prazo (4-7d):": "A Tiempo (4-7d):",
  "Confortável (>7d):": "Holgado (>7d):",
  "Performance Financeira Semestral": "Rendimiento Financiero Semestral",
  "Performance Financeira Semestral (R$)": "Rendimiento Financiero Semestral ($)",
  "Performance Financeira Semestral (€)": "Rendimiento Financiero Semestral (€)",
  "Valores em Milhares": "Valores en Miles",
  "Editar Gráfico": "Editar Gráfico",
  "Entradas": "Ingresos",
  "Saídas": "Egresos",
  "Saldo Líquido": "Saldo Neto",
  "Capacidade de Produção por Setor": "Capacidad de Producción por Sector",
  "Oficina em Ritmo Normal": "Taller en Ritmo Normal",
  "Editar Capacidades": "Editar Capacidades",
  "Mesa de Corte": "Mesa de Corte",
  "Bordado Computadorizado": "Bordado Computarizado",
  "Estamparia & Silk/DTF": "Estampado & Silk/DTF",
  "Linha de Costura & Fechamento": "Línea de Costura & Ensamble",
  "Últimos Pedidos & Mockups Têxteis 3x4": "Últimos Pedidos y Mockups Textiles 3x4",
  "Ir para Todos os Pedidos": "Ir a Todos los Pedidos",
  "Ações & Status": "Acciones y Estado",
  "Estoque de Malhas, Tecidos & Aviamentos": "Inventario de Tejidos, Telas & Suministros",
  "SISTEMA > ESTOQUE DE MATÉRIA-PRIMA": "SISTEMA > INVENTARIO DE MATERIA PRIMA",
  "ITENS NO CATÁLOGO": "SUMINISTROS EN EL CATÁLOGO",
  "PATRIMÔNIO FÍSICO": "ACTIVOS FÍSICOS (VALORIZADOS)",
  "NÍVEL CRÍTICO DE ESTOQUE (COMPRA)": "NIVEL CRÍTICO DE INVENTARIO (COMPRA)",
  "PERDAS REGISTRADAS": "DEFICIENCIAS Y PÉRDIDAS",
  "Malhas, tecidos, aviamentos e DTF (prontos para consumo)": "Tejidos de punto, telas, adornos y DTF (listos para usar)",
  "Valorizado pelo custo médio ponderado": "Valorado por costo promedio ponderado",
  "Todos os saldos saudáveis": "Todos los equilibrios saludables",
  "Corte, OP, amostras e descarte": "Corte, OT, muestras y descarte",
  "Saldos & Insumos": "Saldos y Suministros",
  "Histórico de Movimentações": "Historial de Transacciones",
  "Buscar por código ou descrição...": "Buscar por código o descripción...",
  "Todas as Categorias": "Todas las categorías",
  "+ Cadastrar Entrada": "+ Registrar Entrada",
  "- Dar Baixa no Estoque": "- Reducir el Inventario",
  "CÓDIGO": "CÓDIGO",
  "DESCRIÇÃO DO MATERIAL / ENTRADA": "DESCRIPCIÓN DEL MATERIAL/ENTRADA",
  "CATEGORIA": "CATEGORÍA",
  "UNIDADE": "UNIDAD",
  "SALDO FÍSICO": "EQUILIBRIO FÍSICO",
  "ESTOQUE MÍNIMO": "STOCK MÍNIMO",
  "CUSTO UNITÁRIO": "COSTO UNITARIO",
  "AÇÕES": "ACCIONES",
  "Gestão Comercial, Orçamentos & Pedidos": "Gestión Comercial, Presupuestos & Pedidos",
  "SISTEMA > PEDIDOS & ORÇAMENTOS": "SISTEMA > PEDIDOS & PRESUPUESTOS",
  "Buscar cliente, número ou modelo...": "Buscar cliente, número o modelo...",
  "Todos os Status": "Todos los Estados",
  "Apenas Ativos (Sem Cancelados)": "Solo Activos (Sin Cancelados)",
  "Em Produção": "En Producción",
  "Em Quarentena": "En Cuarentena",
  "Apenas Orçamento": "Solo Presupuestos",
  "Finalizados": "Completados",
  "🚫 Apenas Cancelados": "🚫 Solo Cancelados",
  "Tabela Detalhada": "Tabla Detallada",
  "Kanban de Pedidos": "Kanban de Pedidos",
  "Gerar Link do Cliente": "Generar Enlace del Cliente",
  "Novo Orçamento / Pedido": "+ Nuevo Presupuesto / Pedido",
  "Novo Pedido": "+ Nuevo Pedido",
  "Cadastrar Primeiro Pedido / Orçamento": "Registrar Primer Pedido / Presupuesto",
  "100% QUITADO": "100% PAGADO",
  "PARCIAL": "PARCIAL",
  "PENDENTE": "PENDIENTE",
  "Salvar Alterações": "Guardar Cambios",
  "Salvar": "Guardar",
  "Cancelar": "Cancelar",
  "Fechar": "Cerrar",
  "Imprimir": "Imprimir",
  "Exportar": "Exportar",
  "Excluir": "Eliminar",
  "Editar": "Editar",
  "Detalhes": "Detalles",
  "Preço": "Precio",
  "Quantidade": "Cantidad",
  "Tamanho": "Talla",
  "Tamanhos": "Tallas",
  "Total": "Total",
  "Prazo": "Plazo",
  "Valor Total": "Importe Total",
  "Faturamento": "Facturación",
  "Lucro": "Ganancia",
  "Entregue": "Entregado",
  "Sair do Sistema": "Cerrar Sesión"
},
    'en': {
  "Abertura": "Dashboard",
  "Pedidos": "Orders",
  "OS / Fichas": "WO / Specs",
  "Nesting": "DTF Nesting",
  "Estoque": "Inventory",
  "Produtos": "Products",
  "Financeiro": "Financial",
  "Compras": "Purchases",
  "Clientes": "Customers",
  "Quarentena": "Quality Control",
  "Equipe": "Team",
  "Notas Fiscais": "Invoices & Tax",
  "Minha Empresa": "My Company",
  "Minha Conta": "My Account",
  "Planos & Upgrade": "Plans & Upgrade",
  "PORTAL DO CLIENTE": "CUSTOMER PORTAL",
  "Portal do Cliente • Bravvi ERP": "Customer Portal • Bravvi ERP",
  "Abertura & Visão Geral da Fábrica": "Dashboard & Factory Overview",
  "SISTEMA > ABERTURA": "SYSTEM > DASHBOARD",
  "FATURAMENTO EM CARTEIRA": "PORTFOLIO REVENUE",
  "CARGA DA FÁBRICA (PEÇAS)": "FACTORY WORKLOAD (PIECES)",
  "QUARENTENA (APROVAÇÃO)": "QUALITY CONTROL (APPROVAL)",
  "MARGEM MÉDIA BRUTA": "AVERAGE GROSS MARGIN",
  "Acima da média industrial têxtil": "Above textile industry average",
  "Aguardando checklist rigoroso": "Awaiting strict quality checklist",
  "RADAR DE PRAZOS:": "DEADLINE RADAR:",
  "Atrasados:": "Overdue:",
  "Vencem Hoje:": "Due Today:",
  "Vencem Amanhã:": "Due Tomorrow:",
  "Atenção (2-3d):": "Warning (2-3d):",
  "No Prazo (4-7d):": "On Time (4-7d):",
  "Confortável (>7d):": "Comfortable (>7d):",
  "Performance Financeira Semestral": "Semiannual Financial Performance",
  "Performance Financeira Semestral (R$)": "Semiannual Financial Performance ($)",
  "Performance Financeira Semestral (€)": "Semiannual Financial Performance (€)",
  "Valores em Milhares": "Values in Thousands",
  "Editar Gráfico": "Edit Chart",
  "Entradas": "Inflows",
  "Saídas": "Outflows",
  "Saldo Líquido": "Net Balance",
  "Capacidade de Produção por Setor": "Production Capacity by Sector",
  "Oficina em Ritmo Normal": "Workshop at Normal Pace",
  "Editar Capacidades": "Edit Capacities",
  "Mesa de Corte": "Cutting Table",
  "Bordado Computadorizado": "Computerized Embroidery",
  "Estamparia & Silk/DTF": "Screen Printing & DTF",
  "Linha de Costura & Fechamento": "Sewing & Assembly Line",
  "Últimos Pedidos & Mockups Têxteis 3x4": "Latest Orders & Textile Mockups 3x4",
  "Ir para Todos os Pedidos": "Go to All Orders",
  "Ações & Status": "Actions & Status",
  "Estoque de Malhas, Tecidos & Aviamentos": "Fabrics, Knits & Raw Materials Inventory",
  "SISTEMA > ESTOQUE DE MATÉRIA-PRIMA": "SYSTEM > RAW MATERIALS INVENTORY",
  "ITENS NO CATÁLOGO": "CATALOG ITEMS",
  "PATRIMÔNIO FÍSICO": "PHYSICAL ASSET VALUE",
  "NÍVEL CRÍTICO DE ESTOQUE (COMPRA)": "CRITICAL INVENTORY LEVEL (BUY)",
  "PERDAS REGISTRADAS": "REGISTERED DEFECTS & LOSSES",
  "Malhas, tecidos, aviamentos e DTF (prontos para consumo)": "Knits, fabrics, trims and DTF (ready for production)",
  "Valorizado pelo custo médio ponderado": "Valued at weighted average cost",
  "Todos os saldos saudáveis": "All inventory balances healthy",
  "Corte, OP, amostras e descarte": "Cutting, WO, samples and discard",
  "Saldos & Insumos": "Balances & Materials",
  "Histórico de Movimentações": "Transaction History",
  "Buscar por código ou descrição...": "Search by code or description...",
  "Todas as Categorias": "All Categories",
  "+ Cadastrar Entrada": "+ Record Material Intake",
  "- Dar Baixa no Estoque": "- Deduct from Inventory",
  "CÓDIGO": "CODE",
  "DESCRIÇÃO DO MATERIAL / ENTRADA": "MATERIAL / INTAKE DESCRIPTION",
  "CATEGORIA": "CATEGORY",
  "UNIDADE": "UNIT",
  "SALDO FÍSICO": "PHYSICAL STOCK",
  "ESTOQUE MÍNIMO": "MINIMUM STOCK",
  "CUSTO UNITÁRIO": "UNIT COST",
  "AÇÕES": "ACTIONS",
  "Gestão Comercial, Orçamentos & Pedidos": "Commercial Management, Quotes & Orders",
  "SISTEMA > PEDIDOS & ORÇAMENTOS": "SYSTEM > QUOTES & ORDERS",
  "Buscar cliente, número ou modelo...": "Search customer, number or item...",
  "Todos os Status": "All Statuses",
  "Apenas Ativos (Sem Cancelados)": "Active Only (No Cancelled)",
  "Em Produção": "In Production",
  "Em Quarentena": "In Quarantine",
  "Apenas Orçamento": "Quotes Only",
  "Finalizados": "Completed",
  "🚫 Apenas Cancelados": "🚫 Cancelled Only",
  "Tabela Detalhada": "Detailed Table",
  "Kanban de Pedidos": "Orders Kanban",
  "Gerar Link do Cliente": "Generate Customer Link",
  "Novo Orçamento / Pedido": "+ New Quote / Order",
  "Novo Pedido": "+ New Order",
  "Cadastrar Primeiro Pedido / Orçamento": "Create First Order / Quote",
  "100% QUITADO": "100% PAID IN FULL",
  "PARCIAL": "PARTIAL",
  "PENDENTE": "PENDING",
  "Salvar Alterações": "Save Changes",
  "Salvar": "Save",
  "Cancelar": "Cancel",
  "Fechar": "Close",
  "Imprimir": "Print",
  "Exportar": "Export",
  "Excluir": "Delete",
  "Editar": "Edit",
  "Detalhes": "Details",
  "Preço": "Price",
  "Quantidade": "Quantity",
  "Tamanho": "Size",
  "Tamanhos": "Sizes",
  "Total": "Total",
  "Prazo": "Deadline",
  "Valor Total": "Total Amount",
  "Faturamento": "Revenue",
  "Lucro": "Profit",
  "Entregue": "Delivered",
  "Sair do Sistema": "Sign Out"
},
    'fr': {
  "Abertura": "Tableau de Bord",
  "Pedidos": "Commandes",
  "OS / Fichas": "OF / Fiches",
  "Nesting": "Nesting DTF",
  "Estoque": "Stock",
  "Produtos": "Produits",
  "Financeiro": "Finances",
  "Compras": "Achats",
  "Clientes": "Clients",
  "Quarentena": "Contrôle Qualité",
  "Equipe": "Équipe",
  "Notas Fiscais": "Facturation",
  "Minha Empresa": "Mon Entreprise",
  "Minha Conta": "Mon Compte",
  "Planos & Upgrade": "Plans & Mise à niveau",
  "PORTAL DO CLIENTE": "PORTAIL CLIENT",
  "Portal do Cliente • Bravvi ERP": "Portail Client • Bravvi ERP",
  "Abertura & Visão Geral da Fábrica": "Tableau de Bord & Vue d'Ensemble",
  "SISTEMA > ABERTURA": "SYSTÈME > TABLEAU DE BORD",
  "FATURAMENTO EM CARTEIRA": "CHIFFRE D'AFFAIRES EN PORTEFEUILLE",
  "CARGA DA FÁBRICA (PEÇAS)": "CHARGE DE L'USINE (PIÈCES)",
  "QUARENTENA (APROVAÇÃO)": "CONTRÔLE QUALITÉ (APPROBATION)",
  "MARGEM MÉDIA BRUTA": "MARGE BRUTE MOYENNE",
  "Acima da média industrial têxtil": "Au-dessus de la moyenne industrielle textile",
  "Aguardando checklist rigoroso": "En attente du contrôle rigoureux",
  "RADAR DE PRAZOS:": "RADAR DES DÉLAIS:",
  "Atrasados:": "En retard:",
  "Vencem Hoje:": "Échéance aujourd'hui:",
  "Vencem Amanhã:": "Échéance demain:",
  "Atenção (2-3d):": "Attention (2-3j):",
  "No Prazo (4-7d):": "Dans les délais (4-7j):",
  "Confortável (>7d):": "Confortable (>7j):",
  "Performance Financeira Semestral": "Performance Financière Semestrielle",
  "Performance Financeira Semestral (R$)": "Performance Financière Semestrielle (€)",
  "Performance Financeira Semestral (€)": "Performance Financière Semestrielle (€)",
  "Valores em Milhares": "Valeurs en Milliers",
  "Editar Gráfico": "Modifier le Graphique",
  "Entradas": "Entrées",
  "Saídas": "Sorties",
  "Saldo Líquido": "Solde Net",
  "Capacidade de Produção por Setor": "Capacité de Production par Secteur",
  "Oficina em Ritmo Normal": "Atelier à Rythme Normal",
  "Editar Capacidades": "Modifier les Capacités",
  "Mesa de Corte": "Table de Coupe",
  "Bordado Computadorizado": "Broderie Informatisée",
  "Estamparia & Silk/DTF": "Sérigraphie & Silk/DTF",
  "Linha de Costura & Fechamento": "Ligne de Couture & Fermeture",
  "Últimos Pedidos & Mockups Têxteis 3x4": "Dernières Commandes & Maquettes Textiles 3x4",
  "Ir para Todos os Pedidos": "Voir Toutes les Commandes",
  "Ações & Status": "Actions & Statut",
  "Estoque de Malhas, Tecidos & Aviamentos": "Stock de Mailles, Tissus & Fournitures",
  "SISTEMA > ESTOQUE DE MATÉRIA-PRIMA": "SYSTÈME > GESTION DES STOCKS",
  "ITENS NO CATÁLOGO": "ARTICLES AU CATALOGUE",
  "PATRIMÔNIO FÍSICO": "ACTIFS PHYSIQUES (VALORISÉS)",
  "NÍVEL CRÍTICO DE ESTOQUE (COMPRA)": "NIVEAU CRITIQUE DE STOCK (ACHATS)",
  "PERDAS REGISTRADAS": "DÉFAUTS ET PERTES ENREGISTRÉES",
  "Malhas, tecidos, aviamentos e DTF (prontos para consumo)": "Mailles, tissus, fournitures et DTF (prêts à l'emploi)",
  "Valorizado pelo custo médio ponderado": "Évalué au coût moyen pondéré",
  "Todos os saldos saudáveis": "Tous les soldes sont sains",
  "Corte, OP, amostras e descarte": "Coupe, OF, échantillons et rebuts",
  "Saldos & Insumos": "Soldes & Fournitures",
  "Histórico de Movimentações": "Historique des Mouvements",
  "Buscar por código ou descrição...": "Rechercher par code ou description...",
  "Todas as Categorias": "Toutes les catégories",
  "+ Cadastrar Entrada": "+ Enregistrer une Entrée",
  "- Dar Baixa no Estoque": "- Sortie de Stock",
  "CÓDIGO": "CODE",
  "DESCRIÇÃO DO MATERIAL / ENTRADA": "DESCRIPTION DU MATÉRIEL/ENTRÉE",
  "CATEGORIA": "CATÉGORIE",
  "UNIDADE": "UNITÉ",
  "SALDO FÍSICO": "SOLDE PHYSIQUE",
  "ESTOQUE MÍNIMO": "STOCK MINIMUM",
  "CUSTO UNITÁRIO": "COÛT UNITAIRE",
  "AÇÕES": "ACTIONS",
  "Gestão Comercial, Orçamentos & Pedidos": "Gestion Commerciale, Devis & Commandes",
  "SISTEMA > PEDIDOS & ORÇAMENTOS": "SYSTÈME > COMMANDES & DEVIS",
  "Buscar cliente, número ou modelo...": "Rechercher client, numéro ou modèle...",
  "Todos os Status": "Tous les Statuts",
  "Apenas Ativos (Sem Cancelados)": "Actifs Uniquement (Sans Annulés)",
  "Em Produção": "En Production",
  "Em Quarentena": "En Quarantaine",
  "Apenas Orçamento": "Devis Uniquement",
  "Finalizados": "Terminés",
  "🚫 Apenas Cancelados": "🚫 Annulés Uniquement",
  "Tabela Detalhada": "Tableau Détaillé",
  "Kanban de Pedidos": "Kanban des Commandes",
  "Gerar Link do Cliente": "Générer le Lien Client",
  "Novo Orçamento / Pedido": "+ Nouveau Devis / Commande",
  "Novo Pedido": "+ Nouvelle Commande",
  "Cadastrar Primeiro Pedido / Orçamento": "Créer Première Commande / Devis",
  "100% QUITADO": "100% RÉGLÉ",
  "PARCIAL": "PARTIEL",
  "PENDENTE": "EN ATTENTE",
  "Salvar Alterações": "Enregistrer les Modifications",
  "Salvar": "Enregistrer",
  "Cancelar": "Annuler",
  "Fechar": "Fermer",
  "Imprimir": "Imprimer",
  "Exportar": "Exporter",
  "Excluir": "Supprimer",
  "Editar": "Modifier",
  "Detalhes": "Détails",
  "Preço": "Prix",
  "Quantidade": "Quantité",
  "Tamanho": "Taille",
  "Tamanhos": "Tailles",
  "Total": "Total",
  "Prazo": "Délai",
  "Valor Total": "Montant Total",
  "Faturamento": "Chiffre d'Affaires",
  "Lucro": "Bénéfice",
  "Entregue": "Livré",
  "Sair do Sistema": "Déconnexion"
},
    'pt-PT': {
  "Abertura": "Início",
  "Pedidos": "Encomendas",
  "OS / Fichas": "OF / Fichas",
  "Nesting": "Nesting DTF",
  "Estoque": "Stock",
  "Produtos": "Artigos",
  "Financeiro": "Financeiro",
  "Compras": "Compras",
  "Clientes": "Clientes",
  "Quarentena": "Quarentena",
  "Equipe": "Equipa",
  "Notas Fiscais": "Faturação",
  "Minha Empresa": "A Minha Empresa",
  "Minha Conta": "A Minha Conta",
  "Planos & Upgrade": "Planos & Upgrade",
  "PORTAL DO CLIENTE": "PORTAL DO CLIENTE",
  "Portal do Cliente • Bravvi ERP": "Portal do Cliente • Bravvi ERP",
  "Abertura & Visão Geral da Fábrica": "Início & Visão Geral da Fábrica",
  "SISTEMA > ABERTURA": "SISTEMA > INÍCIO",
  "FATURAMENTO EM CARTEIRA": "FATURAÇÃO EM CARTEIRA",
  "CARGA DA FÁBRICA (PEÇAS)": "CARGA DA FÁBRICA (PEÇAS)",
  "QUARENTENA (APROVAÇÃO)": "QUARENTENA (APROVAÇÃO)",
  "MARGEM MÉDIA BRUTA": "MARGEM MÉDIA BRUTA",
  "Acima da média industrial têxtil": "Acima da média industrial têxtil",
  "Aguardando checklist rigoroso": "A aguardar checklist rigoroso",
  "RADAR DE PRAZOS:": "RADAR DE PRAZOS:",
  "Atrasados:": "Atrasadas:",
  "Vencem Hoje:": "Vencem Hoje:",
  "Vencem Amanhã:": "Vencem Amanhã:",
  "Atenção (2-3d):": "Atenção (2-3d):",
  "No Prazo (4-7d):": "No Prazo (4-7d):",
  "Confortável (>7d):": "Confortável (>7d):",
  "Performance Financeira Semestral": "Desempenho Financeiro Semestral",
  "Performance Financeira Semestral (R$)": "Desempenho Financeiro Semestral (€)",
  "Performance Financeira Semestral (€)": "Desempenho Financeiro Semestral (€)",
  "Valores em Milhares": "Valores em Milhares",
  "Editar Gráfico": "Editar Gráfico",
  "Entradas": "Entradas",
  "Saídas": "Saídas",
  "Saldo Líquido": "Saldo Líquido",
  "Capacidade de Produção por Setor": "Capacidade de Produção por Setor",
  "Oficina em Ritmo Normal": "Oficina em Ritmo Normal",
  "Editar Capacidades": "Editar Capacidades",
  "Mesa de Corte": "Mesa de Corte",
  "Bordado Computadorizado": "Bordado Computadorizado",
  "Estamparia & Silk/DTF": "Estamparia & Silk/DTF",
  "Linha de Costura & Fechamento": "Linha de Costura & Fechamento",
  "Últimos Pedidos & Mockups Têxteis 3x4": "Últimas Encomendas & Mockups Têxteis 3x4",
  "Ir para Todos os Pedidos": "Ir para Todas as Encomendas",
  "Ações & Status": "Ações & Estado",
  "Estoque de Malhas, Tecidos & Aviamentos": "Stock de Malhas, Tecidos & Aviamentos",
  "SISTEMA > ESTOQUE DE MATÉRIA-PRIMA": "SISTEMA > STOCK DE MATÉRIAS-PRIMAS",
  "ITENS NO CATÁLOGO": "ARTIGOS NO CATÁLOGO",
  "PATRIMÔNIO FÍSICO": "PATRIMÓNIO FÍSICO (VALORIZADO)",
  "NÍVEL CRÍTICO DE ESTOQUE (COMPRA)": "NÍVEL CRÍTICO DE STOCK (COMPRA)",
  "PERDAS REGISTRADAS": "PERDAS E QUEBRAS REGISTADAS",
  "Malhas, tecidos, aviamentos e DTF (prontos para consumo)": "Malhas, tecidos, aviamentos e DTF (prontos para fabrico)",
  "Valorizado pelo custo médio ponderado": "Valorizado pelo custo médio ponderado",
  "Todos os saldos saudáveis": "Todos os saldos saudáveis",
  "Corte, OP, amostras e descarte": "Corte, OF, amostras e refugo",
  "Saldos & Insumos": "Saldos & Matérias-Primas",
  "Histórico de Movimentações": "Histórico de Movimentos",
  "Buscar por código ou descrição...": "Pesquisar por código ou descrição...",
  "Todas as Categorias": "Todas as Categorias",
  "+ Cadastrar Entrada": "+ Registar Entrada",
  "- Dar Baixa no Estoque": "- Dar Baixa no Stock",
  "CÓDIGO": "CÓDIGO",
  "DESCRIÇÃO DO MATERIAL / ENTRADA": "DESCRIÇÃO DO MATERIAL/ENTRADA",
  "CATEGORIA": "CATEGORIA",
  "UNIDADE": "UNIDADE",
  "SALDO FÍSICO": "SALDO FÍSICO",
  "ESTOQUE MÍNIMO": "STOCK MÍNIMO",
  "CUSTO UNITÁRIO": "CUSTO UNITÁRIO",
  "AÇÕES": "AÇÕES",
  "Gestão Comercial, Orçamentos & Pedidos": "Gestão Comercial, Orçamentos & Encomendas",
  "SISTEMA > PEDIDOS & ORÇAMENTOS": "SISTEMA > ENCOMENDAS & ORÇAMENTOS",
  "Buscar cliente, número ou modelo...": "Pesquisar cliente, número ou artigo...",
  "Todos os Status": "Todos os Estados",
  "Apenas Ativos (Sem Cancelados)": "Apenas Ativos (Sem Cancelados)",
  "Em Produção": "Em Fabrico",
  "Em Quarentena": "Em Quarentena",
  "Apenas Orçamento": "Apenas Orçamento",
  "Finalizados": "Concluídos",
  "🚫 Apenas Cancelados": "🚫 Apenas Cancelados",
  "Tabela Detalhada": "Tabela Detalhada",
  "Kanban de Pedidos": "Kanban de Encomendas",
  "Gerar Link do Cliente": "Gerar Ligação para o Cliente",
  "Novo Orçamento / Pedido": "+ Novo Orçamento / Encomenda",
  "Novo Pedido": "+ Nova Encomenda",
  "Cadastrar Primeiro Pedido / Orçamento": "Criar Primeira Encomenda / Orçamento",
  "100% QUITADO": "100% LIQUIDADO",
  "PARCIAL": "PARCIAL",
  "PENDENTE": "PENDENTE",
  "Salvar Alterações": "Guardar Alterações",
  "Salvar": "Guardar",
  "Cancelar": "Cancelar",
  "Fechar": "Fechar",
  "Imprimir": "Imprimir",
  "Exportar": "Exportar",
  "Excluir": "Eliminar",
  "Editar": "Editar",
  "Detalhes": "Detalhes",
  "Preço": "Preço",
  "Quantidade": "Quantidade",
  "Tamanho": "Tamanho",
  "Tamanhos": "Tamanhos",
  "Total": "Total",
  "Prazo": "Prazo de Entrega",
  "Valor Total": "Montante Total",
  "Faturamento": "Faturação",
  "Lucro": "Lucro",
  "Entregue": "Entregue",
  "Celular": "Telemóvel",
  "Telefone": "Contacto Telefónico",
  "Sair do Sistema": "Terminar Sessão"
},
    'de': {
  "Abertura": "Übersicht",
  "Pedidos": "Aufträge",
  "OS / Fichas": "FA / Datenblätter",
  "Nesting": "DTF Nesting",
  "Estoque": "Lagerbestand",
  "Produtos": "Produkte",
  "Financeiro": "Finanzen",
  "Compras": "Einkauf",
  "Clientes": "Kunden",
  "Quarentena": "Qualitätskontrolle",
  "Equipe": "Team",
  "Notas Fiscais": "Rechnungswesen",
  "Minha Empresa": "Mein Unternehmen",
  "Minha Conta": "Mein Konto",
  "Planos & Upgrade": "Pläne & Upgrade",
  "Abertura & Visão Geral da Fábrica": "Dashboard & Fabrikübersicht",
  "FATURAMENTO EM CARTEIRA": "AUFTRAGSBESTANDSUMSATZ",
  "CARGA DA FÁBRICA (PEÇAS)": "FABRIKAUSLASTUNG (STÜCK)",
  "QUARENTENA (APROVAÇÃO)": "QUALITÄTSKONTROLLE (FREIGABE)",
  "MARGEM MÉDIA BRUTA": "DURCHSCHNITTLICHE BRUTTOMARGE",
  "RADAR DE PRAZOS:": "TERMINRADAR:",
  "Performance Financeira Semestral": "Halbjährliche Finanzleistung",
  "Capacidade de Produção por Setor": "Produktionskapazität nach Bereich",
  "Mesa de Corte": "Zuschneidetisch",
  "Linha de Costura & Fechamento": "Näherei & Endfertigung",
  "Salvar Alterações": "Änderungen Speichern",
  "Salvar": "Speichern",
  "Cancelar": "Abbrechen",
  "Fechar": "Schließen",
  "Preço": "Preis",
  "Quantidade": "Menge",
  "Total": "Gesamt"
},
    'it': {
  "Abertura": "Dashboard",
  "Pedidos": "Ordini",
  "OS / Fichas": "OL / Schede",
  "Nesting": "Nesting DTF",
  "Estoque": "Magazzino",
  "Produtos": "Prodotti",
  "Financeiro": "Finanze",
  "Compras": "Acquisti",
  "Clientes": "Clienti",
  "Quarentena": "Controllo Qualità",
  "Equipe": "Squadra",
  "Notas Fiscais": "Fatturazione",
  "Minha Empresa": "La Mia Azienda",
  "Minha Conta": "Il Mio Account",
  "Planos & Upgrade": "Piani & Upgrade",
  "Abertura & Visão Geral da Fábrica": "Dashboard & Panoramica Fabbrica",
  "FATURAMENTO EM CARTEIRA": "FATTURATO IN PORTAFOGLIO",
  "CARGA DA FÁBRICA (PEÇAS)": "CARICO DI FABBRICA (PEZZI)",
  "QUARENTENA (APROVAÇÃO)": "CONTROLLO QUALITÀ (APPROVAZIONE)",
  "MARGEM MÉDIA BRUTA": "MARGINE LORDO MEDIO",
  "RADAR DE PRAZOS:": "RADAR DELLE SCADENZE:",
  "Performance Financeira Semestral": "Performance Finanziaria Semestrale",
  "Capacidade de Produção por Setor": "Capacità di Produzione per Settore",
  "Mesa de Corte": "Tavolo da Taglio",
  "Linha de Costura & Fechamento": "Linea di Cucitura & Chiusura",
  "Salvar Alterações": "Salva Modifiche",
  "Salvar": "Salva",
  "Cancelar": "Annulla",
  "Fechar": "Chiudi",
  "Preço": "Prezzo",
  "Quantidade": "Quantità",
  "Total": "Totale"
}
  };

  // Helper de Dicionário com fallback em Inglês para línguas raras
  function obterDicionarioAtivo(lang) {
    if (DICIONARIOS[lang]) return DICIONARIOS[lang];
    if (lang.startsWith('es')) return DICIONARIOS['es'];
    if (lang.startsWith('en')) return DICIONARIOS['en'];
    if (lang.startsWith('fr')) return DICIONARIOS['fr'];
    if (lang.startsWith('de')) return DICIONARIOS['de'];
    if (lang.startsWith('it')) return DICIONARIOS['it'];
    if (lang === 'pt-PT') return DICIONARIOS['pt-PT'];
    // Fallback padrão mundial para outros 100 idiomas
    return DICIONARIOS['en'];
  }

  // 4. Tradutor Inteligente de Expressões e Padrões Dinâmicos
  function traduzirTextoNativo(textoOriginal, lang) {
    if (!textoOriginal || typeof textoOriginal !== 'string') return textoOriginal;
    if (lang === 'pt-BR') return textoOriginal;

    const trimmed = textoOriginal.trim();
    if (!trimmed || /^[0-9\s.,/\\-_:;()]+$/.test(trimmed)) {
      return textoOriginal;
    }

    const dict = obterDicionarioAtivo(lang);

    // A. Correspondência Direta Exata (O(1))
    if (dict[trimmed]) {
      return textoOriginal.replace(trimmed, dict[trimmed]);
    }

    // B. Padrões Industriais com Números Dinâmicos
    let res = textoOriginal;

    // "X ordens ativas na oficina"
    const mOrdens = res.match(/(\d+)\s+ordens\s+ativas\s+na\s+oficina/i);
    if (mOrdens) {
      const n = mOrdens[1];
      const rep = {
        'es': `${n} órdenes activas en el taller`,
        'en': `${n} active orders in workshop`,
        'fr': `${n} ordres actifs dans l'atelier`,
        'pt-PT': `${n} ordens ativas na oficina`,
        'de': `${n} aktive Aufträge in der Werkstatt`,
        'it': `${n} ordini attivi in officina`
      };
      res = res.replace(mOrdens[0], rep[lang] || rep['en']);
    }

    // "X pedidos"
    const mPedidos = res.match(/(\d+)\s+pedidos/i);
    if (mPedidos) {
      const n = mPedidos[1];
      const rep = {
        'es': `${n} pedidos`,
        'en': `${n} orders`,
        'fr': `${n} commandes`,
        'pt-PT': `${n} encomendas`
      };
      res = res.replace(mPedidos[0], rep[lang] || rep['en']);
    }

    // "Capacidade: X peças/dia"
    const mCapac = res.match(/Capacidade:\s*(\d+)\s*peças\/dia/i);
    if (mCapac) {
      const n = mCapac[1];
      const rep = {
        'es': `Capacidad: ${n} piezas/día`,
        'en': `Capacity: ${n} pcs/day`,
        'fr': `Capacité: ${n} pièces/jour`,
        'pt-PT': `Capacidade: ${n} peças/dia`
      };
      res = res.replace(mCapac[0], rep[lang] || rep['en']);
    }

    // "X peças (Y%)"
    const mPecasPerc = res.match(/(\d+)\s+peças\s+\((\d+)%\)/i);
    if (mPecasPerc) {
      const p = mPecasPerc[1];
      const prc = mPecasPerc[2];
      const rep = {
        'es': `${p} piezas (${prc}%)`,
        'en': `${p} pcs (${prc}%)`,
        'fr': `${p} pièces (${prc}%)`,
        'pt-PT': `${p} peças (${prc}%)`
      };
      res = res.replace(mPecasPerc[0], rep[lang] || rep['en']);
    }

    // Sub-palavras fundamentais
    if (lang === 'es' || lang.startsWith('es')) {
      res = res.replace(/\bPedidos\b/g, 'Pedidos')
               .replace(/\bPedido\b/g, 'Pedido')
               .replace(/\bEstoque\b/g, 'Inventario')
               .replace(/\bProdutos\b/g, 'Productos')
               .replace(/\bProduto\b/g, 'Producto')
               .replace(/\bFinanceiro\b/g, 'Finanzas')
               .replace(/\bClientes\b/g, 'Clientes')
               .replace(/\bCliente\b/g, 'Cliente')
               .replace(/\bQuarentena\b/g, 'Control de Calidad')
               .replace(/\bEquipe\b/g, 'Equipo')
               .replace(/\bSalvar\b/g, 'Guardar')
               .replace(/\bCancelar\b/g, 'Cancelar')
               .replace(/\bFechar\b/g, 'Cerrar')
               .replace(/\bBuscar\b/g, 'Buscar')
               .replace(/R\$\s*/g, '$ ');
    } else if (lang === 'en' || lang.startsWith('en')) {
      res = res.replace(/\bPedidos\b/g, 'Orders')
               .replace(/\bPedido\b/g, 'Order')
               .replace(/\bEstoque\b/g, 'Inventory')
               .replace(/\bProdutos\b/g, 'Products')
               .replace(/\bProduto\b/g, 'Product')
               .replace(/\bFinanceiro\b/g, 'Financial')
               .replace(/\bCompras\b/g, 'Purchases')
               .replace(/\bClientes\b/g, 'Customers')
               .replace(/\bCliente\b/g, 'Customer')
               .replace(/\bQuarentena\b/g, 'Quality Control')
               .replace(/\bEquipe\b/g, 'Team')
               .replace(/\bSalvar\b/g, 'Save')
               .replace(/\bCancelar\b/g, 'Cancel')
               .replace(/\bFechar\b/g, 'Close')
               .replace(/\bBuscar\b/g, 'Search')
               .replace(/R\$\s*/g, '$ ');
    } else if (lang === 'fr' || lang.startsWith('fr')) {
      res = res.replace(/\bPedidos\b/g, 'Commandes')
               .replace(/\bPedido\b/g, 'Commande')
               .replace(/\bEstoque\b/g, 'Stock')
               .replace(/\bProdutos\b/g, 'Produits')
               .replace(/\bProduto\b/g, 'Produit')
               .replace(/\bFinanceiro\b/g, 'Finances')
               .replace(/\bCompras\b/g, 'Achats')
               .replace(/\bClientes\b/g, 'Clients')
               .replace(/\bCliente\b/g, 'Client')
               .replace(/\bQuarentena\b/g, 'Contrôle Qualité')
               .replace(/\bEquipe\b/g, 'Équipe')
               .replace(/\bSalvar\b/g, 'Enregistrer')
               .replace(/\bCancelar\b/g, 'Annuler')
               .replace(/\bFechar\b/g, 'Fermer')
               .replace(/\bBuscar\b/g, 'Rechercher')
               .replace(/R\$\s*/g, '€ ');
    } else if (lang === 'pt-PT') {
      res = res.replace(/\bPedidos\b/g, 'Encomendas')
               .replace(/\bPedido\b/g, 'Encomenda')
               .replace(/\bEstoque\b/g, 'Stock')
               .replace(/\bProdutos\b/g, 'Artigos')
               .replace(/\bProduto\b/g, 'Artigo')
               .replace(/\bEquipe\b/g, 'Equipa')
               .replace(/\bUsuários\b/g, 'Utilizadores')
               .replace(/\bFaturamento\b/g, 'Faturação')
               .replace(/\bCelular\b/g, 'Telemóvel')
               .replace(/\bSalvar\b/g, 'Guardar')
               .replace(/\bBuscar\b/g, 'Pesquisar')
               .replace(/R\$\s*/g, '€ ');
    }

    return res;
  }

  // 5. Varredor Recursivo de Nós do DOM (Ultra-Rápido, 0ms)
  function traduzirElementoRecursivo(raiz, lang) {
    if (!raiz || !raiz.nodeType) return;
    if (raiz.id === 'bravviLanguageModal') return;

    // Text Node direto
    if (raiz.nodeType === 3) {
      const raw = raiz.nodeValue;
      if (!raw || !raw.trim()) return;
      if (raiz.__origText === undefined) raiz.__origText = raw;
      raiz.nodeValue = (lang === 'pt-BR') ? raiz.__origText : traduzirTextoNativo(raiz.__origText, lang);
      return;
    }

    // Element Node
    if (raiz.nodeType === 1) {
      const tag = raiz.tagName.toUpperCase();
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(tag)) return;

      const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null, false);
      let textNode;
      while ((textNode = walker.nextNode())) {
        const raw = textNode.nodeValue;
        if (!raw || !raw.trim()) continue;
        const parent = textNode.parentNode;
        if (parent && (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName) || parent.closest('#bravviLanguageModal'))) continue;

        if (textNode.__origText === undefined) textNode.__origText = raw;
        textNode.nodeValue = (lang === 'pt-BR') ? textNode.__origText : traduzirTextoNativo(textNode.__origText, lang);
      }

      // Traduz Atributos Relevantes
      if (raiz.placeholder) {
        if (raiz.__origPlaceholder === undefined) raiz.__origPlaceholder = raiz.placeholder;
        raiz.placeholder = (lang === 'pt-BR') ? raiz.__origPlaceholder : traduzirTextoNativo(raiz.__origPlaceholder, lang);
      }
      if (raiz.title) {
        if (raiz.__origTitle === undefined) raiz.__origTitle = raiz.title;
        raiz.title = (lang === 'pt-BR') ? raiz.__origTitle : traduzirTextoNativo(raiz.__origTitle, lang);
      }

      // Elementos internos de input e select
      const inputs = raiz.querySelectorAll ? raiz.querySelectorAll('input[placeholder], textarea[placeholder], button[title], select') : [];
      inputs.forEach(el => {
        if (el.closest && el.closest('#bravviLanguageModal')) return;
        if (el.placeholder) {
          if (el.__origPlaceholder === undefined) el.__origPlaceholder = el.placeholder;
          el.placeholder = (lang === 'pt-BR') ? el.__origPlaceholder : traduzirTextoNativo(el.__origPlaceholder, lang);
        }
        if (el.title) {
          if (el.__origTitle === undefined) el.__origTitle = el.title;
          el.title = (lang === 'pt-BR') ? el.__origTitle : traduzirTextoNativo(el.__origTitle, lang);
        }
        if (el.tagName === 'SELECT') {
          Array.from(el.options).forEach(opt => {
            if (opt.__origText === undefined) opt.__origText = opt.text;
            opt.text = (lang === 'pt-BR') ? opt.__origText : traduzirTextoNativo(opt.__origText, lang);
          });
        }
      });
    }
  }

  // 6. Varredura Total da Página Nativamente
  function traduzirPaginaCompleta() {
    const lang = idiomaAtual;
    const config = obterIdiomaConfig();

    document.documentElement.lang = config.code;
    document.documentElement.dir = config.rtl ? 'rtl' : 'ltr';

    // 1. Atualizar Botões de Idioma
    const hFlag = document.getElementById('headerLangFlag');
    const hText = document.getElementById('headerLangText');
    if (hFlag) hFlag.textContent = config.flag;
    if (hText) hText.textContent = config.nome.split(' (')[0];

    const sText = document.getElementById('sidebarLangText');
    if (sText) sText.textContent = `${config.flag} ${config.nome.split(' (')[0]}`;

    const eDisplay = document.getElementById('empresaLangDisplay');
    if (eDisplay) eDisplay.textContent = `${config.flag} ${config.nome}`;

    // 2. Traduzir Navbar Superior
    const navbar = document.getElementById('top-navbar') || document.querySelector('.top-navbar');
    if (navbar) traduzirElementoRecursivo(navbar, lang);

    // 3. Traduzir Barra Lateral (Sidebar)
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    if (sidebar) traduzirElementoRecursivo(sidebar, lang);

    // 4. Traduzir Conteúdo Principal do ERP
    const mainArea = document.getElementById('appMainContent') || document.querySelector('.main-content') || document.body;
    if (mainArea) traduzirElementoRecursivo(mainArea, lang);

    // 5. Traduzir Modais
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) traduzirElementoRecursivo(modalContainer, lang);

    // 6. Traduzir Título e Breadcrumb da Página
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      if (pageTitle.__origText === undefined) pageTitle.__origText = pageTitle.textContent;
      pageTitle.textContent = (lang === 'pt-BR') ? pageTitle.__origText : traduzirTextoNativo(pageTitle.__origText, lang);
    }
    const pageBreadcrumb = document.getElementById('pageBreadcrumb');
    if (pageBreadcrumb) {
      if (pageBreadcrumb.__origText === undefined) pageBreadcrumb.__origText = pageBreadcrumb.textContent;
      pageBreadcrumb.textContent = (lang === 'pt-BR') ? pageBreadcrumb.__origText : traduzirTextoNativo(pageBreadcrumb.__origText, lang);
    }
  }

  // 7. MutationObserver Nativo (Intercepta Abas e Modais Instantaneamente)
  let observerNativo = null;
  function iniciarObservadorNativo() {
    if (observerNativo) return;
    observerNativo = new MutationObserver((mutations) => {
      if (idiomaAtual === 'pt-BR') return;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j];
          if (node.nodeType === 1 && !node.closest('#bravviLanguageModal')) {
            traduzirElementoRecursivo(node, idiomaAtual);
          }
        }
      }
    });
    observerNativo.observe(document.body, { childList: true, subtree: true });
  }

  // 8. Formatação de Moeda Dinâmica Nativa
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

  // 9. Ação de Mudar o Idioma Nativamente
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

    // Expulsa qualquer cookie residual do Google
    expulsarGoogleCookies();

    // Re-renderiza a aba atual do ERP se estiver carregada
    if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
      window.ERP.navegarPara(window.ERP.obterAbaAtiva());
    }

    // Executa tradução nativa imediata
    traduzirPaginaCompleta();
    setTimeout(traduzirPaginaCompleta, 50);
    setTimeout(traduzirPaginaCompleta, 180);

    // Toast Informativo Nativo
    const msg = {
      'pt-BR': `Idioma definido para Português (Brasil) • Moeda: ${encontrado.simbolo}`,
      'pt-PT': `Idioma alterado para Português (Portugal) • Moeda: ${encontrado.simbolo}`,
      'es': `¡Idioma cambiado a Español! Moneda: ${encontrado.simbolo}`,
      'en': `Language set to English! Currency: ${encontrado.simbolo}`,
      'fr': `Langue définie en Français! Devise: ${encontrado.simbolo}`,
      'de': `Sprache auf Deutsch eingestellt! Währung: ${encontrado.simbolo}`,
      'it': `Lingua impostata su Italiano! Valuta: ${encontrado.simbolo}`
    };

    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      window.ERP.mostrarToast(msg[idiomaAtual] || `Idioma ativado: ${encontrado.nome} (${encontrado.simbolo})`, 'sucesso');
    }
  }

  // 10. Modal Interativo com Busca em Tempo Real
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
              Motor 100% nativo do ERP: tradução instantânea e formatação de moeda automática
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px 8px; border-radius: 6px;">&times;</button>
        </div>

        <!-- Barra de Busca Instantânea -->
        <div style="padding: 14px 24px 8px 24px; background: #ffffff;">
          <div style="position: relative;">
            <input type="text" id="inputSearchLanguage" placeholder="🔍 Digite para pesquisar seu idioma ou país (ex: Paraguai, Portugal, Espanha, English, Français)..." style="width: 100%; padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#cbd5e1'">
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

  // 11. Inicialização
  function inicializar() {
    iniciarObservadorNativo();
    traduzirPaginaCompleta();
    setTimeout(traduzirPaginaCompleta, 100);
    setTimeout(traduzirPaginaCompleta, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    setTimeout(inicializar, 50);
  }

  // 12. Exportação da API i18n
  window.ERP_I18N = {
    idiomaAtual: () => idiomaAtual,
    obterIdiomaConfig,
    formatarMoeda,
    selecionarIdioma,
    abrirModalIdioma,
    traduzirElemento: traduzirElementoRecursivo,
    traduzirPaginaCompleta,
    catalogo: IDIOMAS_CATALOGO
  };

})();
