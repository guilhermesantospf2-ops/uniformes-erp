/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR DE INTERNACIONALIZAÇÃO GLOBAL & DOM WALKER (i18n)
 * ============================================================================
 * Suporte a todos os idiomas do mundo (+120 idiomas) com:
 * 1. Dicionário nativo industrial de alta precisão para PT-PT, ES, EN, FR, DE, IT.
 * 2. Varredor recursivo de DOM (DOM Walker) que traduz toda a interface em tempo real.
 * 3. MutationObserver automático que intercepta e traduz novas telas e modais.
 * 4. Motor universal Google Translate para todos os demais 120+ idiomas do mundo.
 * 5. Formatação monetária dinâmica instantânea (R$, €, $, £, ¥, etc.).
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
    { code: 'cy', nome: 'Cymraeg (Welsh)', flag: '🇬🇧', moeda: 'GBP', simbolo: '£', locale: 'cy-GB' },
    { code: 'xh', nome: 'isiXhosa', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'xh-ZA' },
    { code: 'yi', nome: 'ייִדיש (Yiddish)', flag: '🌐', moeda: 'EUR', simbolo: '€', locale: 'yi', rtl: true },
    { code: 'zu', nome: 'isiZulu', flag: '🇿🇦', moeda: 'ZAR', simbolo: 'R', locale: 'zu-ZA' }
  ];

  // 2. Estado Ativo do Idioma
  let idiomaAtual = localStorage.getItem('bravvi_language') || 'pt-BR';
  let moedaAtual = localStorage.getItem('bravvi_currency') || 'BRL';

  // Helper para obter dados do idioma ativo
  function obterIdiomaConfig() {
    return IDIOMAS_CATALOGO.find(i => i.code === idiomaAtual) || IDIOMAS_CATALOGO[0];
  }

  // 3. Super Dicionário Lexical da Confecção & ERP Têxtil
  const DICIONARIOS_EXATOS = {
    'pt-PT': {
      'Abertura & Visão Geral da Fábrica': 'Ecrã Inicial & Visão Geral da Fábrica',
      'Gestão Comercial, Orçamentos & Pedidos': 'Gestão Comercial, Orçamentos & Encomendas',
      'Visão Geral de Pedidos': 'Visão Geral das Encomendas',
      'Ordens de Serviço & Fichas': 'Ordens de Fabrico & Fichas Técnicas',
      'Ordem de Produção': 'Ordem de Fabrico',
      'Ordens de Serviço': 'Ordens de Fabrico',
      'OS / Fichas': 'OF / Fichas',
      'Nesting DTF & Encaixe Automático': 'Nesting DTF & Encaixe Automático',
      'Controle de Estoque & Matéria-Prima': 'Gestão de Stock & Matérias-Primas',
      'Estoque': 'Stock',
      'Estoque de Matéria-Prima': 'Stock de Matérias-Primas',
      'Catálogo de Produtos & Modelagens': 'Catálogo de Artigos & Modelagens',
      'Produtos': 'Artigos',
      'Produto': 'Artigo',
      'Gestão Financeira & DRE Industrial': 'Gestão Financeira & Demonstração de Resultados',
      'Financeiro': 'Financeiro',
      'Compras & Cotação de Fornecedores': 'Compras & Cotação de Fornecedores',
      'Compras': 'Compras',
      'Carteira de Clientes & CRM': 'Gestão de Clientes & CRM',
      'Clientes': 'Clientes',
      'Controle de Qualidade & Quarentena': 'Controlo de Qualidade & Quarentena',
      'Quarentena': 'Quarentena',
      'Gestão de Equipe & Produção': 'Gestão de Equipa & Produtividade',
      'Equipe': 'Equipa',
      'Emissão de Notas Fiscais (NF-e / NFC-e)': 'Faturação & Documentos Fiscais',
      'Notas Fiscais': 'Faturas',
      'Fiscal': 'Faturação',
      'Configurações da Empresa': 'Definições da Empresa',
      'Minha Empresa': 'A Minha Empresa',
      'Minha Conta': 'A Minha Conta',
      'Novo Orçamento / Pedido': '+ Novo Orçamento / Encomenda',
      'Novo Pedido': '+ Nova Encomenda',
      'Cadastrar Primeiro Pedido / Orçamento': 'Criar Primeiro Orçamento / Encomenda',
      'Tabela Detalhada': 'Tabela Detalhada',
      'Kanban de Pedidos': 'Kanban de Encomendas',
      'Gerar Link do Cliente': 'Gerar Ligação para o Cliente',
      'Buscar cliente, número ou modelo...': 'Pesquisar cliente, número ou artigo...',
      'Buscar por cliente, pedido, artigo...': 'Pesquisar por cliente, encomenda, artigo...',
      'Todos os Status': 'Todos os Estados',
      'Apenas Ativos (Sem Cancelados)': 'Apenas Ativos (Sem Cancelados)',
      'Em Produção': 'Em Fabrico',
      'Em Quarentena': 'Em Quarentena',
      'Apenas Orçamento': 'Apenas Orçamento',
      'Finalizados': 'Concluídos',
      '🚫 Apenas Cancelados': '🚫 Apenas Cancelados',
      'Aguardando Produção': 'A Aguardar Fabrico',
      'Aguardando Corte': 'A Aguardar Corte',
      'Em Estamparia': 'Em Estamparia',
      'Em Costura': 'Em Costura',
      'Em Acabamento': 'Em Acabamento',
      '100% QUITADO': '100% LIQUIDADO',
      'PENDENTE': 'PENDENTE',
      'PARCIAL': 'PARCIAL',
      'Salvar Alterações': 'Guardar Alterações',
      'Salvar': 'Guardar',
      'Cancelar': 'Cancelar',
      'Fechar': 'Fechar',
      'Imprimir': 'Imprimir',
      'Exportar': 'Exportar',
      'Excluir': 'Eliminar',
      'Editar': 'Editar',
      'Detalhes': 'Detalhes',
      'Preço': 'Preço',
      'Quantidade': 'Quantidade',
      'Tamanho': 'Tamanho',
      'Total': 'Total',
      'Prazo': 'Prazo de Entrega',
      'Valor Total': 'Montante Total',
      'Faturamento': 'Faturação',
      'Lucro': 'Lucro',
      'Entregue': 'Entregue',
      'Celular / WhatsApp': 'Telemóvel / WhatsApp',
      'Telefone': 'Contacto Telefónico',
      'Endereço': 'Morada',
      'Bairro': 'Freguesia / Zona',
      'CEP': 'Código Postal',
      'Usuários': 'Utilizadores',
      'Usuário': 'Utilizador',
      'Sair do Sistema': 'Terminar Sessão'
    },
    'es': {
      'Abertura & Visão Geral da Fábrica': 'Inicio & Visión General de Fábrica',
      'Gestão Comercial, Orçamentos & Pedidos': 'Gestión Comercial, Presupuestos & Pedidos',
      'Visão Geral de Pedidos': 'Visión General de Pedidos',
      'Ordens de Serviço & Fichas': 'Órdenes de Trabajo & Fichas Técnicas',
      'Ordem de Produção': 'Orden de Producción',
      'Ordens de Serviço': 'Órdenes de Trabajo',
      'OS / Fichas': 'OT / Fichas',
      'Nesting DTF & Encaixe Automático': 'Nesting DTF & Encaje Automático',
      'Controle de Estoque & Matéria-Prima': 'Control de Inventario & Materia Prima',
      'Estoque': 'Inventario',
      'Estoque de Matéria-Prima': 'Inventario de Materia Prima',
      'Catálogo de Produtos & Modelagens': 'Catálogo de Productos & Patrones',
      'Produtos': 'Productos',
      'Produto': 'Producto',
      'Gestão Financeira & DRE Industrial': 'Gestión Financiera & Resultados',
      'Financeiro': 'Finanzas',
      'Compras & Cotação de Fornecedores': 'Compras & Cotización de Proveedores',
      'Compras': 'Compras',
      'Carteira de Clientes & CRM': 'Cartera de Clientes & CRM',
      'Clientes': 'Clientes',
      'Controle de Qualidade & Quarentena': 'Control de Calidad & Cuarentena',
      'Quarentena': 'Cuarentena',
      'Gestão de Equipe & Produção': 'Gestión de Equipo & Rendimiento',
      'Equipe': 'Equipo',
      'Emissão de Notas Fiscais (NF-e / NFC-e)': 'Facturación & Documentos Fiscales',
      'Notas Fiscais': 'Facturas',
      'Fiscal': 'Facturación',
      'Configurações da Empresa': 'Configuración de la Empresa',
      'Minha Empresa': 'Mi Empresa',
      'Minha Conta': 'Mi Cuenta',
      'Novo Orçamento / Pedido': '+ Nuevo Presupuesto / Pedido',
      'Novo Pedido': '+ Nuevo Pedido',
      'Cadastrar Primeiro Pedido / Orçamento': 'Registrar Primer Pedido / Presupuesto',
      'Tabela Detalhada': 'Tabla Detallada',
      'Kanban de Pedidos': 'Kanban de Pedidos',
      'Gerar Link do Cliente': 'Generar Enlace para el Cliente',
      'Buscar cliente, número ou modelo...': 'Buscar cliente, número o artículo...',
      'Buscar por cliente, pedido, artigo...': 'Buscar por cliente, pedido, artículo...',
      'Todos os Status': 'Todos los Estados',
      'Apenas Ativos (Sem Cancelados)': 'Solo Activos (Sin Cancelados)',
      'Em Produção': 'En Producción',
      'Em Quarentena': 'En Cuarentena',
      'Apenas Orçamento': 'Solo Presupuesto',
      'Finalizados': 'Completados',
      '🚫 Apenas Cancelados': '🚫 Solo Cancelados',
      'Aguardando Produção': 'Esperando Producción',
      'Aguardando Corte': 'Esperando Corte',
      'Em Estamparia': 'En Estampado',
      'Em Costura': 'En Costura',
      'Em Acabamento': 'En Acabado',
      '100% QUITADO': '100% PAGADO',
      'PENDENTE': 'PENDIENTE',
      'PARCIAL': 'PARCIAL',
      'Salvar Alterações': 'Guardar Cambios',
      'Salvar': 'Guardar',
      'Cancelar': 'Cancelar',
      'Fechar': 'Cerrar',
      'Imprimir': 'Imprimir',
      'Exportar': 'Exportar',
      'Excluir': 'Eliminar',
      'Editar': 'Editar',
      'Detalhes': 'Detalles',
      'Preço': 'Precio',
      'Quantidade': 'Cantidad',
      'Tamanho': 'Talla',
      'Tamanhos': 'Tallas',
      'Total': 'Total',
      'Prazo': 'Fecha de Entrega',
      'Valor Total': 'Importe Total',
      'Faturamento': 'Facturación',
      'Lucro': 'Ganancia',
      'Entregue': 'Entregado',
      'Celular / WhatsApp': 'Celular / WhatsApp',
      'Telefone': 'Teléfono de Contacto',
      'Endereço': 'Dirección',
      'Bairro': 'Barrio',
      'CEP': 'Código Postal',
      'Usuários': 'Usuarios',
      'Usuário': 'Usuario',
      'Sair do Sistema': 'Cerrar Sesión'
    },
    'en': {
      'Abertura & Visão Geral da Fábrica': 'Dashboard & Factory Overview',
      'Gestão Comercial, Orçamentos & Pedidos': 'Sales Management, Quotes & Orders',
      'Visão Geral de Pedidos': 'Orders Overview',
      'Ordens de Serviço & Fichas': 'Work Orders & Spec Sheets',
      'Ordem de Produção': 'Production Order',
      'Ordens de Serviço': 'Work Orders',
      'OS / Fichas': 'WO / Specs',
      'Nesting DTF & Encaixe Automático': 'DTF Auto Nesting & Layout Engine',
      'Controle de Estoque & Matéria-Prima': 'Inventory & Raw Materials Control',
      'Estoque': 'Inventory',
      'Estoque de Matéria-Prima': 'Raw Materials Stock',
      'Catálogo de Produtos & Modelagens': 'Product Catalog & Textile Patterns',
      'Produtos': 'Products',
      'Produto': 'Product',
      'Gestão Financeira & DRE Industrial': 'Financial Management & P&L Statement',
      'Financeiro': 'Financial',
      'Compras & Cotação de Fornecedores': 'Purchasing & Supplier Quotes',
      'Compras': 'Purchases',
      'Carteira de Clientes & CRM': 'Customer Portfolio & CRM',
      'Clientes': 'Customers',
      'Controle de Qualidade & Quarentena': 'Quality Control & Quarantine',
      'Quarentena': 'Quality Control',
      'Gestão de Equipe & Produção': 'Team Management & Productivity',
      'Equipe': 'Team',
      'Emissão de Notas Fiscais (NF-e / NFC-e)': 'Tax Invoices & Billing',
      'Notas Fiscais': 'Invoices',
      'Fiscal': 'Tax & Billing',
      'Configurações da Empresa': 'Company Settings',
      'Minha Empresa': 'My Company',
      'Minha Conta': 'My Account',
      'Novo Orçamento / Pedido': '+ New Quote / Order',
      'Novo Pedido': '+ New Order',
      'Cadastrar Primeiro Pedido / Orçamento': 'Create First Order / Quote',
      'Tabela Detalhada': 'Detailed Table',
      'Kanban de Pedidos': 'Orders Kanban',
      'Gerar Link do Cliente': 'Generate Customer Link',
      'Buscar cliente, número ou modelo...': 'Search customer, number or item...',
      'Buscar por cliente, pedido, artigo...': 'Search by customer, order, item...',
      'Todos os Status': 'All Statuses',
      'Apenas Ativos (Sem Cancelados)': 'Active Only (No Cancelled)',
      'Em Produção': 'In Production',
      'Em Quarentena': 'In Quarantine',
      'Apenas Orçamento': 'Quotes Only',
      'Finalizados': 'Completed',
      '🚫 Apenas Cancelados': '🚫 Cancelled Only',
      'Aguardando Produção': 'Awaiting Production',
      'Aguardando Corte': 'Awaiting Cut',
      'Em Estamparia': 'Screen Printing',
      'Em Costura': 'In Sewing',
      'Em Acabamento': 'In Finishing',
      '100% QUITADO': '100% PAID IN FULL',
      'PENDENTE': 'PENDING',
      'PARCIAL': 'PARTIAL',
      'Salvar Alterações': 'Save Changes',
      'Salvar': 'Save',
      'Cancelar': 'Cancel',
      'Fechar': 'Close',
      'Imprimir': 'Print',
      'Exportar': 'Export',
      'Excluir': 'Delete',
      'Editar': 'Edit',
      'Detalhes': 'Details',
      'Preço': 'Price',
      'Quantidade': 'Quantity',
      'Tamanho': 'Size',
      'Tamanhos': 'Sizes',
      'Total': 'Total',
      'Prazo': 'Deadline',
      'Valor Total': 'Total Amount',
      'Faturamento': 'Revenue',
      'Lucro': 'Profit',
      'Entregue': 'Delivered',
      'Celular / WhatsApp': 'Mobile / WhatsApp',
      'Telefone': 'Phone Number',
      'Endereço': 'Address',
      'Bairro': 'Neighborhood',
      'CEP': 'Zip Code',
      'Usuários': 'Users',
      'Usuário': 'User',
      'Sair do Sistema': 'Sign Out'
    },
    'fr': {
      'Abertura & Visão Geral da Fábrica': 'Tableau de Bord & Vue d\'Ensemble',
      'Gestão Comercial, Orçamentos & Pedidos': 'Gestion Commerciale, Devis & Commandes',
      'Visão Geral de Pedidos': 'Aperçu des Commandes',
      'Ordens de Serviço & Fichas': 'Ordres de Fabrication & Fiches Techniques',
      'Ordem de Produção': 'Ordre de Production',
      'Ordens de Serviço': 'Ordres de Travail',
      'OS / Fichas': 'OF / Fiches',
      'Controle de Estoque & Matéria-Prima': 'Gestion des Stocks & Matières Premières',
      'Estoque': 'Stock',
      'Produtos': 'Produits',
      'Produto': 'Produit',
      'Financeiro': 'Finances',
      'Compras': 'Achats',
      'Clientes': 'Clients',
      'Quarentena': 'Contrôle Qualité',
      'Equipe': 'Équipe',
      'Fiscal': 'Facturation',
      'Configurações da Empresa': 'Paramètres de l\'Entreprise',
      'Minha Empresa': 'Mon Entreprise',
      'Minha Conta': 'Mon Compte',
      'Novo Orçamento / Pedido': '+ Nouveau Devis / Commande',
      'Tabela Detalhada': 'Tableau Détaillé',
      'Kanban de Pedidos': 'Kanban des Commandes',
      'Salvar Alterações': 'Enregistrer les Modifications',
      'Salvar': 'Enregistrer',
      'Cancelar': 'Annuler',
      'Fechar': 'Fermer',
      'Imprimir': 'Imprimer',
      'Exportar': 'Exporter',
      'Excluir': 'Supprimer',
      'Editar': 'Modifier',
      'Em Produção': 'En Production',
      'Finalizados': 'Terminés',
      'Sair do Sistema': 'Déconnexion'
    },
    'de': {
      'Abertura & Visão Geral da Fábrica': 'Dashboard & Fabrikübersicht',
      'Gestão Comercial, Orçamentos & Pedidos': 'Vertriebsmanagement, Angebote & Aufträge',
      'Visão Geral de Pedidos': 'Auftragsübersicht',
      'Ordens de Serviço & Fichas': 'Fertigungsaufträge & Datenblätter',
      'Ordem de Produção': 'Produktionsauftrag',
      'Estoque': 'Lagerbestand',
      'Produtos': 'Produkte',
      'Financeiro': 'Finanzen',
      'Compras': 'Einkauf',
      'Clientes': 'Kunden',
      'Quarentena': 'Qualitätskontrolle',
      'Equipe': 'Team',
      'Fiscal': 'Steuern & Rechnungswesen',
      'Configurações da Empresa': 'Unternehmenseinstellungen',
      'Minha Empresa': 'Mein Unternehmen',
      'Minha Conta': 'Mein Konto',
      'Novo Orçamento / Pedido': '+ Neues Angebot / Auftrag',
      'Salvar Alterações': 'Änderungen Speichern',
      'Salvar': 'Speichern',
      'Cancelar': 'Abbrechen',
      'Fechar': 'Schließen',
      'Imprimir': 'Drucken',
      'Exportar': 'Exportieren',
      'Excluir': 'Löschen',
      'Editar': 'Bearbeiten',
      'Em Produção': 'In Produktion',
      'Finalizados': 'Abgeschlossen',
      'Sair do Sistema': 'Abmelden'
    },
    'it': {
      'Abertura & Visão Geral da Fábrica': 'Dashboard & Panoramica Fabbrica',
      'Gestão Comercial, Orçamentos & Pedidos': 'Gestione Commerciale, Preventivi & Ordini',
      'Visão Geral de Pedidos': 'Panoramica Ordini',
      'Ordens de Serviço & Fichas': 'Ordini di Lavoro & Schede Tecniche',
      'Ordem de Produção': 'Ordine di Produzione',
      'Estoque': 'Magazzino',
      'Produtos': 'Prodotti',
      'Financeiro': 'Finanze',
      'Compras': 'Acquisti',
      'Clientes': 'Clienti',
      'Quarentena': 'Controllo Qualità',
      'Equipe': 'Squadra',
      'Fiscal': 'Fatturazione',
      'Configurações da Empresa': 'Impostazioni Azienda',
      'Minha Empresa': 'La Mia Azienda',
      'Minha Conta': 'Il Mio Account',
      'Novo Orçamento / Pedido': '+ Nuovo Preventivo / Ordine',
      'Salvar Alterações': 'Salva Modifiche',
      'Salvar': 'Salva',
      'Cancelar': 'Annulla',
      'Fechar': 'Chiudi',
      'Imprimir': 'Stampa',
      'Exportar': 'Esporta',
      'Excluir': 'Elimina',
      'Editar': 'Modifica',
      'Em Produção': 'In Produzione',
      'Finalizados': 'Completati',
      'Sair do Sistema': 'Esci'
    }
  };

  // Sub-regras de substituição para termos frequentes soltos
  const SUBSTITUICOES_TERMOS = {
    'pt-PT': [
      [/\bPedidos\b/g, 'Encomendas'],
      [/\bPedido\b/g, 'Encomenda'],
      [/\bEstoque\b/g, 'Stock'],
      [/\bProdutos\b/g, 'Artigos'],
      [/\bProduto\b/g, 'Artigo'],
      [/\bEquipe\b/g, 'Equipa'],
      [/\bUsuários\b/g, 'Utilizadores'],
      [/\bUsuário\b/g, 'Utilizador'],
      [/\bConfigurações\b/g, 'Definições'],
      [/\bFaturamento\b/g, 'Faturação'],
      [/\bCelular\b/g, 'Telemóvel'],
      [/\bSalvar\b/g, 'Guardar'],
      [/\bBuscar\b/g, 'Pesquisar'],
      [/\bEm Produção\b/g, 'Em Fabrico'],
      [/R\$\s*/g, '€ ']
    ],
    'es': [
      [/\bNovo Orçamento\b/g, 'Nuevo Presupuesto'],
      [/\bNovo Pedido\b/g, 'Nuevo Pedido'],
      [/\bOrçamento\b/g, 'Presupuesto'],
      [/\bOrçamentos\b/g, 'Presupuestos'],
      [/\bEstoque\b/g, 'Inventario'],
      [/\bProdutos\b/g, 'Productos'],
      [/\bProduto\b/g, 'Producto'],
      [/\bFinanceiro\b/g, 'Finanzas'],
      [/\bEquipe\b/g, 'Equipo'],
      [/\bQuarentena\b/g, 'Cuarentena'],
      [/\bConfigurações\b/g, 'Configuración'],
      [/\bMinha Empresa\b/g, 'Mi Empresa'],
      [/\bMinha Conta\b/g, 'Mi Cuenta'],
      [/\bSalvar\b/g, 'Guardar'],
      [/\bCancelar\b/g, 'Cancelar'],
      [/\bFechar\b/g, 'Cerrar'],
      [/\bExcluir\b/g, 'Eliminar'],
      [/\bBuscar\b/g, 'Buscar'],
      [/\bDetalhes\b/g, 'Detalles'],
      [/\bEm Produção\b/g, 'En Producción'],
      [/\bFinalizado\b/g, 'Completado'],
      [/\bFinalizados\b/g, 'Completados'],
      [/\bAguardando\b/g, 'Esperando'],
      [/\bEntregue\b/g, 'Entregado'],
      [/\bPrazo\b/g, 'Plazo'],
      [/\bQuantidade\b/g, 'Cantidad'],
      [/\bPreço\b/g, 'Precio'],
      [/\bValor\b/g, 'Importe'],
      [/\bTamanho\b/g, 'Talla'],
      [/\bTamanhos\b/g, 'Tallas'],
      [/R\$\s*/g, '$ ']
    ],
    'en': [
      [/\bNovo Orçamento\b/g, 'New Quote'],
      [/\bNovo Pedido\b/g, 'New Order'],
      [/\bOrçamento\b/g, 'Quote'],
      [/\bOrçamentos\b/g, 'Quotes'],
      [/\bPedidos\b/g, 'Orders'],
      [/\bPedido\b/g, 'Order'],
      [/\bEstoque\b/g, 'Inventory'],
      [/\bProdutos\b/g, 'Products'],
      [/\bProduto\b/g, 'Product'],
      [/\bFinanceiro\b/g, 'Financial'],
      [/\bCompras\b/g, 'Purchases'],
      [/\bClientes\b/g, 'Customers'],
      [/\bCliente\b/g, 'Customer'],
      [/\bEquipe\b/g, 'Team'],
      [/\bQuarentena\b/g, 'Quality Control'],
      [/\bFiscal\b/g, 'Billing / Tax'],
      [/\bConfigurações\b/g, 'Settings'],
      [/\bMinha Empresa\b/g, 'My Company'],
      [/\bMinha Conta\b/g, 'My Account'],
      [/\bSalvar Alterações\b/g, 'Save Changes'],
      [/\bSalvar\b/g, 'Save'],
      [/\bCancelar\b/g, 'Cancel'],
      [/\bFechar\b/g, 'Close'],
      [/\bImprimir\b/g, 'Print'],
      [/\bExportar\b/g, 'Export'],
      [/\bExcluir\b/g, 'Delete'],
      [/\bEditar\b/g, 'Edit'],
      [/\bBuscar\b/g, 'Search'],
      [/\bDetalhes\b/g, 'Details'],
      [/\bEm Produção\b/g, 'In Production'],
      [/\bFinalizado\b/g, 'Completed'],
      [/\bFinalizados\b/g, 'Completed'],
      [/\bAguardando\b/g, 'Awaiting'],
      [/\bEntregue\b/g, 'Delivered'],
      [/\bPrazo\b/g, 'Deadline'],
      [/\bQuantidade\b/g, 'Quantity'],
      [/\bPreço\b/g, 'Price'],
      [/\bValor Total\b/g, 'Total Amount'],
      [/\bValor\b/g, 'Value'],
      [/\bTamanho\b/g, 'Size'],
      [/\bTamanhos\b/g, 'Sizes'],
      [/\bFaturamento\b/g, 'Revenue'],
      [/\bLucro\b/g, 'Profit'],
      [/\bTabela Detalhada\b/g, 'Detailed Table'],
      [/\bKanban de Pedidos\b/g, 'Orders Kanban'],
      [/\bSair do Sistema\b/g, 'Sign Out'],
      [/R\$\s*/g, '$ ']
    ],
    'fr': [
      [/\bPedidos\b/g, 'Commandes'],
      [/\bPedido\b/g, 'Commande'],
      [/\bEstoque\b/g, 'Stock'],
      [/\bProdutos\b/g, 'Produits'],
      [/\bClientes\b/g, 'Clients'],
      [/\bEquipe\b/g, 'Équipe'],
      [/\bSalvar\b/g, 'Enregistrer'],
      [/\bCancelar\b/g, 'Annuler'],
      [/\bFechar\b/g, 'Fermer'],
      [/R\$\s*/g, '€ ']
    ],
    'de': [
      [/\bPedidos\b/g, 'Aufträge'],
      [/\bPedido\b/g, 'Auftrag'],
      [/\bEstoque\b/g, 'Lagerbestand'],
      [/\bProdutos\b/g, 'Produkte'],
      [/\bClientes\b/g, 'Kunden'],
      [/\bEquipe\b/g, 'Team'],
      [/\bSalvar\b/g, 'Speichern'],
      [/\bCancelar\b/g, 'Abbrechen'],
      [/\bFechar\b/g, 'Schließen'],
      [/R\$\s*/g, '€ ']
    ],
    'it': [
      [/\bPedidos\b/g, 'Ordini'],
      [/\bPedido\b/g, 'Ordine'],
      [/\bEstoque\b/g, 'Magazzino'],
      [/\bProdutos\b/g, 'Prodotti'],
      [/\bClientes\b/g, 'Clienti'],
      [/\bEquipe\b/g, 'Squadra'],
      [/\bSalvar\b/g, 'Salva'],
      [/\bCancelar\b/g, 'Annulla'],
      [/\bFechar\b/g, 'Chiudi'],
      [/R\$\s*/g, '€ ']
    ]
  };

  // 4. Função Central de Tradução de Texto
  function traduzirTexto(textoBruto, targetLang) {
    if (!textoBruto || typeof textoBruto !== 'string') return textoBruto;
    if (targetLang === 'pt-BR') return textoBruto;

    const trimmed = textoBruto.trim();
    if (!trimmed || /^[0-9\s.,/\\-_:;()]+$/.test(trimmed)) {
      return textoBruto;
    }

    // A. Busca Exata no Dicionário
    const dict = DICIONARIOS_EXATOS[targetLang];
    if (dict && dict[trimmed]) {
      return textoBruto.replace(trimmed, dict[trimmed]);
    }

    // B. Substituição de Termos e Expressões
    let resultado = textoBruto;
    const regras = SUBSTITUICOES_TERMOS[targetLang];
    if (regras && regras.length) {
      for (let i = 0; i < regras.length; i++) {
        resultado = resultado.replace(regras[i][0], regras[i][1]);
      }
    }

    // C. Substituição de Moeda Genérica se aplicável
    const cfg = IDIOMAS_CATALOGO.find(i => i.code === targetLang);
    if (cfg && cfg.simbolo && cfg.simbolo !== 'R$') {
      resultado = resultado.replace(/R\$\s*/g, cfg.simbolo + ' ');
    }

    return resultado;
  }

  // 5. Varredor Recursivo de DOM (DOM Walker Ultra-Rápido)
  function traduzirElemento(raiz, targetLang) {
    if (!raiz || !raiz.nodeType) return;
    if (raiz.id === 'bravviLanguageModal') return;

    // Se raiz for text node
    if (raiz.nodeType === 3) {
      const raw = raiz.nodeValue;
      if (!raw || !raw.trim()) return;
      if (raiz.__origText === undefined) raiz.__origText = raw;
      raiz.nodeValue = (targetLang === 'pt-BR') ? raiz.__origText : traduzirTexto(raiz.__origText, targetLang);
      return;
    }

    // Se for elemento
    if (raiz.nodeType === 1) {
      const tag = raiz.tagName.toUpperCase();
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT'].includes(tag)) return;

      // Traduz Text Nodes filhos via TreeWalker
      const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null, false);
      let textNode;
      while ((textNode = walker.nextNode())) {
        const raw = textNode.nodeValue;
        if (!raw || !raw.trim()) continue;
        const parent = textNode.parentNode;
        if (parent && (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName) || parent.closest('#bravviLanguageModal'))) continue;

        if (textNode.__origText === undefined) textNode.__origText = raw;
        textNode.nodeValue = (targetLang === 'pt-BR') ? textNode.__origText : traduzirTexto(textNode.__origText, targetLang);
      }

      // Traduz Atributos Relevantes
      if (raiz.placeholder) {
        if (raiz.__origPlaceholder === undefined) raiz.__origPlaceholder = raiz.placeholder;
        raiz.placeholder = (targetLang === 'pt-BR') ? raiz.__origPlaceholder : traduzirTexto(raiz.__origPlaceholder, targetLang);
      }
      if (raiz.title) {
        if (raiz.__origTitle === undefined) raiz.__origTitle = raiz.title;
        raiz.title = (targetLang === 'pt-BR') ? raiz.__origTitle : traduzirTexto(raiz.__origTitle, targetLang);
      }

      // Sub-elementos de formulário dentro da raiz
      const inputs = raiz.querySelectorAll ? raiz.querySelectorAll('input[placeholder], textarea[placeholder], button[title], select') : [];
      inputs.forEach(el => {
        if (el.closest && el.closest('#bravviLanguageModal')) return;
        if (el.placeholder) {
          if (el.__origPlaceholder === undefined) el.__origPlaceholder = el.placeholder;
          el.placeholder = (targetLang === 'pt-BR') ? el.__origPlaceholder : traduzirTexto(el.__origPlaceholder, targetLang);
        }
        if (el.title) {
          if (el.__origTitle === undefined) el.__origTitle = el.title;
          el.title = (targetLang === 'pt-BR') ? el.__origTitle : traduzirTexto(el.__origTitle, targetLang);
        }
        if (el.tagName === 'SELECT') {
          Array.from(el.options).forEach(opt => {
            if (opt.__origText === undefined) opt.__origText = opt.text;
            opt.text = (targetLang === 'pt-BR') ? opt.__origText : traduzirTexto(opt.__origText, targetLang);
          });
        }
      });
    }
  }

  // 6. Tradução da Página Completa
  function traduzirPaginaCompleta() {
    const lang = idiomaAtual;
    const config = obterIdiomaConfig();

    // Tag HTML
    document.documentElement.lang = config.code;
    document.documentElement.dir = config.rtl ? 'rtl' : 'ltr';

    // 1. Navbar e Cabeçalho
    const headerLangText = document.getElementById('headerLangText');
    const headerLangFlag = document.getElementById('headerLangFlag');
    if (headerLangText) headerLangText.textContent = config.nome.split(' (')[0];
    if (headerLangFlag) headerLangFlag.textContent = config.flag;

    const sidebarLangText = document.getElementById('sidebarLangText');
    if (sidebarLangText) sidebarLangText.textContent = `${config.flag} ${config.nome.split(' (')[0]}`;

    const empDisplay = document.getElementById('empresaLangDisplay');
    if (empDisplay) empDisplay.textContent = `${config.flag} ${config.nome}`;

    // 2. Traduzir Navbar Completa
    const navbar = document.getElementById('top-navbar') || document.querySelector('.top-navbar');
    if (navbar) traduzirElemento(navbar, lang);

    // 3. Traduzir Barra Lateral (Sidebar)
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    if (sidebar) traduzirElemento(sidebar, lang);

    // 4. Traduzir Área Principal (Dashboard / Pedidos / Tabelas / Cards)
    const mainArea = document.getElementById('appMainContent') || document.querySelector('.main-content') || document.body;
    if (mainArea) traduzirElemento(mainArea, lang);

    // 5. Traduzir Modais Abertos
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) traduzirElemento(modalContainer, lang);

    // 6. Traduzir Título e Breadcrumb Superior
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      if (pageTitle.__origText === undefined) pageTitle.__origText = pageTitle.textContent;
      pageTitle.textContent = (lang === 'pt-BR') ? pageTitle.__origText : traduzirTexto(pageTitle.__origText, lang);
    }
    const pageBreadcrumb = document.getElementById('pageBreadcrumb');
    if (pageBreadcrumb) {
      if (pageBreadcrumb.__origText === undefined) pageBreadcrumb.__origText = pageBreadcrumb.textContent;
      pageBreadcrumb.textContent = (lang === 'pt-BR') ? pageBreadcrumb.__origText : traduzirTexto(pageBreadcrumb.__origText, lang);
    }

    // 7. Acionar Tradutor Automático para outros idiomas caso não nativo
    acionarMotorUniversal(config.code);
  }

  // 7. Observador de Mutações do DOM (Traduz Automaticamente Novas Telas Renderizadas)
  let mutacaoObserver = null;
  function iniciarObservadorMutacoes() {
    if (mutacaoObserver) return;
    const container = document.body;
    mutacaoObserver = new MutationObserver((mutations) => {
      if (idiomaAtual === 'pt-BR') return;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j];
          if (node.nodeType === 1 && !node.closest('#bravviLanguageModal')) {
            traduzirElemento(node, idiomaAtual);
          }
        }
      }
    });
    mutacaoObserver.observe(container, { childList: true, subtree: true });
  }

  // 8. Integração com Tradutor Universal em Tempo Real (Google Translate para 100+ idiomas)
  function acionarMotorUniversal(targetLang) {
    // Para idiomas com tradução nativa ultra-rápida, dispensamos dependência externa
    if (['pt-BR', 'pt-PT', 'es', 'es-ES', 'en', 'en-GB', 'fr', 'de', 'it'].includes(targetLang)) {
      removerCookiesTraducaoExterna();
      return;
    }

    // Para todos os outros 120+ idiomas do mundo, carrega o Google Translate
    carregarGoogleTranslateEngine(targetLang);
  }

  function carregarGoogleTranslateEngine(targetLang) {
    const shortCode = targetLang.split('-')[0];
    document.cookie = `googtrans=/pt/${shortCode}; path=/;`;
    try {
      document.cookie = `googtrans=/pt/${shortCode}; domain=.${location.hostname}; path=/;`;
    } catch(e) {}

    let elem = document.getElementById('google_translate_element');
    if (!elem) {
      elem = document.createElement('div');
      elem.id = 'google_translate_element';
      elem.style.display = 'none';
      document.body.appendChild(elem);
    }

    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement({
          pageLanguage: 'pt',
          autoDisplay: false
        }, 'google_translate_element');

        setTimeout(dispararComboGoogle, 300);
      };

      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=window.googleTranslateElementInit';
      document.body.appendChild(s);
    } else {
      dispararComboGoogle();
    }
  }

  function dispararComboGoogle() {
    const config = obterIdiomaConfig();
    const shortCode = config.code.split('-')[0];
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = shortCode;
      combo.dispatchEvent(new Event('change'));
    }
  }

  function removerCookiesTraducaoExterna() {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    try {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${location.hostname}; path=/;`;
    } catch(e) {}
    const frame = document.querySelector('.goog-te-banner-frame');
    if (frame) frame.style.display = 'none';
  }

  // 9. Formatação Monetária Internacional (Hooked em todo o ERP)
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

  // 10. Modal Interativo de Seleção de Idioma (Com Filtro em Tempo Real)
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
              Tradução integral de toda a interface e formatação de moeda automática
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px 8px; border-radius: 6px;">&times;</button>
        </div>

        <!-- Barra de Busca Instantânea -->
        <div style="padding: 14px 24px 8px 24px; background: #ffffff;">
          <div style="position: relative;">
            <input type="text" id="inputSearchLanguage" placeholder="🔍 Digite para pesquisar seu idioma ou país (ex: Portugal, Paraguay, English, Español)..." style="width: 100%; padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#cbd5e1'">
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

  // 11. Ação de Mudar o Idioma
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

    // Iniciar observador se ainda não estiver ativo
    iniciarObservadorMutacoes();

    // Re-renderizar tela atual no ERP se ativo
    if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
      const aba = window.ERP.obterAbaAtiva();
      if (aba) {
        window.ERP.navegarPara(aba);
      }
    }

    // Executar varredura completa da página imediatamente
    traduzirPaginaCompleta();
    setTimeout(traduzirPaginaCompleta, 150);
    setTimeout(traduzirPaginaCompleta, 600);

    // Notificar Sistema
    window.dispatchEvent(new CustomEvent('bravvi:idiomaAlterado', { detail: { idioma: encontrado } }));

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
  function inicializar() {
    iniciarObservadorMutacoes();
    traduzirPaginaCompleta();
    setTimeout(traduzirPaginaCompleta, 200);
    setTimeout(traduzirPaginaCompleta, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    setTimeout(inicializar, 50);
  }

  // 12. Exportação Global da API i18n
  window.ERP_I18N = {
    idiomaAtual: () => idiomaAtual,
    obterIdiomaConfig,
    formatarMoeda,
    selecionarIdioma,
    abrirModalIdioma,
    traduzirElemento,
    traduzirPaginaCompleta,
    traduzirTexto,
    catalogo: IDIOMAS_CATALOGO
  };

})();
