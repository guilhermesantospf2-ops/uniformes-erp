# 🚀 Plano Completo de Lançamento: Hospedagem, Banco na Nuvem & Campanha de Anúncios
### TexPro Uniformes ERP Industrial • Guia Prático para Subir Amanhã

Este guia contém o passo a passo exato para você colocar o sistema na internet, conectar o banco de dados em nuvem e rodar seus anúncios no Meta Ads (Instagram/Facebook) para fechar suas primeiras fábricas clientes.

---

## 📌 PARTE 1: Como Hospedar o Sistema em 3 Minutos (Grátis)

Você tem duas opções simples e com custo R$ 0:

### Opção A: Vercel (A mais rápida pelo navegador - 1 Minuto)
1. Acesse **[vercel.com](https://vercel.com/)** e faça login com seu e-mail ou GitHub.
2. Clique em **"Add New Project"** e arraste a pasta `uniformes-erp` (ou conecte seu repositório Git).
3. O arquivo [`vercel.json`](file:///c:/Users/rrenx/.antigravity-ide/uniformes-erp/vercel.json) já está configurado. Basta clicar em **"Deploy"**.
4. Em 30 segundos você terá um link seguro com HTTPS oficial (ex: `https://texpro-erp.vercel.app`).
5. (Opcional): Você pode conectar seu próprio domínio (ex: `app.suaempresa.com.br`) na aba *Domains* da Vercel.

### Opção B: Firebase Hosting (Google Cloud)
1. Instale o Firebase CLI no seu terminal:
   ```bash
   npm install -g firebase-tools
   ```
2. Faça login com sua conta Google:
   ```bash
   firebase login
   ```
3. Na pasta `uniformes-erp`, o arquivo [`firebase.json`](file:///c:/Users/rrenx/.antigravity-ide/uniformes-erp/firebase.json) já está pronto. Basta rodar:
   ```bash
   firebase deploy --only hosting
   ```
4. O Google fornecerá um link gratuito e ultrarrápido (ex: `https://seu-projeto.web.app`).

---

## ☁️ PARTE 2: Como Conectar o Banco de Dados em Nuvem (Firestore Realtime)

Para que o vendedor use no celular e a oficina veja no computador ao mesmo tempo sem perder dados:

1. Acesse o **[Console do Firebase](https://console.firebase.google.com/)** e clique em **"Criar Projeto"** (ex: `texpro-erp`).
2. No menu lateral esquerdo, clique em **"Firestore Database"** > **"Criar Banco de Dados"**:
   - Localização: Escolha `southamerica-east1 (São Paulo)` para ter velocidade máxima no Brasil.
   - Regras de Segurança: Escolha "Modo de Teste" ou configure leitura/escrita para usuários autorizados.
3. Vá em **Configurações do Projeto** (ícone de engrenagem) > role até a seção **"Seus Aplicativos"** > clique no ícone Web `</>`.
4. Copie o bloco de código `firebaseConfig`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Abra o sistema no navegador, vá em **"Backup & Nuvem"** > clique em **"Configurar Nuvem"** e cole esse código.
6. Clique em **"Salvar & Conectar Nuvem"**.
7. **Pronto!** O badge do topo mudará para `🟢 Online • Firestore Ativo`. A partir deste instante, todos os pedidos, orçamentos e financeiro salvam na nuvem instantaneamente em tempo real!

---

## 🎯 PARTE 3: Configuração da Campanha de Anúncios no Meta Ads (Instagram/Facebook)

### 1. Objetivo da Campanha
* **Objetivo:** Mensagens no WhatsApp (Engajamento > WhatsApp) OU Tráfego com botão direto para o WhatsApp.
* **Orçamento Inicial Sugerido:** R$ 25 a R$ 50 / dia (já gera de 5 a 15 conversas de donos de fábrica por dia).

### 2. Segmentação de Público-Alvo (Quem Compra ERP de Uniformes?)
* **Gênero:** Homens e Mulheres (50% / 50%)
* **Idade:** 28 a 58 anos
* **Localização:**
  * *Nível Brasil* OU foco nos maiores polos têxteis:
    * São Paulo (Americana, Brás, Bom Retiro, Santa Bárbara d'Oeste)
    * Santa Catarina (Brusque, Blumenau, Guabiruba)
    * Ceará (Fortaleza, Maranguape)
    * Goiás (Goiânia, Jaraguá)
    * Minas Gerais (Divinópolis)
* **Direcionamento Detalhado (Interesses e Comportamentos):**
  * *Interesses:* Confecção de Uniformes, Serigrafia, Estamparia, Impressão DTF, Bordado Computadorizado, Costura Industrial, Indústria Têxtil, Máquina de Bordar (Tajima, Brother, Siruba, Barudan).
  * *Cargos / Títulos:* Proprietário, Sócio, Fundador, Gerente Geral, Encarregado de Confecção.

---

## ✍️ PARTE 4: 3 Copys Prontas de Alta Conversão para os Anúncios

### 🟢 Opção 1: Foco na Dor do Desperdício de Tecido & Margem (Mais Forte)
> **Texto do Anúncio (Feed / Legenda):**
> 
> Dono de confecção de uniformes: você sabe exatamente quantos reais perdeu em retalho de tecido esse mês? 🧵📉
> 
> Cobrar no "olhômetro" ou calcular tecido em tabela de Excel antiga é o que mais drena o lucro da fábrica. Na hora de cortar 150 polos ou camisas de brim, se faltar 1 metro de tecido ou errar a metragem do DTF, o prejuízo sai direto do seu bolso.
> 
> O **TexPro ERP** foi feito exclusivamente para confecções e estamparias de uniformes:
> 
> ✅ Cálculo automático de rendimento de tecido por kg com margem de segurança  
> ✅ Otimizador de rolo DTF (58cm e 28cm) para não desperdiçar filme  
> ✅ Contagem regressiva visual dos pedidos (você vê de longe o que vence hoje)  
> ✅ Orçamento com foto da peça em 30 segundos pelo WhatsApp  
> ✅ Ficha Técnica A4 sem vazar seus custos para o chão de fábrica  
> 
> Deixe de perder dinheiro com planilha desatualizada.  
> 👉 **Toque no botão abaixo e teste uma demonstração ao vivo agora mesmo pelo WhatsApp.**

---

### 🔵 Opção 2: Foco no Caos da Produção & Atrasos de Entrega
> **Texto do Anúncio (Feed / Stories):**
> 
> Cliente cobrando entrega no WhatsApp, costureira perguntando o tamanho da grade e o cortador sem saber qual pedido cortar primeiro? 😰
> 
> Se a sua confecção vive esse fogo cruzado todos os dias, você precisa de um chão de fábrica que ande sozinho.
> 
> Com o **TexPro ERP**:
> 1. Nenhum pedido entra em corte sem aprovação de arte e sinal de 50% pago (Trava de Quarentena).
> 2. O painel Kanban mostra em tempo real o que está no corte, estamparia, costura e expedição.
> 3. Alertas por cores mostram os prazos estourando antes que o cliente reclame.
> 4. O vendedor lança o orçamento no celular e a oficina já vê no computador.
> 
> Chega de dor de cabeça. Profissionalize sua confecção hoje.  
> 👉 **Fale com nosso consultor no WhatsApp e veja funcionando em 5 minutos.**

---

### 🟡 Opção 3: Oferta Direta de Implantação Rápida
> **Texto do Anúncio (Feed / Carrossel):**
> 
> Sistema de gestão específico para fábrica de uniformes profissionais, escolares e esportivos.  
> 
> ❌ Sem mensalidades abusivas  
> ❌ Sem contratos de fidelidade de 12 meses  
> ✅ Pronto para rodar no mesmo dia  
> 
> Inclui: gerador de propostas comerciais em PDF com chave PIX, fichas técnicas para cortador e facção, controle de insumos e DRE de lucro líquido real.
> 
> 🎁 **Bônus desta semana:** Implantação guiada e cadastro do catálogo inicial da sua fábrica.  
> 👉 **Clique em "Saiba Mais" e chame no WhatsApp para garantir sua vaga.**

---

## 💬 PARTE 5: Script de Atendimento no WhatsApp (Funil 1 a 1 de Fechamento)

Quando o dono da confecção clicar no anúncio e chamar no WhatsApp:

### Mensagem 1 (Boas-vindas Imediata):
> *"Olá! Tudo bem? Aqui é da equipe do **TexPro ERP Têxtil**.*  
> *Vi que você tem confecção de uniformes. Quantas peças em média vocês produzem por mês hoje, e qual é o principal tipo de uniforme de vocês (polo, esportivo, brim operacional ou jalecos)?"*

### Mensagem 2 (Após ele responder o tipo de fábrica):
> *"Perfeito! Essa é exatamente a especialidade do nosso sistema. Nós criamos o TexPro porque as confecções perdiam muito tempo calculando metragem de tecido e montando mockup na mão, além de ter confusão entre o vendedor e a mesa de corte.*  
> *Vou te mandar um link rápido para você ver a tela do sistema funcionando ao vivo. Você prefere testar pelo computador ou ver um vídeo de 2 minutinhos mostrando a ficha técnica e o orçamento?"*

### Mensagem 3 (Apresentando o Link da Demonstração):
> *"Aqui está o link: [SEU_LINK_PUBLICO]*  
> *Ao abrir, você pode clicar no botão **'Demonstração Showroom'** no menu superior. Ele vai preencher pedidos de exemplo com polos, camisetas dry fit e brins operacionais para você ver as fichas A4 e a contagem regressiva funcionando na prática."*

### Mensagem 4 (Apresentação dos Valores & Fechamento):
> *"Temos três formatos para atender sua fábrica:*  
> 1. **Plano Mensal Completo:** R$ 349/mês, sem contrato de fidelidade e com suporte direto no WhatsApp.  
> 2. **Setup VIP com Treinamento:** R$ 1.200 (configuramos seu logotipo, catálogo e treinamos sua equipe) + R$ 250/mês.  
> 3. **Plano Anual Econômico (Mais Vantajoso):** R$ 3.490/ano à vista (você paga 10 meses e ganha 2 meses grátis, saindo a R$ 290/mês).  
> 
> *Qual desses formatos se encaixa melhor no momento atual da sua empresa?"*

---

## 🛡️ Checklist Anti-Erro Antes de Ligar os Anúncios

- [x] O sistema está hospedado e abre perfeitamente no celular e no computador.
- [x] O botão de WhatsApp do anúncio cai no seu número correto com mensagem padrão configurada.
- [x] O banco Firebase está conectado (ou o backup JSON testado e funcionando).
- [x] A página da proposta comercial ([`proposta-comercial.html`](file:///c:/Users/rrenx/.antigravity-ide/uniformes-erp/proposta-comercial.html)) imprime limpa sem cabeçalhos quebrados.
- [x] Você tem o script de vendas aberto no computador para responder em menos de 5 minutos quem chamar do anúncio.
