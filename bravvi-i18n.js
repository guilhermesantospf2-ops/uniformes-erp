/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR DE INTERNACIONALIZAÇÃO GLOBAL (i18n)
 * ============================================================================
 * Suporte a todos os idiomas do mundo com seleção instantânea,
 * formatação de moeda automática e tradução inteligente de interface.
 */

(function () {
  'use strict';

  // 1. Catálogo Completo de Idiomas do Mundo com bandeiras, moeda e locale
  const IDIOMAS_CATALOGO = [
    // Principais & Mercados Ativos
    { code: 'pt-BR', nome: 'Português (Brasil)', flag: '🇧🇷', moeda: 'BRL', simbolo: 'R$', locale: 'pt-BR', popular: true },
    { code: 'pt-PT', nome: 'Português (Portugal)', flag: '🇵🇹', moeda: 'EUR', simbolo: '€', locale: 'pt-PT', popular: true },
    { code: 'es', nome: 'Español (Paraguay & Latam)', flag: '🇵🇾', moeda: 'USD', simbolo: '$', locale: 'es-PY', popular: true },
    { code: 'es-ES', nome: 'Español (España)', flag: '🇪🇸', moeda: 'EUR', simbolo: '€', locale: 'es-ES', popular: true },
    { code: 'en', nome: 'English (United States / Global)', flag: '🇺🇸', moeda: 'USD', simbolo: '$', locale: 'en-US', popular: true },
    { code: 'en-GB', nome: 'English (United Kingdom)', flag: '🇬🇧', moeda: 'GBP', simbolo: '£', locale: 'en-GB', popular: true },
    { code: 'fr', nome: 'Français', flag: '🇫🇷', moeda: 'EUR', simbolo: '€', locale: 'fr-FR', popular: true },
    { code: 'de', nome: 'Deutsch', flag: '🇩🇪', moeda: 'EUR', simbolo: '€', locale: 'de-DE', popular: true },
    { code: 'it', nome: 'Italiano', flag: '🇮🇹', moeda: 'EUR', simbolo: '€', locale: 'it-IT', popular: true },
    { code: 'nl', nome: 'Nederlands', flag: '🇳🇱', moeda: 'EUR', simbolo: '€', locale: 'nl-NL', popular: true },
    { code: 'ru', nome: 'Русский (Russian)', flag: '🇷🇺', moeda: 'RUB', simbolo: '₽', locale: 'ru-RU', popular: true },
    { code: 'zh', nome: '简体中文 (Chinese)', flag: '🇨🇳', moeda: 'CNY', simbolo: '¥', locale: 'zh-CN', popular: true },
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
    { code: 'cy', nome: 'Cymraeg (Welsh)', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', moeda: 'GBP', simbolo: '£', locale: 'cy-GB' },
    { code: 'xh', nome: 'isiXhosa', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'xh-ZA' },
    { code: 'yi', nome: 'ייִדיש (Yiddish)', flag: '🌐', moeda: 'USD', simbolo: '$', locale: 'yi', rtl: true },
    { code: 'zu', nome: 'isiZulu', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'zu-ZA' },
    { code: 'gn', nome: 'Avañeʼẽ (Guaraní)', flag: '🇵🇾', moeda: 'PYG', simbolo: 'Gs', locale: 'gn-PY' }
  ];

  // 2. Dicionários Oficiais de Termos do Sistema para as Principais Línguas
  const DICIONARIOS = {
    'pt-BR': {
      // Sidebar
      'menu_abertura': 'Abertura',
      'menu_pedidos': 'Pedidos',
      'menu_os': 'OS / Fichas',
      'menu_nesting': 'Nesting DTF',
      'menu_estoque': 'Estoque',
      'menu_produtos': 'Produtos',
      'menu_financeiro': 'Financeiro',
      'menu_compras': 'Compras',
      'menu_clientes': 'Clientes',
      'menu_quarentena': 'Quarentena',
      'menu_equipe': 'Equipe',
      'menu_nfe': 'Notas Fiscais',
      'menu_empresa': 'Minha Empresa',
      // Headers & Actions
      'minha_conta': 'Minha Conta',
      'licenca_pro': 'LICENÇA PRO ATIVA',
      'plano_industrial': 'Plano Industrial • Ilimitado',
      'instalar_pc': 'Instalar no PC',
      'novo_pedido': 'Novo Pedido',
      'salvar': 'Salvar',
      'cancelar': 'Cancelar',
      'excluir': 'Excluir',
      'editar': 'Editar',
      'imprimir': 'Imprimir',
      'exportar': 'Exportar',
      'pesquisar': 'Pesquisar...',
      'filtrar': 'Filtrar',
      'selecionar_idioma': 'Selecionar Idioma',
      'idioma_sistema': 'Idioma do Sistema',
      'trocar_idioma': 'Alterar Idioma'
    },
    'pt-PT': {
      // Sidebar
      'menu_abertura': 'Início',
      'menu_pedidos': 'Encomendas',
      'menu_os': 'OF / Fichas',
      'menu_nesting': 'Nesting DTF',
      'menu_estoque': 'Stock',
      'menu_produtos': 'Artigos',
      'menu_financeiro': 'Financeiro',
      'menu_compras': 'Compras',
      'menu_clientes': 'Clientes',
      'menu_quarentena': 'Quarentena',
      'menu_equipe': 'Equipa',
      'menu_nfe': 'Faturação',
      'menu_empresa': 'Minha Empresa',
      // Headers & Actions
      'minha_conta': 'A Minha Conta',
      'licenca_pro': 'LICENÇA PRO ATIVA',
      'plano_industrial': 'Plano Fabril • Ilimitado',
      'instalar_pc': 'Instalar no PC',
      'novo_pedido': 'Nova Encomenda',
      'salvar': 'Guardar',
      'cancelar': 'Cancelar',
      'excluir': 'Eliminar',
      'editar': 'Editar',
      'imprimir': 'Imprimir',
      'exportar': 'Exportar',
      'pesquisar': 'Procurar...',
      'filtrar': 'Filtrar',
      'selecionar_idioma': 'Selecionar Idioma',
      'idioma_sistema': 'Idioma do Sistema',
      'trocar_idioma': 'Alterar Idioma'
    },
    'es': {
      // Sidebar
      'menu_abertura': 'Inicio',
      'menu_pedidos': 'Pedidos',
      'menu_os': 'OT / Fichas',
      'menu_nesting': 'Nesting DTF',
      'menu_estoque': 'Stock',
      'menu_produtos': 'Productos',
      'menu_financeiro': 'Finanzas',
      'menu_compras': 'Compras',
      'menu_clientes': 'Clientes',
      'menu_quarentena': 'Cuarentena',
      'menu_equipe': 'Equipo',
      'menu_nfe': 'Facturación',
      'menu_empresa': 'Mi Empresa',
      // Headers & Actions
      'minha_conta': 'Mi Cuenta',
      'licenca_pro': 'LICENCIA PRO ACTIVA',
      'plano_industrial': 'Plan Industrial • Ilimitado',
      'instalar_pc': 'Instalar en PC',
      'novo_pedido': 'Nuevo Pedido',
      'salvar': 'Guardar',
      'cancelar': 'Cancelar',
      'excluir': 'Eliminar',
      'editar': 'Editar',
      'imprimir': 'Imprimir',
      'exportar': 'Exportar',
      'pesquisar': 'Buscar...',
      'filtrar': 'Filtrar',
      'selecionar_idioma': 'Seleccionar Idioma',
      'idioma_sistema': 'Idioma del Sistema',
      'trocar_idioma': 'Cambiar Idioma'
    },
    'en': {
      // Sidebar
      'menu_abertura': 'Dashboard',
      'menu_pedidos': 'Orders',
      'menu_os': 'Work Orders',
      'menu_nesting': 'DTF Nesting',
      'menu_estoque': 'Inventory',
      'menu_produtos': 'Products',
      'menu_financeiro': 'Finance',
      'menu_compras': 'Purchasing',
      'menu_clientes': 'Customers',
      'menu_quarentena': 'Hold Queue',
      'menu_equipe': 'Team',
      'menu_nfe': 'Invoicing',
      'menu_empresa': 'Company Settings',
      // Headers & Actions
      'minha_conta': 'My Account',
      'licenca_pro': 'PRO LICENSE ACTIVE',
      'plano_industrial': 'Industrial Plan • Unlimited',
      'instalar_pc': 'Install Desktop App',
      'novo_pedido': 'New Order',
      'salvar': 'Save',
      'cancelar': 'Cancel',
      'excluir': 'Delete',
      'editar': 'Edit',
      'imprimir': 'Print',
      'exportar': 'Export',
      'pesquisar': 'Search...',
      'filtrar': 'Filter',
      'selecionar_idioma': 'Select Language',
      'idioma_sistema': 'System Language',
      'trocar_idioma': 'Change Language'
    },
    'fr': {
      'menu_abertura': 'Tableau de bord',
      'menu_pedidos': 'Commandes',
      'menu_os': 'Ordres de fabrication',
      'menu_nesting': 'Imbrication DTF',
      'menu_estoque': 'Stocks',
      'menu_produtos': 'Articles',
      'menu_financeiro': 'Finances',
      'menu_compras': 'Achats',
      'menu_clientes': 'Clients',
      'menu_quarentena': 'Quarantaine',
      'menu_equipe': 'Équipe',
      'menu_nfe': 'Facturation',
      'menu_empresa': 'Mon Entreprise',
      'minha_conta': 'Mon Compte',
      'licenca_pro': 'LICENCE PRO ACTIVE',
      'plano_industrial': 'Plan Industriel • Illimité',
      'instalar_pc': 'Installer sur PC',
      'novo_pedido': 'Nouvelle Commande',
      'salvar': 'Enregistrer',
      'cancelar': 'Annuler',
      'excluir': 'Supprimer',
      'editar': 'Modifier',
      'imprimir': 'Imprimer',
      'exportar': 'Exporter',
      'pesquisar': 'Rechercher...',
      'filtrar': 'Filtrer',
      'selecionar_idioma': 'Choisir la Langue',
      'idioma_sistema': 'Langue du Système',
      'trocar_idioma': 'Changer de Langue'
    },
    'de': {
      'menu_abertura': 'Übersicht',
      'menu_pedidos': 'Aufträge',
      'menu_os': 'Fertigungsaufträge',
      'menu_nesting': 'DTF Schachtelung',
      'menu_estoque': 'Lagerbestand',
      'menu_produtos': 'Produkte',
      'menu_financeiro': 'Finanzen',
      'menu_compras': 'Einkauf',
      'menu_clientes': 'Kunden',
      'menu_quarentena': 'Quarantäne',
      'menu_equipe': 'Team',
      'menu_nfe': 'Rechnungen',
      'menu_empresa': 'Mein Unternehmen',
      'minha_conta': 'Mein Konto',
      'licenca_pro': 'PRO LIZENZ AKTIV',
      'plano_industrial': 'Industrie-Plan • Unbegrenzt',
      'instalar_pc': 'Auf PC installieren',
      'novo_pedido': 'Neuer Auftrag',
      'salvar': 'Speichern',
      'cancelar': 'Abbrechen',
      'excluir': 'Löschen',
      'editar': 'Bearbeiten',
      'imprimir': 'Drucken',
      'exportar': 'Exportieren',
      'pesquisar': 'Suchen...',
      'filtrar': 'Filtern',
      'selecionar_idioma': 'Sprache Wählen',
      'idioma_sistema': 'Systemsprache',
      'trocar_idioma': 'Sprache Ändern'
    },
    'it': {
      'menu_abertura': 'Pannello',
      'menu_pedidos': 'Ordini',
      'menu_os': 'Ordini di Lavoro',
      'menu_nesting': 'Nesting DTF',
      'menu_estoque': 'Magazzino',
      'menu_produtos': 'Prodotti',
      'menu_financeiro': 'Finanze',
      'menu_compras': 'Acquisti',
      'menu_clientes': 'Clienti',
      'menu_quarentena': 'Quarantena',
      'menu_equipe': 'Squadra',
      'menu_nfe': 'Fatturazione',
      'menu_empresa': 'La Mia Azienda',
      'minha_conta': 'Il Mio Account',
      'licenca_pro': 'LICENZA PRO ATTIVA',
      'plano_industrial': 'Piano Industriale • Illimitato',
      'instalar_pc': 'Installa su PC',
      'novo_pedido': 'Nuovo Ordine',
      'salvar': 'Salva',
      'cancelar': 'Annulla',
      'excluir': 'Elimina',
      'editar': 'Modifica',
      'imprimir': 'Stampa',
      'exportar': 'Esporta',
      'pesquisar': 'Cerca...',
      'filtrar': 'Filtra',
      'selecionar_idioma': 'Seleziona Lingua',
      'idioma_sistema': 'Lingua del Sistema',
      'trocar_idioma': 'Cambia Lingua'
    }
  };

  // 3. Estado Atual do Motor
  let idiomaAtual = 'pt-BR';

  // Detecção Inicial
  function detectarIdiomaInicial() {
    // 1. Salvo no localStorage
    const salvo = localStorage.getItem('bravvi_language');
    if (salvo && IDIOMAS_CATALOGO.some(i => i.code === salvo)) {
      return salvo;
    }

    // 2. Parâmetro na URL (?lang=pt ou ?lang=es)
    if (window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang) {
        const found = IDIOMAS_CATALOGO.find(i => i.code.toLowerCase() === urlLang.toLowerCase() || i.code.split('-')[0] === urlLang.toLowerCase());
        if (found) return found.code;
      }
    }

    // 3. Pathname da URL (/pt -> pt-PT, /py -> es)
    if (window.location && window.location.pathname) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/pt') || path.includes('vendas-pt')) return 'pt-PT';
      if (path.includes('/py') || path.includes('vendas-py') || path.includes('/paraguay')) return 'es';
    }

    // 4. Idioma do Navegador
    if (navigator && navigator.language) {
      const navLang = navigator.language;
      if (navLang.toLowerCase().startsWith('pt-pt')) return 'pt-PT';
      if (navLang.toLowerCase().startsWith('es')) return 'es';
      if (navLang.toLowerCase().startsWith('en')) return 'en';
    }

    return 'pt-BR';
  }

  idiomaAtual = detectarIdiomaInicial();

  // Obter Objeto de Configuração do Idioma Atual
  function obterIdiomaConfig(code = idiomaAtual) {
    return IDIOMAS_CATALOGO.find(i => i.code === code) || IDIOMAS_CATALOGO[0];
  }

  // Formatação de Moeda Internacional Conforme Idioma Selecionado
  function formatarMoeda(valor, code = idiomaAtual) {
    const config = obterIdiomaConfig(code);
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.moeda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor || 0);
    } catch (e) {
      return `${config.simbolo} ${(Number(valor) || 0).toFixed(2)}`;
    }
  }

  // Tradução de chave interna
  function t(chave) {
    const dict = DICIONARIOS[idiomaAtual] || DICIONARIOS['en'] || DICIONARIOS['pt-BR'];
    if (dict && dict[chave]) return dict[chave];
    if (DICIONARIOS['pt-BR'] && DICIONARIOS['pt-BR'][chave]) return DICIONARIOS['pt-BR'][chave];
    return chave;
  }

  // 4. Aplicação Dinâmica na Interface do ERP
  function aplicarIdiomaNaInterface() {
    const config = obterIdiomaConfig();

    // 1. Tag HTML
    document.documentElement.lang = config.code;
    if (config.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // 2. Atualizar Botão do Topo (Navbar) & Sidebar
    const btnText = document.getElementById('headerLangText');
    const btnFlag = document.getElementById('headerLangFlag');
    if (btnText) btnText.textContent = config.nome.split(' (')[0];
    if (btnFlag) btnFlag.textContent = config.flag;

    const sideText = document.getElementById('sidebarLangText');
    if (sideText) sideText.textContent = `${config.flag} ${config.nome.split(' (')[0]}`;

    const empDisplay = document.getElementById('empresaLangDisplay');
    if (empDisplay) empDisplay.textContent = `${config.flag} ${config.nome}`;

    // 3. Atualizar Sidebar Menu Itens
    const menuMapa = {
      'abertura': 'menu_abertura',
      'pedidos': 'menu_pedidos',
      'os': 'menu_os',
      'nesting': 'menu_nesting',
      'estoque': 'menu_estoque',
      'produtos': 'menu_produtos',
      'financeiro': 'menu_financeiro',
      'compras': 'menu_compras',
      'clientes': 'menu_clientes',
      'quarentena': 'menu_quarentena',
      'equipe': 'menu_equipe',
      'nfe': 'menu_nfe',
      'empresa': 'menu_empresa'
    };

    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      const aba = item.getAttribute('data-aba');
      if (aba && menuMapa[aba]) {
        const span = item.querySelector('span:not(.menu-badge)');
        if (span) {
          span.textContent = t(menuMapa[aba]);
        }
      }
    });

    // 4. Atualizar Labels Globais
    const authText = document.getElementById('btnHeaderAuthText');
    if (authText) authText.textContent = t('minha_conta');

    const btnInstall = document.querySelector('.btn-instalar-app-desktop span');
    if (btnInstall) btnInstall.textContent = `💻 ${t('instalar_pc')}`;

    const proBadge = document.querySelector('.sidebar-pro-badge div div:first-child');
    if (proBadge) proBadge.textContent = t('licenca_pro');

    const proSub = document.querySelector('.sidebar-pro-badge div div:last-child');
    if (proSub) proSub.textContent = t('plano_industrial');

    // 5. Injetar ou Acionar Tradutor Automático para todas as outras línguas
    acionarTradutorUniversal(config.code);

    // 6. Notificar Sistema
    window.dispatchEvent(new CustomEvent('bravvi:idiomaAlterado', { detail: { idioma: config } }));
  }

  // 5. Integração com Tradutor Universal em Tempo Real
  function acionarTradutorUniversal(langCode) {
    // Para idiomas principais com dicionário completo, manter renderização nativa de altíssima velocidade
    if (['pt-BR', 'pt-PT', 'es', 'en'].includes(langCode)) {
      removerWidgetTraducaoExterna();
      return;
    }

    // Para qualquer um dos outros 120+ idiomas do mundo, carrega o Google Translate dinamicamente
    carregarGoogleTranslateEngine(langCode);
  }

  function carregarGoogleTranslateEngine(targetLang) {
    const shortCode = targetLang.split('-')[0];

    // Configurar cookie do Google Translate
    document.cookie = `googtrans=/auto/${shortCode}; path=/;`;
    document.cookie = `googtrans=/auto/${shortCode}; domain=.${location.hostname}; path=/;`;

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=window.googleTranslateElementInit';
      document.body.appendChild(script);

      window.googleTranslateElementInit = function () {
        if (!document.getElementById('google_translate_element')) {
          const div = document.createElement('div');
          div.id = 'google_translate_element';
          div.style.display = 'none';
          document.body.appendChild(div);
        }
        new window.google.translate.TranslateElement({
          pageLanguage: 'pt',
          includedLanguages: IDIOMAS_CATALOGO.map(i => i.code.split('-')[0]).join(','),
          autoDisplay: false
        }, 'google_translate_element');
      };
    } else {
      // Disparar evento para mudar combo se já existir
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = shortCode;
        select.dispatchEvent(new Event('change'));
      }
    }
  }

  function removerWidgetTraducaoExterna() {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${location.hostname}; path=/;`;
    const frame = document.querySelector('.goog-te-banner-frame');
    if (frame) frame.style.display = 'none';
  }

  // 6. Modal Interativo de Seleção de Idioma (Com Filtro em Tempo Real)
  function abrirModalIdioma() {
    let modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    const populares = IDIOMAS_CATALOGO.filter(i => i.popular);
    const todos = IDIOMAS_CATALOGO;

    modal = document.createElement('div');
    modal.id = 'bravviLanguageModal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-sizing: border-box;
    `;

    modal.innerHTML = `
      <div style="background: #ffffff; width: 100%; max-width: 720px; max-height: 90vh; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #cbd5e1;">
        
        <!-- Header do Modal -->
        <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">🌐</span>
            <div>
              <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;">Selecione o Idioma do Sistema</h2>
              <div style="font-size: 12px; color: #64748b;">Select System Language • Elige tu idioma • Choisissez votre langue</div>
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: transparent; border: none; font-size: 20px; color: #64748b; cursor: pointer; padding: 4px 8px; border-radius: 6px;">✕</button>
        </div>

        <!-- Barra de Pesquisa Rápida -->
        <div style="padding: 14px 24px; background: #ffffff; border-bottom: 1px solid #f1f5f9;">
          <div style="position: relative;">
            <input type="text" id="inputSearchLanguage" placeholder="🔍 Digite para filtrar idiomas (ex: Español, English, Deutsch, Português, Guaraní, 日本語)..." style="width: 100%; padding: 10px 14px; font-size: 13.5px; border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; font-family: inherit;">
          </div>
        </div>

        <!-- Lista Rolável de Idiomas -->
        <div style="padding: 18px 24px; overflow-y: auto; flex: 1;">
          
          <!-- Seção de Mais Utilizados -->
          <div id="sectionPopulares">
            <div style="font-size: 11px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <span>⭐</span> Mais Populares & Mercados Oficiais
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 22px;">
              ${populares.map(item => renderizarCardIdioma(item)).join('')}
            </div>
          </div>

          <!-- Todos os Idiomas Globais -->
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>🌍</span> Todos os Idiomas Mundiais (${todos.length} idiomas disponíveis)
          </div>
          <div id="gridTodosIdiomas" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
            ${todos.map(item => renderizarCardIdioma(item)).join('')}
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

    // Eventos do Modal
    document.getElementById('btnCloseLangModal').onclick = () => modal.remove();
    document.getElementById('btnConfirmLangModal').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Filtro em tempo real
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

  // 7. Ação de Mudar o Idioma
  function selecionarIdioma(code) {
    if (!code) return;
    const encontrado = IDIOMAS_CATALOGO.find(i => i.code === code);
    if (!encontrado) return;

    idiomaAtual = encontrado.code;
    localStorage.setItem('bravvi_language', idiomaAtual);
    localStorage.setItem('bravvi_currency', encontrado.moeda);

    // Fechar modal
    const modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    // Aplicar na interface
    aplicarIdiomaNaInterface();

    // Re-renderizar tela atual se o ERP estiver carregado
    if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
      const aba = window.ERP.obterAbaAtiva();
      if (aba) window.ERP.navegarPara(aba);
    } else if (window.location && typeof window.location.reload === 'function') {
      // Recarrega suavemente se necessário
      if (!['pt-BR', 'pt-PT', 'es', 'en'].includes(idiomaAtual)) {
        setTimeout(() => window.location.reload(), 150);
      }
    }

    // Exibir Toast Informativo
    const msg = {
      'pt-BR': `Idioma alterado com sucesso para ${encontrado.nome}! Moeda: ${encontrado.simbolo}`,
      'pt-PT': `Idioma alterado com sucesso para ${encontrado.nome}! Moeda: ${encontrado.simbolo}`,
      'es': `¡Idioma cambiado con éxito a ${encontrado.nome}! Moneda: ${encontrado.simbolo}`,
      'en': `Language successfully changed to ${encontrado.nome}! Currency: ${encontrado.simbolo}`
    };

    const textoToast = msg[idiomaAtual] || `Language updated to ${encontrado.nome} (${encontrado.simbolo})`;
    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      window.ERP.mostrarToast(textoToast, 'sucesso');
    }
  }

  // Inicialização Automática quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarIdiomaNaInterface);
  } else {
    setTimeout(aplicarIdiomaNaInterface, 50);
  }

  // 8. Exportação Global da API i18n
  window.ERP_I18N = {
    t,
    idiomaAtual: () => idiomaAtual,
    obterIdiomaConfig,
    formatarMoeda,
    selecionarIdioma,
    abrirModalIdioma,
    aplicarIdiomaNaInterface,
    catalogo: IDIOMAS_CATALOGO
  };

})();
