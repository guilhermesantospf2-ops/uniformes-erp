/**
 * BRAVVI ERP TÊXTIL - MOTOR DE LOCALIZAÇÃO NATIVO ENTERPRISE
 * 100% Offline-First. 0ms. Zero dependências externas.
 * Frases completas, formatação de moeda automática e preservação total de integridade.
 */
(function() {
  'use strict';

  const CATALOGO = [
  {
    "code": "pt-BR",
    "nome": "Português (Brasil)",
    "flag": "🇧🇷",
    "moeda": "BRL",
    "simbolo": "R$",
    "locale": "pt-BR",
    "popular": true
  },
  {
    "code": "pt-PT",
    "nome": "Português (Portugal)",
    "flag": "🇵🇹",
    "moeda": "EUR",
    "simbolo": "€",
    "locale": "pt-PT",
    "popular": true
  },
  {
    "code": "es",
    "nome": "Español",
    "flag": "🇪🇸",
    "moeda": "USD",
    "simbolo": "$",
    "locale": "es-ES",
    "popular": true
  },
  {
    "code": "en",
    "nome": "English (US)",
    "flag": "🇺🇸",
    "moeda": "USD",
    "simbolo": "$",
    "locale": "en-US",
    "popular": true
  },
  {
    "code": "fr",
    "nome": "Français",
    "flag": "🇫🇷",
    "moeda": "EUR",
    "simbolo": "€",
    "locale": "fr-FR",
    "popular": true
  },
  {
    "code": "de",
    "nome": "Deutsch",
    "flag": "🇩🇪",
    "moeda": "EUR",
    "simbolo": "€",
    "locale": "de-DE",
    "popular": true
  },
  {
    "code": "it",
    "nome": "Italiano",
    "flag": "🇮🇹",
    "moeda": "EUR",
    "simbolo": "€",
    "locale": "it-IT",
    "popular": true
  }
];

  const DICIONARIOS = {
  "en": {
    "abertura & visão geral da fábrica": "Dashboard & Factory Overview",
    "sistema > abertura": "SYSTEM > DASHBOARD",
    "minha conta": "My Account",
    "bravvi indústria têxtil": "Bravvi Apparel Industry",
    "bravvi uniformes": "Bravvi Uniforms",
    "faturamento em carteira": "Portfolio Revenue",
    "carga da fábrica (peças)": "Factory Load (Pieces)",
    "quarentena (aprovação)": "Quality Approval Hold",
    "margem média bruta": "Gross Profit Margin",
    "+14.2% vs. mês anterior": "+14.2% vs. previous month",
    "pronto para novas campanhas": "Ready for new campaigns",
    "oficina liberada para produção": "Workshop cleared for production",
    "aguardando checklist rigoroso": "Awaiting strict quality checklist",
    "nenhuma pendência técnica": "No technical issues pending",
    "acima da média industrial têxtil": "Above textile industry average",
    "calculada sobre novos pedidos": "Calculated on new orders",
    "radar de prazos:": "Deadline Radar:",
    "pedidos com prazo estourado": "Orders overdue",
    "pedidos que vencem hoje": "Orders due today",
    "pedidos que vencem amanhã": "Orders due tomorrow",
    "pedidos com prazo de 2 a 3 dias": "Orders due in 2-3 days",
    "pedidos com prazo de 4 a 7 dias": "Orders due in 4-7 days",
    "pedidos com prazo acima de 7 dias": "Orders due in > 7 days",
    "performance financeira semestral": "Semiannual Financial Performance",
    "performance financeira semestral (r$)": "Semiannual Financial Performance ($)",
    "entradas": "Income",
    "saídas": "Expenses",
    "saldo líquido": "Net Balance",
    "valores em milhares": "Values in Thousands",
    "editar gráfico": "Edit Chart",
    "capacidade de produção por setor": "Production Capacity by Department",
    "oficina em ritmo normal": "Workshop at Normal Pace",
    "editar capacidades": "Edit Capacities",
    "mesa de corte": "Cutting Table",
    "bordado computadorizado": "Computerized Embroidery",
    "estamparia & silk/dtf": "Screen Printing & DTF",
    "linha de costura & fechamento": "Sewing & Assembly Line",
    "últimos pedidos & mockups têxteis 3x4": "Recent Orders & 3x4 Textile Mockups",
    "ir para todos os pedidos": "Go to All Orders",
    "ações & status": "Actions & Status",
    "abertura": "Dashboard",
    "pedidos": "Orders",
    "os / fichas": "Work Orders / Specs",
    "nesting": "DTF Nesting",
    "nesting dtf": "DTF Nesting",
    "estoque": "Inventory",
    "produtos": "Products",
    "financeiro": "Financial",
    "compras": "Purchasing",
    "clientes": "Customers",
    "quarentena": "Quality Control",
    "equipe": "Team",
    "notas fiscais": "Invoices",
    "minha empresa": "My Company",
    "planos & upgrade": "Plans & Upgrade",
    "modo demonstração": "Demo Mode",
    "aproveite para testar todos os recursos na sua confecção.": "Test all features in your apparel factory.",
    "fazer upgrade / planos →": "Upgrade / Plans →",
    "menu": "Menu",
    "administrador": "Administrator",
    "👑 dono / gerente": "👑 Owner / Manager",
    "gestão comercial, orçamentos & pedidos": "Commercial Management, Quotes & Orders",
    "sistema > pedidos & orçamentos": "SYSTEM > ORDERS & QUOTES",
    "buscar cliente, número ou modelo...": "Search customer, order # or style...",
    "todos os status": "All Statuses",
    "apenas ativos (sem cancelados)": "Active Only (No Cancelled)",
    "em produção": "In Production",
    "em quarentena": "In Quarantine",
    "apenas orçamento": "Quotes Only",
    "finalizados": "Completed",
    "🚫 apenas cancelados": "🚫 Cancelled Only",
    "visualização:": "View:",
    "tabela": "Table",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ New Order / Quote",
    "nº pedido": "Order #",
    "cliente": "Customer",
    "data": "Date",
    "peças": "Pieces",
    "valor total": "Total Value",
    "status": "Status",
    "ações": "Actions",
    "ver detalhes": "View Details",
    "imprimir ficha a4": "Print A4 Sheet",
    "ficha técnica": "Tech Pack",
    "cancelar pedido": "Cancel Order",
    "estoque de malhas, tecidos & aviamentos": "Fabrics & Trims Inventory",
    "sistema > estoque de matéria-prima": "SYSTEM > RAW MATERIALS INVENTORY",
    "itens no catálogo": "Catalog Items",
    "patrimônio físico": "Physical Assets",
    "nível crítico de estoque (compra)": "Critical Stock Level (Reorder)",
    "perdas registradas": "Recorded Scrap",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Fabrics, trims and DTF ready for use",
    "valorizado pelo custo médio ponderado": "Valued at weighted average cost",
    "todos os saldos saudáveis": "All stock balances healthy",
    "corte, op, amostras e descarte": "Cutting, WO, samples and scrap",
    "saldos & insumos": "Balances & Supplies",
    "histórico de movimentações": "Transaction History",
    "+ cadastrar entrada": "+ Stock In",
    "- dar baixa no estoque": "- Stock Out",
    "código": "Code",
    "descrição do material / entrada": "Material Description / Entry",
    "categoria": "Category",
    "unidade": "Unit",
    "saldo físico": "Physical Balance",
    "estoque mínimo": "Min Stock",
    "custo unitário": "Unit Cost",
    "buscar por código ou descrição...": "Search by code or description...",
    "todas as categorias": "All Categories",
    "controle financeiro & fluxo de caixa": "Financial Control & Cash Flow",
    "sistema > financeiro": "SYSTEM > FINANCIAL",
    "contas a receber": "Accounts Receivable",
    "contas a pagar": "Accounts Payable",
    "fluxo de caixa diário": "Daily Cash Flow",
    "+ nova receita": "+ New Revenue",
    "+ nova despesa": "+ New Expense",
    "descrição": "Description",
    "vencimento": "Due Date",
    "valor": "Amount",
    "forma de pagamento": "Payment Method",
    "carteira de clientes & crm": "Customer Portfolio & CRM",
    "sistema > clientes": "SYSTEM > CUSTOMERS",
    "+ cadastrar novo cliente": "+ Register New Customer",
    "razão social / nome": "Company Name / Customer",
    "cnpj / cpf": "Tax ID / SSN",
    "cidade/uf": "City / State",
    "whatsapp / telefone": "WhatsApp / Phone",
    "total comprado": "Total Purchased",
    "último pedido": "Last Order",
    "quarentena técnica & aprovação": "Technical Quality Hold & Approval",
    "sistema > quarentena": "SYSTEM > QUALITY HOLD",
    "pedidos bloqueados aguardando conferência": "Blocked orders awaiting verification",
    "liberar para produção": "Release to Production",
    "rejeitar / solicitar correção": "Reject / Request Revision",
    "ordens de serviço & fichas técnicas": "Work Orders & Tech Sheets",
    "sistema > ordens de serviço": "SYSTEM > WORK ORDERS",
    "gerar fichas em lote": "Batch Generate Sheets",
    "salvar alterações": "Save Changes",
    "salvar": "Save",
    "cancelar": "Cancel",
    "fechar": "Close",
    "confirmar": "Confirm",
    "editar": "Edit",
    "excluir": "Delete",
    "voltar": "Back",
    "imprimir": "Print",
    "gerar pdf": "Generate PDF",
    "sucesso": "Success",
    "erro": "Error",
    "atenção": "Warning",
    "carregando...": "Loading...",
    "novo pedido": "+ New Order",
    "novo pedido / orçamento": "+ New Order / Quote",
    "orçamento": "Quote",
    "orçamentos": "Quotes",
    "finalizado": "Completed",
    "cancelado": "Cancelled",
    "ver pedido": "View Order",
    "editar pedido": "Edit Order",
    "imprimir ordem de corte": "Print Cutting Order",
    "enviar no whatsapp": "Send on WhatsApp",
    "aprovar quarentena": "Approve Quarantine",
    "liberar produção": "Release to Production",
    "grade de tamanhos": "Size Breakdown",
    "consumo dtf": "DTF Consumption",
    "consumo de tecido": "Fabric Consumption",
    "custo total": "Total Cost",
    "preço sugerido": "Suggested Price",
    "margem real": "Actual Margin",
    "lucro bruto": "Gross Profit",
    "sinal financeiro": "Financial Deposit",
    "sinal de 50%": "50% Down Payment",
    "chave pix": "PIX Key / Transfer Key",
    "comprovante": "Receipt",
    "gerar proposta": "Generate Proposal",
    "enviar proposta": "Send Proposal",
    "detalhes do pedido": "Order Details",
    "modelo": "Style / Model",
    "cor": "Color",
    "tecido": "Fabric",
    "quantidade": "Quantity",
    "subtotal": "Subtotal",
    "desconto": "Discount",
    "total": "Total",
    "observações": "Notes",
    "entrada de material": "Stock In",
    "baixa de estoque": "Stock Out",
    "ajuste de saldo": "Balance Adjustment",
    "custo médio": "Average Cost",
    "metragem": "Meters",
    "rolos": "Rolls",
    "aviamentos": "Trims & Accessories",
    "tecido / malha": "Fabric / Knit",
    "dtf têxtil": "Textile DTF",
    "adicionar material": "+ Add Material",
    "histórico": "History",
    "estoque atual": "Current Stock",
    "estoque crítico": "Critical Stock",
    "alerta de compra": "Purchase Alert",
    "fornecedor": "Supplier",
    "nota de entrada": "Inbound Invoice",
    "fluxo de caixa": "Cash Flow",
    "adicionar receita": "+ Add Revenue",
    "adicionar despesa": "+ Add Expense",
    "pago": "Paid",
    "pendente": "Pending",
    "vencido": "Overdue",
    "hoje": "Today",
    "mês atual": "Current Month",
    "demonstrativo": "Financial Statement",
    "saldo atual": "Current Balance",
    "pix": "Bank Transfer / PIX",
    "boleto": "Bank Slip",
    "cartão": "Credit Card",
    "dinheiro": "Cash",
    "transferência": "Wire Transfer",
    "categoria financeira": "Financial Category",
    "novo cliente": "+ New Customer",
    "nome / razão social": "Customer Name / Company",
    "telefone / celular": "Phone / Mobile",
    "cidade": "City",
    "estado": "State",
    "endereço": "Address",
    "histórico de compras": "Purchase History",
    "cadastrar": "Register",
    "editar cliente": "Edit Customer",
    "novo colaborador": "+ New Team Member",
    "nome": "Name",
    "função": "Role",
    "nível de acesso": "Access Level",
    "ativo": "Active",
    "inativo": "Inactive",
    "dono / gerente": "Owner / Manager",
    "cortador": "Cutter",
    "impressor dtf": "DTF Printer Operator",
    "costureira": "Seamstress",
    "conferente": "Inspector / Packer",
    "ficha de corte": "Cutting Sheet",
    "ficha de estamparia": "Printing Sheet",
    "ficha de costura": "Sewing Sheet",
    "ficha de embalagem": "Packaging Sheet",
    "assinatura do responsável": "Sign-off Signature",
    "observações de produção": "Production Notes",
    "data de entrega": "Delivery Date",
    "data de entrada": "Entry Date"
  },
  "es": {
    "abertura & visão geral da fábrica": "Inicio & Visión General de la Fábrica",
    "sistema > abertura": "SISTEMA > INICIO",
    "minha conta": "Mi Cuenta",
    "bravvi indústria têxtil": "Bravvi Industria Textil",
    "bravvi uniformes": "Bravvi Uniformes",
    "faturamento em carteira": "Facturación en Cartera",
    "carga da fábrica (peças)": "Carga de Fábrica (Piezas)",
    "quarentena (aprovação)": "Control de Calidad (Aprobación)",
    "margem média bruta": "Margen Bruto Promedio",
    "+14.2% vs. mês anterior": "+14.2% vs. mes anterior",
    "pronto para novas campanhas": "Listo para nuevas campañas",
    "oficina liberada para produção": "Taller liberado para producción",
    "aguardando checklist rigoroso": "Esperando checklist riguroso",
    "nenhuma pendência técnica": "Sin pendientes técnicos",
    "acima da média industrial têxtil": "Por encima del promedio industrial textil",
    "calculada sobre novos pedidos": "Calculada sobre nuevos pedidos",
    "radar de prazos:": "Radar de Plazos:",
    "pedidos com prazo estourado": "Pedidos con plazo vencido",
    "pedidos que vencem hoje": "Pedidos que vencen hoy",
    "pedidos que vencem amanhã": "Pedidos que vencen mañana",
    "pedidos com prazo de 2 a 3 dias": "Pedidos con plazo de 2 a 3 días",
    "pedidos com prazo de 4 a 7 dias": "Pedidos con plazo de 4 a 7 días",
    "pedidos com prazo acima de 7 dias": "Pedidos con plazo superior a 7 días",
    "performance financeira semestral": "Rendimiento Financiero Semestral",
    "performance financeira semestral (r$)": "Rendimiento Financiero Semestral ($)",
    "entradas": "Ingresos",
    "saídas": "Egresos",
    "saldo líquido": "Saldo Neto",
    "valores em milhares": "Valores en Miles",
    "editar gráfico": "Editar Gráfico",
    "capacidade de produção por setor": "Capacidad de Producción por Sector",
    "oficina em ritmo normal": "Taller en Ritmo Normal",
    "editar capacidades": "Editar Capacidades",
    "mesa de corte": "Mesa de Corte",
    "bordado computadorizado": "Bordado Computarizado",
    "estamparia & silk/dtf": "Estampado & Silk/DTF",
    "linha de costura & fechamento": "Línea de Costura & Ensamble",
    "últimos pedidos & mockups têxteis 3x4": "Últimos Pedidos y Mockups Textiles 3x4",
    "ir para todos os pedidos": "Ir a Todos los Pedidos",
    "ações & status": "Acciones y Estado",
    "abertura": "Inicio",
    "pedidos": "Pedidos",
    "os / fichas": "OT / Fichas",
    "nesting": "Nesting DTF",
    "nesting dtf": "Nesting DTF",
    "estoque": "Inventario",
    "produtos": "Productos",
    "financeiro": "Finanzas",
    "compras": "Compras",
    "clientes": "Clientes",
    "quarentena": "Control de Calidad",
    "equipe": "Equipo",
    "notas fiscais": "Facturación",
    "minha empresa": "Mi Empresa",
    "planos & upgrade": "Planes & Upgrade",
    "modo demonstração": "Modo Demostración",
    "aproveite para testar todos os recursos na sua confecção.": "Aproveche para probar todas las funciones en su taller textil.",
    "fazer upgrade / planos →": "Mejorar / Planes →",
    "menu": "Menú",
    "administrador": "Administrador",
    "👑 dono / gerente": "👑 Dueño / Gerente",
    "gestão comercial, orçamentos & pedidos": "Gestión Comercial, Presupuestos & Pedidos",
    "sistema > pedidos & orçamentos": "SISTEMA > PEDIDOS & PRESUPUESTOS",
    "buscar cliente, número ou modelo...": "Buscar cliente, número o modelo...",
    "todos os status": "Todos los Estados",
    "apenas ativos (sem cancelados)": "Solo Activos (Sin Cancelados)",
    "em produção": "En Producción",
    "em quarentena": "En Cuarentena",
    "apenas orçamento": "Solo Presupuestos",
    "finalizados": "Completados",
    "🚫 apenas cancelados": "🚫 Solo Cancelados",
    "visualização:": "Vista:",
    "tabela": "Tabla",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ Nuevo Pedido / Presupuesto",
    "nº pedido": "Nº Pedido",
    "cliente": "Cliente",
    "data": "Fecha",
    "peças": "Piezas",
    "valor total": "Valor Total",
    "status": "Estado",
    "ações": "Acciones",
    "ver detalhes": "Ver Detalles",
    "imprimir ficha a4": "Imprimir Ficha A4",
    "ficha técnica": "Ficha Técnica",
    "cancelar pedido": "Cancelar Pedido",
    "estoque de malhas, tecidos & aviamentos": "Inventario de Tejidos, Telas & Suministros",
    "sistema > estoque de matéria-prima": "SISTEMA > INVENTARIO DE MATERIA PRIMA",
    "itens no catálogo": "Suministros en el Catálogo",
    "patrimônio físico": "Activos Físicos",
    "nível crítico de estoque (compra)": "Nivel Crítico de Inventario (Compra)",
    "perdas registradas": "Pérdidas Registradas",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Tejidos, telas, adornos y DTF listos para usar",
    "valorizado pelo custo médio ponderado": "Valorado por costo promedio ponderado",
    "todos os saldos saudáveis": "Todos los saldos saludables",
    "corte, op, amostras e descarte": "Corte, OT, muestras y descarte",
    "saldos & insumos": "Saldos y Suministros",
    "histórico de movimentações": "Historial de Transacciones",
    "+ cadastrar entrada": "+ Registrar Entrada",
    "- dar baixa no estoque": "- Reducir Inventario",
    "código": "Código",
    "descrição do material / entrada": "Descripción del Material / Entrada",
    "categoria": "Categoría",
    "unidade": "Unidad",
    "saldo físico": "Saldo Físico",
    "estoque mínimo": "Stock Mínimo",
    "custo unitário": "Costo Unitario",
    "buscar por código ou descrição...": "Buscar por código o descripción...",
    "todas as categorias": "Todas las Categorías",
    "controle financeiro & fluxo de caixa": "Control Financiero & Flujo de Caja",
    "sistema > financeiro": "SISTEMA > FINANZAS",
    "contas a receber": "Cuentas por Cobrar",
    "contas a pagar": "Cuentas por Pagar",
    "fluxo de caixa diário": "Flujo de Caja Diario",
    "+ nova receita": "+ Nuevo Ingreso",
    "+ nova despesa": "+ Nuevo Egreso",
    "descrição": "Descripción",
    "vencimento": "Vencimiento",
    "valor": "Monto",
    "forma de pagamento": "Método de Pago",
    "carteira de clientes & crm": "Cartera de Clientes & CRM",
    "sistema > clientes": "SISTEMA > CLIENTES",
    "+ cadastrar novo cliente": "+ Registrar Nuevo Cliente",
    "razão social / nome": "Razón Social / Nombre",
    "cnpj / cpf": "RUC / DNI",
    "cidade/uf": "Ciudad / Estado",
    "whatsapp / telefone": "WhatsApp / Teléfono",
    "total comprado": "Total Comprado",
    "último pedido": "Último Pedido",
    "quarentena técnica & aprovação": "Control de Calidad Técnico & Aprobación",
    "sistema > quarentena": "SISTEMA > CONTROL DE CALIDAD",
    "pedidos bloqueados aguardando conferência": "Pedidos bloqueados esperando verificación",
    "liberar para produção": "Liberar para Producción",
    "rejeitar / solicitar correção": "Rechazar / Solicitar Corrección",
    "ordens de serviço & fichas técnicas": "Órdenes de Trabajo & Fichas Técnicas",
    "sistema > ordens de serviço": "SISTEMA > ÓRDENES DE TRABAJO",
    "gerar fichas em lote": "Generar Fichas por Lote",
    "salvar alterações": "Guardar Cambios",
    "salvar": "Guardar",
    "cancelar": "Cancelar",
    "fechar": "Cerrar",
    "confirmar": "Confirmar",
    "editar": "Editar",
    "excluir": "Eliminar",
    "voltar": "Volver",
    "imprimir": "Imprimir",
    "gerar pdf": "Generar PDF",
    "sucesso": "Éxito",
    "erro": "Error",
    "atenção": "Atención",
    "carregando...": "Cargando...",
    "novo pedido": "+ Nuevo Pedido",
    "novo pedido / orçamento": "+ Nuevo Pedido / Presupuesto",
    "orçamento": "Presupuesto",
    "orçamentos": "Presupuestos",
    "finalizado": "Completado",
    "cancelado": "Cancelado",
    "ver pedido": "Ver Pedido",
    "editar pedido": "Editar Pedido",
    "imprimir ordem de corte": "Imprimir Orden de Corte",
    "enviar no whatsapp": "Enviar por WhatsApp",
    "aprovar quarentena": "Aprobar Control de Calidad",
    "liberar produção": "Liberar a Producción",
    "grade de tamanhos": "Curva de Talles",
    "consumo dtf": "Consumo DTF",
    "consumo de tecido": "Consumo de Tela",
    "custo total": "Costo Total",
    "preço sugerido": "Precio Sugerido",
    "margem real": "Margen Real",
    "lucro bruto": "Ganancia Bruta",
    "sinal financeiro": "Anticipo",
    "sinal de 50%": "Anticipo del 50%",
    "chave pix": "Clave de Transferencia / PIX",
    "comprovante": "Comprobante",
    "gerar proposta": "Generar Cotización",
    "enviar proposta": "Enviar Cotización",
    "detalhes do pedido": "Detalles del Pedido",
    "modelo": "Modelo / Prenda",
    "cor": "Color",
    "tecido": "Tela",
    "quantidade": "Cantidad",
    "subtotal": "Subtotal",
    "desconto": "Descuento",
    "total": "Total",
    "observações": "Observaciones",
    "entrada de material": "Entrada de Material",
    "baixa de estoque": "Baja de Inventario",
    "ajuste de saldo": "Ajuste de Saldo",
    "custo médio": "Costo Promedio",
    "metragem": "Metraje",
    "rolos": "Rollos",
    "aviamentos": "Insumos & Avíos",
    "tecido / malha": "Tela / Tejido",
    "dtf têxtil": "DTF Textil",
    "adicionar material": "+ Agregar Material",
    "histórico": "Historial",
    "estoque atual": "Inventario Actual",
    "estoque crítico": "Stock Crítico",
    "alerta de compra": "Alerta de Compra",
    "fornecedor": "Proveedor",
    "nota de entrada": "Factura de Compra",
    "fluxo de caixa": "Flujo de Caja",
    "adicionar receita": "+ Nuevo Ingreso",
    "adicionar despesa": "+ Nuevo Egreso",
    "pago": "Pagado",
    "pendente": "Pendiente",
    "vencido": "Vencido",
    "hoje": "Hoy",
    "mês atual": "Mes Actual",
    "demonstrativo": "Estado de Resultados",
    "saldo atual": "Saldo Actual",
    "pix": "Transferencia / PIX",
    "boleto": "Boleto Bancario",
    "cartão": "Tarjeta",
    "dinheiro": "Efectivo",
    "transferência": "Transferencia",
    "categoria financeira": "Categoría Financiera",
    "novo cliente": "+ Nuevo Cliente",
    "nome / razão social": "Nombre / Razón Social",
    "telefone / celular": "Teléfono / Celular",
    "cidade": "Ciudad",
    "estado": "Estado / Dpto.",
    "endereço": "Dirección",
    "histórico de compras": "Historial de Compras",
    "cadastrar": "Registrar",
    "editar cliente": "Editar Cliente",
    "novo colaborador": "+ Nuevo Colaborador",
    "nome": "Nombre",
    "função": "Cargo",
    "nível de acesso": "Nivel de Acceso",
    "ativo": "Activo",
    "inativo": "Inactivo",
    "dono / gerente": "Dueño / Gerente",
    "cortador": "Cortador",
    "impressor dtf": "Operador DTF",
    "costureira": "Costurera",
    "conferente": "Control de Calidad / Empaque",
    "ficha de corte": "Ficha de Corte",
    "ficha de estamparia": "Ficha de Estampado",
    "ficha de costura": "Ficha de Costura",
    "ficha de embalagem": "Ficha de Empaque",
    "assinatura do responsável": "Firma del Responsable",
    "observações de produção": "Notas de Producción",
    "data de entrega": "Fecha de Entrega",
    "data de entrada": "Fecha de Entrada"
  },
  "pt-PT": {
    "abertura & visão geral da fábrica": "Abertura & Visão Geral da Fábrica",
    "sistema > abertura": "SISTEMA > ABERTURA",
    "minha conta": "A Minha Conta",
    "bravvi indústria têxtil": "Bravvi Indústria Têxtil",
    "bravvi uniformes": "Bravvi Fardamentos",
    "faturamento em carteira": "Facturação em Carteira",
    "carga da fábrica (peças)": "Carga da Fábrica (Peças)",
    "quarentena (aprovação)": "Quarentena (Aprovação Técnica)",
    "margem média bruta": "Margem Média Bruta",
    "+14.2% vs. mês anterior": "+14.2% vs. mês anterior",
    "pronto para novas campanhas": "Pronto para novas campanhas",
    "oficina liberada para produção": "Oficina liberada para produção",
    "aguardando checklist rigoroso": "A aguardar checklist rigoroso",
    "nenhuma pendência técnica": "Nenhuma pendência técnica",
    "acima da média industrial têxtil": "Acima da média industrial têxtil",
    "calculada sobre novos pedidos": "Calculada sobre novas encomendas",
    "radar de prazos:": "Radar de Prazos:",
    "pedidos com prazo estourado": "Encomendas com prazo estourado",
    "pedidos que vencem hoje": "Encomendas que vencem hoje",
    "pedidos que vencem amanhã": "Encomendas que vencem amanhã",
    "pedidos com prazo de 2 a 3 dias": "Encomendas com prazo de 2 a 3 dias",
    "pedidos com prazo de 4 a 7 dias": "Encomendas com prazo de 4 a 7 dias",
    "pedidos com prazo acima de 7 dias": "Encomendas com prazo superior a 7 dias",
    "performance financeira semestral": "Performance Financeira Semestral",
    "performance financeira semestral (r$)": "Performance Financeira Semestral (€)",
    "entradas": "Entradas",
    "saídas": "Saídas",
    "saldo líquido": "Saldo Líquido",
    "valores em milhares": "Valores em Milhares",
    "editar gráfico": "Editar Gráfico",
    "capacidade de produção por setor": "Capacidade de Produção por Sector",
    "oficina em ritmo normal": "Oficina em Ritmo Normal",
    "editar capacidades": "Editar Capacidades",
    "mesa de corte": "Mesa de Corte",
    "bordado computadorizado": "Bordado Computorizado",
    "estamparia & silk/dtf": "Estamparia & DTF",
    "linha de costura & fechamento": "Linha de Costura & Montagem",
    "últimos pedidos & mockups têxteis 3x4": "Últimas Encomendas e Mockups Têxteis 3x4",
    "ir para todos os pedidos": "Ir para Todas as Encomendas",
    "ações & status": "Ações e Estado",
    "abertura": "Abertura",
    "pedidos": "Encomendas",
    "os / fichas": "Folhas de Obra",
    "nesting": "Nesting DTF",
    "nesting dtf": "Nesting DTF",
    "estoque": "Stock",
    "produtos": "Artigos",
    "financeiro": "Finanças",
    "compras": "Compras",
    "clientes": "Clientes",
    "quarentena": "Quarentena Técnica",
    "equipe": "Equipa",
    "notas fiscais": "Faturação",
    "minha empresa": "A Minha Empresa",
    "planos & upgrade": "Planos & Upgrade",
    "modo demonstração": "Modo Demonstração",
    "aproveite para testar todos os recursos na sua confecção.": "Aproveite para testar todos os recursos na sua confecção têxtil.",
    "fazer upgrade / planos →": "Fazer Upgrade / Planos →",
    "menu": "Menu",
    "administrador": "Administrador",
    "👑 dono / gerente": "👑 Proprietário / Gerente",
    "gestão comercial, orçamentos & pedidos": "Gestão Comercial, Orçamentos & Encomendas",
    "sistema > pedidos & orçamentos": "SISTEMA > ENCOMENDAS & ORÇAMENTOS",
    "buscar cliente, número ou modelo...": "Pesquisar cliente, número ou modelo...",
    "todos os status": "Todos os Estados",
    "apenas ativos (sem cancelados)": "Apenas Ativos (Sem Cancelados)",
    "em produção": "Em Produção",
    "em quarentena": "Em Quarentena",
    "apenas orçamento": "Apenas Orçamentos",
    "finalizados": "Concluídos",
    "🚫 apenas cancelados": "🚫 Apenas Cancelados",
    "visualização:": "Visualização:",
    "tabela": "Tabela",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ Nova Encomenda / Orçamento",
    "nº pedido": "Nº Encomenda",
    "cliente": "Cliente",
    "data": "Data",
    "peças": "Peças",
    "valor total": "Valor Total",
    "status": "Estado",
    "ações": "Ações",
    "ver detalhes": "Ver Detalhes",
    "imprimir ficha a4": "Imprimir Folha A4",
    "ficha técnica": "Ficha Técnica",
    "cancelar pedido": "Cancelar Encomenda",
    "estoque de malhas, tecidos & aviamentos": "Stock de Malhas, Tecidos & Acessórios",
    "sistema > estoque de matéria-prima": "SISTEMA > STOCK DE MATÉRIAS-PRIMAS",
    "itens no catálogo": "Artigos no Catálogo",
    "patrimônio físico": "Património Físico",
    "nível crítico de estoque (compra)": "Nível Crítico de Stock (Reabastecimento)",
    "perdas registradas": "Desperdício Registado",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Malhas, tecidos, acessórios e DTF prontos a usar",
    "valorizado pelo custo médio ponderado": "Valorizado pelo custo médio ponderado",
    "todos os saldos saudáveis": "Todos os saldos saudáveis",
    "corte, op, amostras e descarte": "Corte, OF, amostras e desperdício",
    "saldos & insumos": "Saldos e Matérias",
    "histórico de movimentações": "Histórico de Movimentos",
    "+ cadastrar entrada": "+ Registar Entrada",
    "- dar baixa no estoque": "- Registar Saída de Stock",
    "código": "Código",
    "descrição do material / entrada": "Descrição do Artigo / Entrada",
    "categoria": "Categoria",
    "unidade": "Unidade",
    "saldo físico": "Saldo Físico",
    "estoque mínimo": "Stock Mínimo",
    "custo unitário": "Custo Unitário",
    "buscar por código ou descrição...": "Pesquisar por código ou descrição...",
    "todas as categorias": "Todas as Categorias",
    "controle financeiro & fluxo de caixa": "Controlo Financeiro & Fluxo de Caixa",
    "sistema > financeiro": "SISTEMA > FINANÇAS",
    "contas a receber": "Contas a Receber",
    "contas a pagar": "Contas a Pagar",
    "fluxo de caixa diário": "Fluxo de Caixa Diário",
    "+ nova receita": "+ Nova Receita",
    "+ nova despesa": "+ Nova Despesa",
    "descrição": "Descrição",
    "vencimento": "Vencimento",
    "valor": "Valor",
    "forma de pagamento": "Modo de Pagamento",
    "carteira de clientes & crm": "Carteira de Clientes & CRM",
    "sistema > clientes": "SISTEMA > CLIENTES",
    "+ cadastrar novo cliente": "+ Registar Novo Cliente",
    "razão social / nome": "Firma / Nome",
    "cnpj / cpf": "NIF",
    "cidade/uf": "Localidade / Distrito",
    "whatsapp / telefone": "Telemóvel / WhatsApp",
    "total comprado": "Total Encomendado",
    "último pedido": "Última Encomenda",
    "quarentena técnica & aprovação": "Quarentena Técnica & Aprovação",
    "sistema > quarentena": "SISTEMA > QUARENTENA TÉCNICA",
    "pedidos bloqueados aguardando conferência": "Encomendas bloqueadas a aguardar conferência",
    "liberar para produção": "Libertar para Produção",
    "rejeitar / solicitar correção": "Rejeitar / Solicitar Revisão",
    "ordens de serviço & fichas técnicas": "Folhas de Obra & Fichas Técnicas",
    "sistema > ordens de serviço": "SISTEMA > FOLHAS DE OBRA",
    "gerar fichas em lote": "Gerar Fichas em Lote",
    "salvar alterações": "Guardar Alterações",
    "salvar": "Guardar",
    "cancelar": "Cancelar",
    "fechar": "Fechar",
    "confirmar": "Confirmar",
    "editar": "Editar",
    "excluir": "Eliminar",
    "voltar": "Voltar",
    "imprimir": "Imprimir",
    "gerar pdf": "Gerar PDF",
    "sucesso": "Sucesso",
    "erro": "Erro",
    "atenção": "Atenção",
    "carregando...": "A carregar...",
    "novo pedido": "+ Nova Encomenda",
    "novo pedido / orçamento": "+ Nova Encomenda / Orçamento",
    "orçamento": "Orçamento",
    "orçamentos": "Orçamentos",
    "finalizado": "Concluído",
    "cancelado": "Cancelado",
    "ver pedido": "Ver Encomenda",
    "editar pedido": "Editar Encomenda",
    "imprimir ordem de corte": "Imprimir Ordem de Corte",
    "enviar no whatsapp": "Enviar pelo WhatsApp",
    "aprovar quarentena": "Aprovar Quarentena",
    "liberar produção": "Libertar Produção",
    "grade de tamanhos": "Grelha de Tamanhos",
    "consumo dtf": "Consumo DTF",
    "consumo de tecido": "Consumo de Tecido",
    "custo total": "Custo Total",
    "preço sugerido": "Preço Sugerido",
    "margem real": "Margem Real",
    "lucro bruto": "Lucro Bruto",
    "sinal financeiro": "Sinal / Adiantamento",
    "sinal de 50%": "Sinal de 50%",
    "chave pix": "IBAN / Chave de Transferência",
    "comprovante": "Comprovativo",
    "gerar proposta": "Gerar Proposta",
    "enviar proposta": "Enviar Proposta",
    "detalhes do pedido": "Detalhes da Encomenda",
    "modelo": "Modelo / Artigo",
    "cor": "Cor",
    "tecido": "Tecido",
    "quantidade": "Quantidade",
    "subtotal": "Subtotal",
    "desconto": "Desconto",
    "total": "Total",
    "observações": "Observações",
    "entrada de material": "Entrada de Material",
    "baixa de estoque": "Saída de Stock",
    "ajuste de saldo": "Acerto de Saldo",
    "custo médio": "Custo Médio",
    "metragem": "Metragem",
    "rolos": "Rolos",
    "aviamentos": "Acessórios & Forros",
    "tecido / malha": "Tecido / Malha",
    "dtf têxtil": "DTF Têxtil",
    "adicionar material": "+ Adicionar Material",
    "histórico": "Histórico",
    "estoque atual": "Stock Atual",
    "estoque crítico": "Stock Crítico",
    "alerta de compra": "Alerta de Compra",
    "fornecedor": "Fornecedor",
    "nota de entrada": "Fatura de Entrada",
    "fluxo de caixa": "Fluxo de Caixa",
    "adicionar receita": "+ Nova Receita",
    "adicionar despesa": "+ Nova Despesa",
    "pago": "Pago",
    "pendente": "Pendente",
    "vencido": "Vencido",
    "hoje": "Hoje",
    "mês atual": "Mês Atual",
    "demonstrativo": "Demonstração Financeira",
    "saldo atual": "Saldo Atual",
    "pix": "Transferência Bancária / MB Way",
    "boleto": "Referência Multibanco",
    "cartão": "Cartão de Crédito",
    "dinheiro": "Numerário",
    "transferência": "Transferência Bancária",
    "categoria financeira": "Categoria Financeira",
    "novo cliente": "+ Novo Cliente",
    "nome / razão social": "Nome / Firma",
    "telefone / celular": "Telefone / Telemóvel",
    "cidade": "Localidade",
    "estado": "Distrito",
    "endereço": "Morada",
    "histórico de compras": "Histórico de Encomendas",
    "cadastrar": "Registar",
    "editar cliente": "Editar Cliente",
    "novo colaborador": "+ Novo Colaborador",
    "nome": "Nome",
    "função": "Cargo",
    "nível de acesso": "Nível de Acesso",
    "ativo": "Ativo",
    "inativo": "Inativo",
    "dono / gerente": "Proprietário / Gerente",
    "cortador": "Cortador",
    "impressor dtf": "Operador DTF",
    "costureira": "Costureira",
    "conferente": "Conferente / Embalamento",
    "ficha de corte": "Folha de Corte",
    "ficha de estamparia": "Folha de Estamparia",
    "ficha de costura": "Folha de Costura",
    "ficha de embalagem": "Folha de Embalamento",
    "assinatura do responsável": "Assinatura do Responsável",
    "observações de produção": "Notas de Produção",
    "data de entrega": "Data de Entrega",
    "data de entrada": "Data de Entrada"
  },
  "fr": {
    "abertura & visão geral da fábrica": "Accueil & Vue d'Ensemble de l'Usine",
    "sistema > abertura": "SYSTÈME > ACCUEIL",
    "minha conta": "Mon Compte",
    "bravvi indústria têxtil": "Bravvi Industrie Textile",
    "bravvi uniformes": "Bravvi Vêtements",
    "faturamento em carteira": "Facturation en Portefeuille",
    "carga da fábrica (peças)": "Charge de l'Atelier (Pièces)",
    "quarentena (aprovação)": "Contrôle Qualité (Approbation)",
    "margem média bruta": "Marge Brute Moyenne",
    "+14.2% vs. mês anterior": "+14.2% vs. mois précédent",
    "pronto para novas campanhas": "Prêt pour de nouvelles campagnes",
    "oficina liberada para produção": "Atelier prêt pour la production",
    "aguardando checklist rigoroso": "En attente du checklist qualité",
    "nenhuma pendência técnica": "Aucun problème technique en attente",
    "acima da média industrial têxtil": "Au-dessus de la moyenne textile",
    "calculada sobre novos pedidos": "Calculée sur les nouvelles commandes",
    "radar de prazos:": "Radar des Délais:",
    "pedidos com prazo estourado": "Commandes en retard",
    "pedidos que vencem hoje": "Commandes pour aujourd'hui",
    "pedidos que vencem amanhã": "Commandes pour demain",
    "pedidos com prazo de 2 a 3 dias": "Commandes dans 2 à 3 jours",
    "pedidos com prazo de 4 a 7 dias": "Commandes dans 4 à 7 jours",
    "pedidos com prazo acima de 7 dias": "Commandes dans plus de 7 jours",
    "performance financeira semestral": "Performance Financière Semestrielle",
    "performance financeira semestral (r$)": "Performance Financière Semestrielle (€)",
    "entradas": "Entrées",
    "saídas": "Sorties",
    "saldo líquido": "Solde Net",
    "valores em milhares": "Valeurs en Milliers",
    "editar gráfico": "Modifier le Graphique",
    "capacidade de produção por setor": "Capacité de Production par Atelier",
    "oficina em ritmo normal": "Atelier à Cadence Normale",
    "editar capacidades": "Modifier les Capacités",
    "mesa de corte": "Table de Coupe",
    "bordado computadorizado": "Broderie Numérique",
    "estamparia & silk/dtf": "Sérigraphie & DTF",
    "linha de costura & fechamento": "Ligne de Confection & Montage",
    "últimos pedidos & mockups têxteis 3x4": "Dernières Commandes & Maquettes 3x4",
    "ir para todos os pedidos": "Voir Toutes les Commandes",
    "ações & status": "Actions & État",
    "abertura": "Accueil",
    "pedidos": "Commandes",
    "os / fichas": "Ordres de Travail",
    "nesting": "Nesting DTF",
    "nesting dtf": "Nesting DTF",
    "estoque": "Stock",
    "produtos": "Produits",
    "financeiro": "Finances",
    "compras": "Achats",
    "clientes": "Clients",
    "quarentena": "Contrôle Qualité",
    "equipe": "Équipe",
    "notas fiscais": "Facturation",
    "minha empresa": "Mon Entreprise",
    "planos & upgrade": "Forfaits & Upgrade",
    "modo demonstração": "Mode Démonstration",
    "aproveite para testar todos os recursos na sua confecção.": "Testez toutes les fonctionnalités dans votre atelier textile.",
    "fazer upgrade / planos →": "Passer à l'offre supérieure →",
    "menu": "Menu",
    "administrador": "Administrateur",
    "👑 dono / gerente": "👑 Propriétaire / Gérant",
    "gestão comercial, orçamentos & pedidos": "Gestion Commerciale, Devis & Commandes",
    "sistema > pedidos & orçamentos": "SYSTÈME > COMMANDES & DEVIS",
    "buscar cliente, número ou modelo...": "Rechercher client, numéro ou modèle...",
    "todos os status": "Tous les États",
    "apenas ativos (sem cancelados)": "Actifs Uniquement",
    "em produção": "En Production",
    "em quarentena": "En Contrôle Qualité",
    "apenas orçamento": "Devis Uniquement",
    "finalizados": "Terminées",
    "🚫 apenas cancelados": "🚫 Annulées Uniquement",
    "visualização:": "Vue:",
    "tabela": "Tableau",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ Nouvelle Commande / Devis",
    "nº pedido": "N° Commande",
    "cliente": "Client",
    "data": "Date",
    "peças": "Pièces",
    "valor total": "Montant Total",
    "status": "État",
    "ações": "Actions",
    "ver detalhes": "Voir Détails",
    "imprimir ficha a4": "Imprimer Fiche A4",
    "ficha técnica": "Fiche Technique",
    "cancelar pedido": "Annuler la Commande",
    "estoque de malhas, tecidos & aviamentos": "Stock de Tissus & Fournitures",
    "sistema > estoque de matéria-prima": "SYSTÈME > STOCK MATIÈRES PREMIÈRES",
    "itens no catálogo": "Articles au Catalogue",
    "patrimônio físico": "Actifs Physiques",
    "nível crítico de estoque (compra)": "Niveau Critique de Stock (Réapprovisionnement)",
    "perdas registradas": "Pertes Enregistrées",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Tissus, fournitures et DTF prêts à l'emploi",
    "valorizado pelo custo médio ponderado": "Valorisé au coût moyen pondéré",
    "todos os saldos saudáveis": "Tous les soldes sont sains",
    "corte, op, amostras e descarte": "Coupe, OT, échantillons et rebuts",
    "saldos & insumos": "Soldes & Fournitures",
    "histórico de movimentações": "Historique des Mouvements",
    "+ cadastrar entrada": "+ Entrée de Stock",
    "- dar baixa no estoque": "- Sortie de Stock",
    "código": "Code",
    "descrição do material / entrada": "Description de l'Article / Entrée",
    "categoria": "Catégorie",
    "unidade": "Unité",
    "saldo físico": "Solde Physique",
    "estoque mínimo": "Stock Minimum",
    "custo unitário": "Coût Unitaire",
    "buscar por código ou descrição...": "Rechercher par code ou désignation...",
    "todas as categorias": "Toutes les Catégories",
    "controle financeiro & fluxo de caixa": "Contrôle Financier & Trésorerie",
    "sistema > financeiro": "SYSTÈME > FINANCES",
    "contas a receber": "Créances Clients",
    "contas a pagar": "Dettes Fournisseurs",
    "fluxo de caixa diário": "Trésorerie Quotidienne",
    "+ nova receita": "+ Nouvel Encaissement",
    "+ nova despesa": "+ Nouvelle Dépense",
    "descrição": "Désignation",
    "vencimento": "Échéance",
    "valor": "Montant",
    "forma de pagamento": "Moyen de Paiement",
    "carteira de clientes & crm": "Portefeuille Clients & CRM",
    "sistema > clientes": "SYSTÈME > CLIENTS",
    "+ cadastrar novo cliente": "+ Nouveau Client",
    "razão social / nome": "Raison Sociale / Nom",
    "cnpj / cpf": "Numéro TVA / SIRET",
    "cidade/uf": "Ville / Département",
    "whatsapp / telefone": "Téléphone / WhatsApp",
    "total comprado": "Total Acheté",
    "último pedido": "Dernière Commande",
    "quarentena técnica & aprovação": "Contrôle Technique & Validation",
    "sistema > quarentena": "SYSTÈME > CONTRÔLE TECHNIQUE",
    "pedidos bloqueados aguardando conferência": "Commandes en attente de vérification",
    "liberar para produção": "Valider pour la Production",
    "rejeitar / solicitar correção": "Rejeter / Demander Correction",
    "ordens de serviço & fichas técnicas": "Ordres de Fabrication & Fiches Techniques",
    "sistema > ordens de serviço": "SYSTÈME > ORDRES DE FABRICATION",
    "gerar fichas em lote": "Générer les Fiches par Lot",
    "salvar alterações": "Enregistrer les Modifications",
    "salvar": "Enregistrer",
    "cancelar": "Annuler",
    "fechar": "Fermer",
    "confirmar": "Confirmer",
    "editar": "Modifier",
    "excluir": "Supprimer",
    "voltar": "Retour",
    "imprimir": "Imprimer",
    "gerar pdf": "Générer le PDF",
    "sucesso": "Succès",
    "erro": "Erreur",
    "atenção": "Attention",
    "carregando...": "Chargement...",
    "novo pedido": "+ Nouvelle Commande",
    "novo pedido / orçamento": "+ Nouvelle Commande / Devis",
    "orçamento": "Devis",
    "orçamentos": "Devis",
    "finalizado": "Terminé",
    "cancelado": "Annulé",
    "ver pedido": "Voir la Commande",
    "editar pedido": "Modifier la Commande",
    "imprimir ordem de corte": "Imprimer Ordre de Coupe",
    "enviar no whatsapp": "Envoyer sur WhatsApp",
    "aprovar quarentena": "Valider Contrôle Qualité",
    "liberar produção": "Lancer la Production",
    "grade de tamanhos": "Grille des Tailles",
    "consumo dtf": "Consommation DTF",
    "consumo de tecido": "Consommation Tissu",
    "custo total": "Coût Total",
    "preço sugerido": "Prix Conseillé",
    "margem real": "Marge Réelle",
    "lucro bruto": "Bénéfice Brut",
    "sinal financeiro": "Acompte",
    "sinal de 50%": "Acompte de 50%",
    "chave pix": "Coordonnées Bancaires / IBAN",
    "comprovante": "Justificatif",
    "gerar proposta": "Générer Proposition",
    "enviar proposta": "Envoyer Proposition",
    "detalhes do pedido": "Détails de la Commande",
    "modelo": "Modèle",
    "cor": "Couleur",
    "tecido": "Tissu",
    "quantidade": "Quantité",
    "subtotal": "Sous-total",
    "desconto": "Remise",
    "total": "Total",
    "observações": "Remarques",
    "entrada de material": "Entrée Matière",
    "baixa de estoque": "Sortie Stock",
    "ajuste de saldo": "Ajustement Stock",
    "custo médio": "Coût Moyen",
    "metragem": "Métrage",
    "rolos": "Rouleaux",
    "aviamentos": "Fournitures & Mercerie",
    "tecido / malha": "Tissu / Maille",
    "dtf têxtil": "DTF Textile",
    "adicionar material": "+ Ajouter Matière",
    "histórico": "Historique",
    "estoque atual": "Stock Actuel",
    "estoque crítico": "Stock Critique",
    "alerta de compra": "Alerte d'Achat",
    "fornecedor": "Fournisseur",
    "nota de entrada": "Facture d'Entrée",
    "fluxo de caixa": "Flux de Trésorerie",
    "adicionar receita": "+ Nouvelle Recette",
    "adicionar despesa": "+ Nouvelle Dépense",
    "pago": "Payé",
    "pendente": "En attente",
    "vencido": "Échu",
    "hoje": "Aujourd'hui",
    "mês atual": "Mois en cours",
    "demonstrativo": "Bilan Financier",
    "saldo atual": "Solde Actuel",
    "pix": "Virement Bancaire",
    "boleto": "Avis de Paiement",
    "cartão": "Carte Bancaire",
    "dinheiro": "Espèces",
    "transferência": "Virement",
    "categoria financeira": "Catégorie Financière",
    "novo cliente": "+ Nouveau Client",
    "nome / razão social": "Nom / Société",
    "telefone / celular": "Téléphone / Mobile",
    "cidade": "Ville",
    "estado": "Région",
    "endereço": "Adresse",
    "histórico de compras": "Historique d'Achats",
    "cadastrar": "Enregistrer",
    "editar cliente": "Modifier Client",
    "novo colaborador": "+ Nouveau Collaborateur",
    "nome": "Nom",
    "função": "Poste",
    "nível de acesso": "Niveau d'Accès",
    "ativo": "Actif",
    "inativo": "Inactif",
    "dono / gerente": "Gérant / Directeur",
    "cortador": "Coupeur",
    "impressor dtf": "Opérateur DTF",
    "costureira": "Couturière",
    "conferente": "Contrôleur / Emballeur",
    "ficha de corte": "Fiche de Coupe",
    "ficha de estamparia": "Fiche d'Impression",
    "ficha de costura": "Fiche de Confection",
    "ficha de embalagem": "Fiche d'Emballage",
    "assinatura do responsável": "Signature Responsable",
    "observações de produção": "Notes de Production",
    "data de entrega": "Date de Livraison",
    "data de entrada": "Date d'Entrée"
  },
  "de": {
    "abertura & visão geral da fábrica": "Übersicht & Werksüberblick",
    "sistema > abertura": "SYSTEM > ÜBERSICHT",
    "minha conta": "Mein Konto",
    "bravvi indústria têxtil": "Bravvi Textilindustrie",
    "bravvi uniformes": "Bravvi Berufsbekleidung",
    "faturamento em carteira": "Auftragsbestand (Umsatz)",
    "carga da fábrica (peças)": "Fabrikauslastung (Stück)",
    "quarentena (aprovação)": "Qualitätsprüfung (Freigabe)",
    "margem média bruta": "Durchschnittliche Bruttomarge",
    "+14.2% vs. mês anterior": "+14.2% vs. Vormonat",
    "pronto para novas campanhas": "Bereit für neue Kampagnen",
    "oficina liberada para produção": "Produktion bereit zur Aufnahme",
    "aguardando checklist rigoroso": "Warten auf strenge Qualitätsprüfung",
    "nenhuma pendência técnica": "Keine technischen Beanstandungen",
    "acima da média industrial têxtil": "Über dem Branchendurchschnitt",
    "calculada sobre novos pedidos": "Berechnet auf Basis neuer Aufträge",
    "radar de prazos:": "Termin-Radar:",
    "pedidos com prazo estourado": "Überfällige Aufträge",
    "pedidos que vencem hoje": "Heute fällige Aufträge",
    "pedidos que vencem amanhã": "Morgen fällige Aufträge",
    "pedidos com prazo de 2 a 3 dias": "Aufträge fällig in 2-3 Tagen",
    "pedidos com prazo de 4 a 7 dias": "Aufträge fällig in 4-7 Tagen",
    "pedidos com prazo acima de 7 dias": "Aufträge fällig in > 7 Tagen",
    "performance financeira semestral": "Halbjahres-Finanzentwicklung",
    "performance financeira semestral (r$)": "Halbjahres-Finanzentwicklung (€)",
    "entradas": "Einnahmen",
    "saídas": "Ausgaben",
    "saldo líquido": "Nettosaldo",
    "valores em milhares": "Werte in Tausend",
    "editar gráfico": "Diagramm bearbeiten",
    "capacidade de produção por setor": "Produktionskapazität nach Bereich",
    "oficina em ritmo normal": "Betrieb im Normalbetrieb",
    "editar capacidades": "Kapazitäten anpassen",
    "mesa de corte": "Zuschnitttisch",
    "bordado computadorizado": "Computergestützte Stickerei",
    "estamparia & silk/dtf": "Siebdruck & DTF-Druck",
    "linha de costura & fechamento": "Näherei & Fertigstellung",
    "últimos pedidos & mockups têxteis 3x4": "Neueste Aufträge & 3x4 Textil-Mockups",
    "ir para todos os pedidos": "Alle Aufträge anzeigen",
    "ações & status": "Aktionen & Status",
    "abertura": "Übersicht",
    "pedidos": "Aufträge",
    "os / fichas": "Fertigungsaufträge",
    "nesting": "DTF-Nesting",
    "nesting dtf": "DTF-Nesting",
    "estoque": "Lagerbestand",
    "produtos": "Artikel",
    "financeiro": "Finanzen",
    "compras": "Einkauf",
    "clientes": "Kunden",
    "quarentena": "Qualitätskontrolle",
    "equipe": "Mitarbeiter",
    "notas fiscais": "Rechnungen",
    "minha empresa": "Mein Unternehmen",
    "planos & upgrade": "Tarife & Upgrade",
    "modo demonstração": "Testmodus",
    "aproveite para testar todos os recursos na sua confecção.": "Testen Sie alle Funktionen für Ihre Textilfertigung.",
    "fazer upgrade / planos →": "Upgrade durchführen / Tarife →",
    "menu": "Menü",
    "administrador": "Administrator",
    "👑 dono / gerente": "👑 Inhaber / Geschäftsführer",
    "gestão comercial, orçamentos & pedidos": "Vertriebsmanagement, Angebote & Aufträge",
    "sistema > pedidos & orçamentos": "SYSTEM > AUFTRÄGE & ANGEBOTE",
    "buscar cliente, número ou modelo...": "Kunde, Auftragsnummer oder Modell suchen...",
    "todos os status": "Alle Status",
    "apenas ativos (sem cancelados)": "Nur aktive Aufträge",
    "em produção": "In Produktion",
    "em quarentena": "In Qualitätskontrolle",
    "apenas orçamento": "Nur Angebote",
    "finalizados": "Abgeschlossen",
    "🚫 apenas cancelados": "🚫 Nur Stornierte",
    "visualização:": "Ansicht:",
    "tabela": "Tabelle",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ Neuer Auftrag / Angebot",
    "nº pedido": "Auftrags-Nr.",
    "cliente": "Kunde",
    "data": "Datum",
    "peças": "Stückzahl",
    "valor total": "Gesamtbetrag",
    "status": "Status",
    "ações": "Aktionen",
    "ver detalhes": "Details anzeigen",
    "imprimir ficha a4": "A4-Auftragszettel drucken",
    "ficha técnica": "Technisches Datenblatt",
    "cancelar pedido": "Auftrag stornieren",
    "estoque de malhas, tecidos & aviamentos": "Lager für Stoffe, Maschenware & Zubehör",
    "sistema > estoque de matéria-prima": "SYSTEM > ROHSTOFFLAGER",
    "itens no catálogo": "Katalogartikel",
    "patrimônio físico": "Warenwert",
    "nível crítico de estoque (compra)": "Kritischer Lagerbestand (Nachbestellung)",
    "perdas registradas": "Erfasster Ausschuss",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Stoffe, Zubehör und DTF einsatzbereit",
    "valorizado pelo custo médio ponderado": "Bewertet zum gleitenden Durchschnittspreis",
    "todos os saldos saudáveis": "Alle Bestände im grünen Bereich",
    "corte, op, amostras e descarte": "Zuschnitt, FA, Muster und Ausschuss",
    "saldos & insumos": "Bestände & Material",
    "histórico de movimentações": "Buchungshistorie",
    "+ cadastrar entrada": "+ Wareneingang",
    "- dar baixa no estoque": "- Warenausgang",
    "código": "Artikelnummer",
    "descrição do material / entrada": "Materialbezeichnung / Buchung",
    "categoria": "Kategorie",
    "unidade": "Einheit",
    "saldo físico": "Ist-Bestand",
    "estoque mínimo": "Mindestbestand",
    "custo unitário": "Stückkosten",
    "buscar por código ou descrição...": "Nach Code oder Beschreibung suchen...",
    "todas as categorias": "Alle Kategorien",
    "controle financeiro & fluxo de caixa": "Finanzkontrolle & Liquidität",
    "sistema > financeiro": "SYSTEM > FINANZEN",
    "contas a receber": "Forderungen",
    "contas a pagar": "Verbindlichkeiten",
    "fluxo de caixa diário": "Täglicher Cashflow",
    "+ nova receita": "+ Neue Einnahme",
    "+ nova despesa": "+ Neue Ausgabe",
    "descrição": "Bezeichnung",
    "vencimento": "Fälligkeit",
    "valor": "Betrag",
    "forma de pagamento": "Zahlungsart",
    "carteira de clientes & crm": "Kundenstamm & CRM",
    "sistema > clientes": "SYSTEM > KUNDEN",
    "+ cadastrar novo cliente": "+ Neuer Kunde",
    "razão social / nome": "Firma / Name",
    "cnpj / cpf": "USt-IdNr. / Steuernummer",
    "cidade/uf": "Stadt / Bundesland",
    "whatsapp / telefone": "Telefon / WhatsApp",
    "total comprado": "Gesamtumsatz",
    "último pedido": "Letzter Auftrag",
    "quarentena técnica & aprovação": "Technische Qualitätsfreigabe",
    "sistema > quarentena": "SYSTEM > QUALITÄTSPRÜFUNG",
    "pedidos bloqueados aguardando conferência": "Gesperrte Aufträge warten auf Prüfung",
    "liberar para produção": "Für Produktion freigeben",
    "rejeitar / solicitar correção": "Ablehnen / Korrektur anfordern",
    "ordens de serviço & fichas técnicas": "Fertigungsaufträge & Technische Daten",
    "sistema > ordens de serviço": "SYSTEM > FERTIGUNGSAUFTRÄGE",
    "gerar fichas em lote": "Auftragsdatenblätter stapelweise drucken",
    "salvar alterações": "Änderungen speichern",
    "salvar": "Speichern",
    "cancelar": "Abbrechen",
    "fechar": "Schließen",
    "confirmar": "Bestätigen",
    "editar": "Bearbeiten",
    "excluir": "Löschen",
    "voltar": "Zurück",
    "imprimir": "Drucken",
    "gerar pdf": "PDF erstellen",
    "sucesso": "Erfolg",
    "erro": "Fehler",
    "atenção": "Achtung",
    "carregando...": "Wird geladen...",
    "novo pedido": "+ Neuer Auftrag",
    "novo pedido / orçamento": "+ Neuer Auftrag / Angebot",
    "orçamento": "Angebot",
    "orçamentos": "Angebote",
    "finalizado": "Abgeschlossen",
    "cancelado": "Storniert",
    "ver pedido": "Auftrag anzeigen",
    "editar pedido": "Auftrag bearbeiten",
    "imprimir ordem de corte": "Zuschnittauftrag drucken",
    "enviar no whatsapp": "Über WhatsApp senden",
    "aprovar quarentena": "Qualitätskontrolle freigeben",
    "liberar produção": "Produktion starten",
    "grade de tamanhos": "Größentabelle",
    "consumo dtf": "DTF-Verbrauch",
    "consumo de tecido": "Stoffverbrauch",
    "custo total": "Gesamtkosten",
    "preço sugerido": "Empfohlener Preis",
    "margem real": "Tatsächliche Marge",
    "lucro bruto": "Bruttogewinn",
    "sinal financeiro": "Anzahlung",
    "sinal de 50%": "50% Anzahlung",
    "chave pix": "Bankverbindung / IBAN",
    "comprovante": "Beleg",
    "gerar proposta": "Angebot erstellen",
    "enviar proposta": "Angebot versenden",
    "detalhes do pedido": "Auftragsdetails",
    "modelo": "Modell",
    "cor": "Farbe",
    "tecido": "Stoff",
    "quantidade": "Menge",
    "subtotal": "Zwischensumme",
    "desconto": "Rabatt",
    "total": "Gesamt",
    "observações": "Bemerkungen",
    "entrada de material": "Materialeingang",
    "baixa de estoque": "Materialausgang",
    "ajuste de saldo": "Bestandskorrektur",
    "custo médio": "Durchschnittskosten",
    "metragem": "Laufmeter",
    "rolos": "Rollen",
    "aviamentos": "Zubehör & Kurzwaren",
    "tecido / malha": "Stoff / Maschenware",
    "dtf têxtil": "Textil-DTF",
    "adicionar material": "+ Material hinzufügen",
    "histórico": "Verlauf",
    "estoque atual": "Aktueller Bestand",
    "estoque crítico": "Kritischer Bestand",
    "alerta de compra": "Bestellwarnung",
    "fornecedor": "Lieferant",
    "nota de entrada": "Eingangsrechnung",
    "fluxo de caixa": "Cashflow",
    "adicionar receita": "+ Neue Einnahme",
    "adicionar despesa": "+ Neue Ausgabe",
    "pago": "Bezahlt",
    "pendente": "Ausstehend",
    "vencido": "Überfällig",
    "hoje": "Heute",
    "mês atual": "Aktueller Monat",
    "demonstrativo": "Finanzübersicht",
    "saldo atual": "Aktueller Kontostand",
    "pix": "Banküberweisung",
    "boleto": "Zahlschein",
    "cartão": "Kreditkarte",
    "dinheiro": "Bargeld",
    "transferência": "Überweisung",
    "categoria financeira": "Finanzkategorie",
    "novo cliente": "+ Neuer Kunde",
    "nome / razão social": "Name / Firma",
    "telefone / celular": "Telefon / Mobil",
    "cidade": "Stadt",
    "estado": "Bundesland",
    "endereço": "Adresse",
    "histórico de compras": "Bestellhistorie",
    "cadastrar": "Registrieren",
    "editar cliente": "Kunde bearbeiten",
    "novo colaborador": "+ Neuer Mitarbeiter",
    "nome": "Name",
    "função": "Position",
    "nível de acesso": "Berechtigungsstufe",
    "ativo": "Aktiv",
    "inativo": "Inaktiv",
    "dono / gerente": "Geschäftsführer",
    "cortador": "Zuschneider",
    "impressor dtf": "DTF-Drucker",
    "costureira": "Näherin",
    "conferente": "Qualitätsprüfer / Verpacker",
    "ficha de corte": "Zuschnittblatt",
    "ficha de estamparia": "Druckdatenblatt",
    "ficha de costura": "Nähanweisung",
    "ficha de embalagem": "Verpackungsblatt",
    "assinatura do responsável": "Unterschrift Verantwortlicher",
    "observações de produção": "Produktionshinweise",
    "data de entrega": "Lieferdatum",
    "data de entrada": "Eingangsdatum"
  },
  "it": {
    "abertura & visão geral da fábrica": "Panoramica & Gestione Fabbrica",
    "sistema > abertura": "SISTEMA > PANORAMICA",
    "minha conta": "Il Mio Account",
    "bravvi indústria têxtil": "Bravvi Industria Tessile",
    "bravvi uniformes": "Bravvi Divise",
    "faturamento em carteira": "Fatturato in Portafoglio",
    "carga da fábrica (peças)": "Carico di Fabbrica (Pezzi)",
    "quarentena (aprovação)": "Controllo Qualità (Approvazione)",
    "margem média bruta": "Margine Lordo Medio",
    "+14.2% vs. mês anterior": "+14.2% vs. mese precedente",
    "pronto para novas campanhas": "Pronto per nuove campagne",
    "oficina liberada para produção": "Laboratorio pronto alla produzione",
    "aguardando checklist rigoroso": "In attesa di controllo qualità",
    "nenhuma pendência técnica": "Nessuna pendenza tecnica",
    "acima da média industrial têxtil": "Sopra la media del settore tessile",
    "calculada sobre novos pedidos": "Calcolato sui nuovi ordini",
    "radar de prazos:": "Radar delle Scadenze:",
    "pedidos com prazo estourado": "Ordini scaduti",
    "pedidos que vencem hoje": "Ordini in scadenza oggi",
    "pedidos que vencem amanhã": "Ordini in scadenza domani",
    "pedidos com prazo de 2 a 3 dias": "Ordini entro 2-3 giorni",
    "pedidos com prazo de 4 a 7 dias": "Ordini entro 4-7 giorni",
    "pedidos com prazo acima de 7 dias": "Ordini oltre 7 giorni",
    "performance financeira semestral": "Andamento Finanziario Semestrale",
    "performance financeira semestral (r$)": "Andamento Finanziario Semestrale (€)",
    "entradas": "Entrate",
    "saídas": "Uscite",
    "saldo líquido": "Saldo Netto",
    "valores em milhares": "Valori in Migliaia",
    "editar gráfico": "Modifica Grafico",
    "capacidade de produção por setor": "Capacità Produttiva per Reparto",
    "oficina em ritmo normal": "Laboratorio a Ritmo Normale",
    "editar capacidades": "Modifica Capacità",
    "mesa de corte": "Banco di Taglio",
    "bordado computadorizado": "Ricamo Elettronico",
    "estamparia & silk/dtf": "Serigrafia & Stampa DTF",
    "linha de costura & fechamento": "Linea di Cucitura & Assemblaggio",
    "últimos pedidos & mockups têxteis 3x4": "Ultimi Ordini & Bozzetti 3x4",
    "ir para todos os pedidos": "Tutti gli Ordini",
    "ações & status": "Azioni & Stato",
    "abertura": "Panoramica",
    "pedidos": "Ordini",
    "os / fichas": "Schede di Lavoro",
    "nesting": "Nesting DTF",
    "nesting dtf": "Nesting DTF",
    "estoque": "Magazzino",
    "produtos": "Prodotti",
    "financeiro": "Finanze",
    "compras": "Acquisti",
    "clientes": "Clienti",
    "quarentena": "Controllo Qualità",
    "equipe": "Personale",
    "notas fiscais": "Fatturazione",
    "minha empresa": "La Mia Azienda",
    "planos & upgrade": "Piani & Upgrade",
    "modo demonstração": "Modalità Demo",
    "aproveite para testar todos os recursos na sua confecção.": "Prova tutte le funzioni nel tuo laboratorio tessile.",
    "fazer upgrade / planos →": "Fai l'Upgrade / Piani →",
    "menu": "Menu",
    "administrador": "Amministratore",
    "👑 dono / gerente": "👑 Titolare / Direttore",
    "gestão comercial, orçamentos & pedidos": "Gestione Commerciale, Preventivi & Ordini",
    "sistema > pedidos & orçamentos": "SISTEMA > ORDINI & PREVENTIVI",
    "buscar cliente, número ou modelo...": "Cerca cliente, numero ordine o modello...",
    "todos os status": "Tutti gli Stati",
    "apenas ativos (sem cancelados)": "Solo Attivi (Senza Annullati)",
    "em produção": "In Produzione",
    "em quarentena": "In Controllo Qualità",
    "apenas orçamento": "Solo Preventivi",
    "finalizados": "Completati",
    "🚫 apenas cancelados": "🚫 Solo Annullati",
    "visualização:": "Vista:",
    "tabela": "Tabella",
    "kanban": "Kanban",
    "+ novo pedido / orçamento": "+ Nuovo Ordine / Preventivo",
    "nº pedido": "N° Ordine",
    "cliente": "Cliente",
    "data": "Data",
    "peças": "Pezzi",
    "valor total": "Valore Totale",
    "status": "Stato",
    "ações": "Azioni",
    "ver detalhes": "Visualizza Dettagli",
    "imprimir ficha a4": "Stampa Foglio A4",
    "ficha técnica": "Scheda Tecnica",
    "cancelar pedido": "Annulla Ordine",
    "estoque de malhas, tecidos & aviamentos": "Magazzino Tessuti & Accessori",
    "sistema > estoque de matéria-prima": "SISTEMA > MAGAZZINO MATERIE PRIME",
    "itens no catálogo": "Articoli in Catalogo",
    "patrimônio físico": "Patrimonio Fisico",
    "nível crítico de estoque (compra)": "Scorta Minima Critica (Riacquisto)",
    "perdas registradas": "Sfridi & Difetti",
    "malhas, tecidos, aviamentos e dtf (prontos para consumo)": "Tessuti, accessori e stampe pronti all'uso",
    "valorizado pelo custo médio ponderado": "Valorizzato a costo medio ponderato",
    "todos os saldos saudáveis": "Tutti i saldi regolari",
    "corte, op, amostras e descarte": "Taglio, OL, campioni e scarti",
    "saldos & insumos": "Saldi & Forniture",
    "histórico de movimentações": "Storico Movimenti",
    "+ cadastrar entrada": "+ Registra Entrata",
    "- dar baixa no estoque": "- Scarica da Magazzino",
    "código": "Codice",
    "descrição do material / entrada": "Descrizione Articolo / Entrata",
    "categoria": "Categoria",
    "unidade": "Unità",
    "saldo físico": "Giacenza Fisica",
    "estoque mínimo": "Scorta Minima",
    "custo unitário": "Costo Unitario",
    "buscar por código ou descrição...": "Cerca per codice o descrizione...",
    "todas as categorias": "Tutte le Categorie",
    "controle financeiro & fluxo de caixa": "Controllo Finanziario & Cassa",
    "sistema > financeiro": "SISTEMA > FINANZE",
    "contas a receber": "Crediti Clienti",
    "contas a pagar": "Debiti Fornitori",
    "fluxo de caixa diário": "Flusso di Cassa Giornaliero",
    "+ nova receita": "+ Nuova Entrata",
    "+ nova despesa": "+ Nuova Uscita",
    "descrição": "Descrizione",
    "vencimento": "Scadenza",
    "valor": "Importo",
    "forma de pagamento": "Metodo di Pagamento",
    "carteira de clientes & crm": "Portafoglio Clienti & CRM",
    "sistema > clientes": "SISTEMA > CLIENTI",
    "+ cadastrar novo cliente": "+ Registra Nuovo Cliente",
    "razão social / nome": "Ragione Sociale / Nome",
    "cnpj / cpf": "Partita IVA / Codice Fiscale",
    "cidade/uf": "Città / Provincia",
    "whatsapp / telefone": "Telefono / WhatsApp",
    "total comprado": "Totale Acquistato",
    "último pedido": "Ultimo Ordine",
    "quarentena técnica & aprovação": "Controllo Tecnico & Approvazione",
    "sistema > quarentena": "SISTEMA > CONTROLLO TECNICO",
    "pedidos bloqueados aguardando conferência": "Ordini bloccati in attesa di verifica",
    "liberar para produção": "Sblocca per la Produzione",
    "rejeitar / solicitar correção": "Rifiuta / Richiedi Modifica",
    "ordens de serviço & fichas técnicas": "Ordini di Lavoro & Schede Tecniche",
    "sistema > ordens de serviço": "SISTEMA > ORDINI DI LAVORO",
    "gerar fichas em lote": "Genera Schede in Blocco",
    "salvar alterações": "Salva Modifiche",
    "salvar": "Salva",
    "cancelar": "Annulla",
    "fechar": "Chiudi",
    "confirmar": "Conferma",
    "editar": "Modifica",
    "excluir": "Elimina",
    "voltar": "Indietro",
    "imprimir": "Stampa",
    "gerar pdf": "Genera PDF",
    "sucesso": "Successo",
    "erro": "Errore",
    "atenção": "Attenzione",
    "carregando...": "Caricamento in corso...",
    "novo pedido": "+ Nuovo Ordine",
    "novo pedido / orçamento": "+ Nuovo Ordine / Preventivo",
    "orçamento": "Preventivo",
    "orçamentos": "Preventivi",
    "finalizado": "Completato",
    "cancelado": "Annullato",
    "ver pedido": "Visualizza Ordine",
    "editar pedido": "Modifica Ordine",
    "imprimir ordem de corte": "Stampa Ordine di Taglio",
    "enviar no whatsapp": "Invia su WhatsApp",
    "aprovar quarentena": "Approva Controllo Qualità",
    "liberar produção": "Avvia Produzione",
    "grade de tamanhos": "Sviluppo Taglie",
    "consumo dtf": "Consumo DTF",
    "consumo de tecido": "Consumo Tessuto",
    "custo total": "Costo Totale",
    "preço sugerido": "Prezzo Consigliato",
    "margem real": "Margine Reale",
    "lucro bruto": "Utile Lordo",
    "sinal financeiro": "Acconto",
    "sinal de 50%": "Acconto 50%",
    "chave pix": "Coordinate Bancarie / IBAN",
    "comprovante": "Ricevuta",
    "gerar proposta": "Genera Preventivo",
    "enviar proposta": "Invia Preventivo",
    "detalhes do pedido": "Dettagli Ordine",
    "modelo": "Modello",
    "cor": "Colore",
    "tecido": "Tessuto",
    "quantidade": "Quantità",
    "subtotal": "Subtotale",
    "desconto": "Sconto",
    "total": "Totale",
    "observações": "Note",
    "entrada de material": "Entrata Materiale",
    "baixa de estoque": "Scarico Magazzino",
    "ajuste de saldo": "Rettifica Giacenza",
    "custo médio": "Costo Medio",
    "metragem": "Metraggio",
    "rolos": "Rotoli",
    "aviamentos": "Accessori & Minuterie",
    "tecido / malha": "Tessuto / Maglia",
    "dtf têxtil": "DTF Tessile",
    "adicionar material": "+ Aggiungi Materiale",
    "histórico": "Cronologia",
    "estoque atual": "Giacenza Attuale",
    "estoque crítico": "Scorta Critica",
    "alerta de compra": "Avviso di Riacquisto",
    "fornecedor": "Fornitore",
    "nota de entrada": "Fattura Fornitore",
    "fluxo de caixa": "Flusso di Cassa",
    "adicionar receita": "+ Nuova Entrata",
    "adicionar despesa": "+ Nuova Spesa",
    "pago": "Pagato",
    "pendente": "In Sospeso",
    "vencido": "Scaduto",
    "hoje": "Oggi",
    "mês atual": "Mese Corrente",
    "demonstrativo": "Rendiconto Finanziario",
    "saldo atual": "Saldo Attuale",
    "pix": "Bonifico Bancario",
    "boleto": "Bollettino",
    "cartão": "Carta di Credito",
    "dinheiro": "Contanti",
    "transferência": "Bonifico",
    "categoria financeira": "Categoria Finanziaria",
    "novo cliente": "+ Nuovo Cliente",
    "nome / razão social": "Nome / Ragione Sociale",
    "telefone / celular": "Telefono / Cellulare",
    "cidade": "Città",
    "estado": "Provincia",
    "endereço": "Indirizzo",
    "histórico de compras": "Storico Ordini",
    "cadastrar": "Registra",
    "editar cliente": "Modifica Cliente",
    "novo colaborador": "+ Nuovo Dipendente",
    "nome": "Nome",
    "função": "Mansione",
    "nível de acesso": "Livello di Accesso",
    "ativo": "Attivo",
    "inativo": "Inattivo",
    "dono / gerente": "Titolare / Direttore",
    "cortador": "Tagliatore",
    "impressor dtf": "Operatore Stampa DTF",
    "costureira": "Sarta",
    "conferente": "Collaudatore / Imballaggio",
    "ficha de corte": "Foglio di Taglio",
    "ficha de estamparia": "Foglio di Stampa",
    "ficha de costura": "Foglio di Confezione",
    "ficha de embalagem": "Foglio di Confezionamento",
    "assinatura do responsável": "Firma del Responsabile",
    "observações de produção": "Note di Produzione",
    "data de entrega": "Data di Consegna",
    "data de entrada": "Data di Entrata"
  }
};

  let idiomaAtual = localStorage.getItem('bravvi_language') || 'pt-BR';
  if (!CATALOGO.some(c => c.code === idiomaAtual)) {
    idiomaAtual = 'pt-BR';
  }

  function obterConfig() {
    return CATALOGO.find(c => c.code === idiomaAtual) || CATALOGO[0];
  }

  // Formatadores Nativos de Moeda e Número
  function formatarMoeda(valor) {
    const cfg = obterConfig();
    const num = Number(valor) || 0;
    try {
      return new Intl.NumberFormat(cfg.locale, {
        style: 'currency',
        currency: cfg.moeda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    } catch (e) {
      return `${cfg.simbolo} ${num.toFixed(2)}`;
    }
  }

  function formatarNumero(valor) {
    const cfg = obterConfig();
    return new Intl.NumberFormat(cfg.locale).format(valor || 0);
  }

  function formatarK(valor) {
    const cfg = obterConfig();
    if (valor === undefined || valor === null || isNaN(valor)) return `${cfg.simbolo} 0`;
    const num = Number(valor);
    const absVal = Math.abs(num);
    if (absVal === 0) return `${cfg.simbolo} 0`;
    const prefix = num < 0 ? '-' : '';
    if (absVal >= 1000) {
      const milhar = (absVal / 1000).toFixed(absVal % 1000 === 0 ? 0 : 1).replace('.0', '');
      return `${prefix}${cfg.simbolo} ${milhar}k`;
    }
    return `${prefix}${cfg.simbolo} ${absVal.toFixed(0)}`;
  }

  // Padrões Dinâmicos por Idioma (Frases com números / variáveis)
  function traduzirPadroes(texto, lang) {
    const t = texto.trim();
    
    // Ordens ativas na oficina
    const mOficina = t.match(/^(\d+)\s+ordens ativas na oficina$/i);
    if (mOficina) {
      const n = mOficina[1];
      if (lang === 'en') return `${n} active orders in workshop`;
      if (lang === 'es') return `${n} órdenes activas en taller`;
      if (lang === 'pt-PT') return `${n} encomendas ativas na oficina`;
      if (lang === 'fr') return `${n} ordres actifs dans l'atelier`;
      if (lang === 'de') return `${n} aktive Aufträge in der Werkstatt`;
      if (lang === 'it') return `${n} ordini attivi in officina`;
    }

    // Pedidos (ex: "1 pedidos", "3 pedidos")
    const mPedidos = t.match(/^(\d+)\s+pedidos$/i);
    if (mPedidos) {
      const n = parseInt(mPedidos[1], 10);
      if (lang === 'en') return n === 1 ? '1 order' : `${n} orders`;
      if (lang === 'es') return n === 1 ? '1 pedido' : `${n} pedidos`;
      if (lang === 'pt-PT') return n === 1 ? '1 encomenda' : `${n} encomendas`;
      if (lang === 'fr') return n === 1 ? '1 commande' : `${n} commandes`;
      if (lang === 'de') return n === 1 ? '1 Auftrag' : `${n} Aufträge`;
      if (lang === 'it') return n === 1 ? '1 ordine' : `${n} ordini`;
    }

    // Peças un (ex: "340 un", "120 un.")
    const mUn = t.match(/^([\d\.,]+)\s+un\.?$/i);
    if (mUn) {
      const n = mUn[1];
      if (lang === 'en') return `${n} pcs`;
      if (lang === 'es') return `${n} un.`;
      if (lang === 'pt-PT') return `${n} un.`;
      if (lang === 'fr') return `${n} pcs`;
      if (lang === 'de') return `${n} Stk.`;
      if (lang === 'it') return `${n} pz.`;
    }

    // Radar Chips
    if (t.includes('Atrasados:')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `⚠️ Overdue: ${n}`;
      if (lang === 'es') return `⚠️ Atrasados: ${n}`;
      if (lang === 'pt-PT') return `⚠️ Em Atraso: ${n}`;
      if (lang === 'fr') return `⚠️ En Retard: ${n}`;
      if (lang === 'de') return `⚠️ Überfällig: ${n}`;
      if (lang === 'it') return `⚠️ In Ritardo: ${n}`;
    }
    if (t.includes('Vencem Hoje:')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `🔥 Due Today: ${n}`;
      if (lang === 'es') return `🔥 Vencen Hoy: ${n}`;
      if (lang === 'pt-PT') return `🔥 Vencem Hoje: ${n}`;
      if (lang === 'fr') return `🔥 Échéance Aujourd'hui: ${n}`;
      if (lang === 'de') return `🔥 Heute Fällig: ${n}`;
      if (lang === 'it') return `🔥 Scadono Oggi: ${n}`;
    }
    if (t.includes('Vencem Amanhã:')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `⚡ Due Tomorrow: ${n}`;
      if (lang === 'es') return `⚡ Vencen Mañana: ${n}`;
      if (lang === 'pt-PT') return `⚡ Vencem Amanhã: ${n}`;
      if (lang === 'fr') return `⚡ Échéance Demain: ${n}`;
      if (lang === 'de') return `⚡ Morgen Fällig: ${n}`;
      if (lang === 'it') return `⚡ Scadono Domani: ${n}`;
    }
    if (t.includes('Atenção (2-3d):')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `⏳ Attention (2-3d): ${n}`;
      if (lang === 'es') return `⏳ Atención (2-3d): ${n}`;
      if (lang === 'pt-PT') return `⏳ Atenção (2-3d): ${n}`;
      if (lang === 'fr') return `⏳ Attention (2-3j): ${n}`;
      if (lang === 'de') return `⏳ Achtung (2-3T): ${n}`;
      if (lang === 'it') return `⏳ Attenzione (2-3g): ${n}`;
    }
    if (t.includes('No Prazo (4-7d):')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `⏱️ On Schedule (4-7d): ${n}`;
      if (lang === 'es') return `⏱️ A Tiempo (4-7d): ${n}`;
      if (lang === 'pt-PT') return `⏱️ No Prazo (4-7d): ${n}`;
      if (lang === 'fr') return `⏱️ Dans les Délais (4-7j): ${n}`;
      if (lang === 'de') return `⏱️ Im Zeitplan (4-7T): ${n}`;
      if (lang === 'it') return `⏱️ Nei Tempi (4-7g): ${n}`;
    }
    if (t.includes('Confortável (>7d):')) {
      const n = (t.match(/\d+/) || ['0'])[0];
      if (lang === 'en') return `🟢 Comfortable (>7d): ${n}`;
      if (lang === 'es') return `🟢 Holgado (>7d): ${n}`;
      if (lang === 'pt-PT') return `🟢 Confortável (>7d): ${n}`;
      if (lang === 'fr') return `🟢 Confortable (>7j): ${n}`;
      if (lang === 'de') return `🟢 Ausreichend (>7T): ${n}`;
      if (lang === 'it') return `🟢 Comodo (>7g): ${n}`;
    }

    return null;
  }

  // Tradução de String Completa (Frase Inteira, sem quebra)
  function traduzirTexto(textoOriginal, lang) {
    if (!textoOriginal || typeof textoOriginal !== 'string') return textoOriginal;
    const trimmed = textoOriginal.trim();
    if (trimmed.length === 0) return textoOriginal;

    if (lang === 'pt-BR') return textoOriginal;

    // 1. Checar Padrões Dinâmicos
    const resPadrao = traduzirPadroes(trimmed, lang);
    if (resPadrao) return resPadrao;

    // 2. Checar Dicionário por Chave Lowercase
    const dict = DICIONARIOS[lang];
    if (dict) {
      const key = trimmed.toLowerCase();
      if (dict[key]) {
        const traducao = dict[key];
        // Se o original era 100% maiúsculo, preserva
        if (trimmed.length > 2 && trimmed === trimmed.toUpperCase()) {
          return traducao.toUpperCase();
        }
        return traducao;
      }
    }

    // Se não encontrou, preserva intacto (NUNCA faça regex parcial de palavras soltas)
    return textoOriginal;
  }

  // Varredura Recursiva Segura no DOM
  function traduzirElemento(raiz, lang) {
    if (!raiz || !raiz.nodeType) return;
    if (raiz.id === 'bravviLanguageModal') return;

    // Text Node direto
    if (raiz.nodeType === 3) {
      const val = raiz.nodeValue;
      if (!val || !val.trim()) return;
      if (raiz.__origText === undefined) raiz.__origText = val;
      raiz.nodeValue = (lang === 'pt-BR') ? raiz.__origText : traduzirTexto(raiz.__origText, lang);
      return;
    }

    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const val = node.nodeValue;
      if (!val || !val.trim()) continue;
      const parent = node.parentNode;
      if (parent && (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName) || parent.closest('#bravviLanguageModal'))) {
        continue;
      }
      if (node.__origText === undefined) {
        node.__origText = val;
      }
      node.nodeValue = (lang === 'pt-BR') ? node.__origText : traduzirTexto(node.__origText, lang);
    }

    // Traduz Atributos Relevantes
    const inputs = raiz.querySelectorAll ? raiz.querySelectorAll('input[placeholder], textarea[placeholder], button[title], a[title]') : [];
    inputs.forEach(el => {
      if (el.closest && el.closest('#bravviLanguageModal')) return;
      if (el.placeholder) {
        if (el.__origPlaceholder === undefined) el.__origPlaceholder = el.placeholder;
        el.placeholder = (lang === 'pt-BR') ? el.__origPlaceholder : traduzirTexto(el.__origPlaceholder, lang);
      }
      if (el.title) {
        if (el.__origTitle === undefined) el.__origTitle = el.title;
        el.title = (lang === 'pt-BR') ? el.__origTitle : traduzirTexto(el.__origTitle, lang);
      }
    });
  }

  // Tradução da Página Completa
  function traduzirPaginaCompleta() {
    const lang = idiomaAtual;
    const cfg = obterConfig();

    document.documentElement.lang = cfg.code;

    // Atualiza botão do cabeçalho
    const flagEl = document.getElementById('headerLangFlag');
    const textEl = document.getElementById('headerLangText');
    if (flagEl) flagEl.textContent = cfg.flag;
    if (textEl) textEl.textContent = cfg.nome.split(' (')[0];

    // Navbar
    const topNavbar = document.querySelector('.top-navbar');
    if (topNavbar) traduzirElemento(topNavbar, lang);

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) traduzirElemento(sidebar, lang);

    // Conteúdo Principal
    const contentArea = document.getElementById('contentArea');
    if (contentArea) traduzirElemento(contentArea, lang);

    // Título e Breadcrumb da Página
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
  }

  // Modal Elegante de Seleção de Idioma
  function abrirModalIdioma() {
    let modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'bravviLanguageModal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 16px;';

    const cardsHtml = CATALOGO.map(c => {
      const isAtivo = c.code === idiomaAtual;
      return `
        <div class="lang-option" onclick="window.ERP_I18N.selecionarIdioma('${c.code}')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 8px; border: 1.5px solid ${isAtivo ? '#0d9488' : '#e2e8f0'}; background: ${isAtivo ? '#f0fdfa' : '#ffffff'}; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.borderColor='#0d9488'; this.style.background='#f0fdfa';" onmouseout="${isAtivo ? '' : "this.style.borderColor='#e2e8f0'; this.style.background='#ffffff';"}">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${c.flag}</span>
            <div>
              <div style="font-size: 13.5px; font-weight: ${isAtivo ? '800' : '600'}; color: ${isAtivo ? '#0f766e' : '#0f172a'};">${c.nome}</div>
              <div style="font-size: 11.5px; color: #64748b;">Moeda Oficial: ${c.moeda} (${c.simbolo})</div>
            </div>
          </div>
          ${isAtivo ? '<span style="color: #0d9488; font-weight: 800; font-size: 14px;">✓ Ativo</span>' : '<span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Selecionar &rarr;</span>'}
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="modal-box" style="background: #ffffff; border-radius: 14px; max-width: 520px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden; animation: fadeIn 0.2s ease;">
        
        <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>🌐</span> Idioma & Moeda do Sistema / Select Language
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Tradução 100% nativa e conversão de formato monetário instantânea (0ms)
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px 8px;">&times;</button>
        </div>

        <div style="padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 420px;">
          ${cardsHtml}
        </div>

        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
          <div>Suas preferências são salvas localmente no navegador.</div>
          <button type="button" id="btnCancelLangModal" class="btn btn-secondary btn-sm" style="padding: 6px 14px; font-size: 12px;">Fechar</button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnCloseLangModal').onclick = () => modal.remove();
    document.getElementById('btnCancelLangModal').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  // Ação de Selecionar Idioma
  function selecionarIdioma(code) {
    if (!code) return;
    const item = CATALOGO.find(c => c.code === code);
    if (!item) return;

    idiomaAtual = item.code;
    localStorage.setItem('bravvi_language', idiomaAtual);

    const modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    // Re-renderiza a aba ativa do ERP para atualizar os cálculos de moeda
    if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function' && typeof window.ERP.navegarPara === 'function') {
      window.ERP.navegarPara(window.ERP.obterAbaAtiva());
    }

    // Executa a tradução visual completa
    traduzirPaginaCompleta();

    // Notificação Toast
    const mensagens = {
      'pt-BR': `Idioma definido para Português (Brasil) • Moeda: ${item.simbolo}`,
      'pt-PT': `Idioma alterado para Português (Portugal) • Moeda: ${item.simbolo}`,
      'es': `¡Idioma cambiado a Español! Moneda: ${item.simbolo}`,
      'en': `Language set to English! Currency: ${item.simbolo}`,
      'fr': `Langue définie en Français! Devise: ${item.simbolo}`,
      'de': `Sprache auf Deutsch eingestellt! Währung: ${item.simbolo}`,
      'it': `Lingua impostata su Italiano! Valuta: ${item.simbolo}`
    };

    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      window.ERP.mostrarToast(mensagens[idiomaAtual] || `Idioma ativado: ${item.nome}`, 'sucesso');
    }
  }

  // Inicialização Automática
  function inicializar() {
    traduzirPaginaCompleta();
    setTimeout(traduzirPaginaCompleta, 100);
    setTimeout(traduzirPaginaCompleta, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    setTimeout(inicializar, 50);
  }

  // Exportação Global
  window.ERP_I18N = {
    idiomaAtual: () => idiomaAtual,
    obterConfig,
    formatarMoeda,
    formatarNumero,
    formatarK,
    traduzirTexto,
    traduzirElemento,
    traduzirPaginaCompleta,
    abrirModalIdioma,
    selecionarIdioma,
    catalogo: CATALOGO
  };

})();
