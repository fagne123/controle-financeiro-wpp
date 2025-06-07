# Sistema de Registro e Anu00e1lise de Gastos Pessoais via WhatsApp

## Visu00e3o Geral
Este sistema foi projetado para registrar gastos pessoais atravu00e9s de uma API REST e disponibilizu00e1-los para anu00e1lise em uma interface web. A fonte primu00e1ria de dados u00e9 um fluxo de automau00e7u00e3o no n8n que captura mensagens do WhatsApp, processa-as com IA e envia as informau00e7u00f5es estruturadas para o sistema.

## Arquitetura do Sistema
O sistema opera com uma arquitetura dual:

1. **Backend de Registro (API)**: Componente que recebe dados via API REST, processa e armazena os registros financeiros.

2. **Interface Web de Anu00e1lise**: Sistema que permite visualizar, analisar e gerenciar os dados armazenados, oferecendo insights sobre padru00f5es de gastos.

## Como Executar

### Pru00e9-requisitos
- Node.js v14 ou superior
- MongoDB instalado e em execuu00e7u00e3o

### Instalau00e7u00e3o

1. Clone o repositu00f3rio
```bash
git clone [url-do-repositorio]
cd controle-financeiro-wpp
```

2. Instale as dependu00eancias
```bash
npm install
```

3. Configure as variu00e1veis de ambiente
Crie um arquivo `.env` na raiz do projeto seguindo o exemplo do arquivo `.env.example`.

4. Inicie o servidor
```bash
npm run dev  # Para desenvolvimento com auto-reload
# ou
npm start     # Para produu00e7u00e3o
```

## Endpoints da API

### Registrar nova transau00e7u00e3o
- **URL**: `/api/transactions`
- **Mu00e9todo**: `POST`
- **Autenticau00e7u00e3o**: Token JWT Bearer na header
- **Body**:
```json
{
  "value": 50.00,
  "date": "2025-05-01T14:30:00Z",
  "category": "moradia",
  "subcategory": "gu00e1s",
  "description": "Recarga de botiju00e3o"
}
```

### Obter transau00e7u00f5es
- **URL**: `/api/transactions`
- **Mu00e9todo**: `GET`
- **Autenticau00e7u00e3o**: Token JWT Bearer na header
- **Query Params (opcionais)**:
  - `startDate`: Data inicial (YYYY-MM-DD)
  - `endDate`: Data final (YYYY-MM-DD)
  - `category`: Filtrar por categoria
  - `subcategory`: Filtrar por subcategoria

### Obter resumo de gastos
- **URL**: `/api/transactions/summary`
- **Mu00e9todo**: `GET`
- **Autenticau00e7u00e3o**: Token JWT Bearer na header
- **Query Params (opcionais)**:
  - `startDate`: Data inicial (YYYY-MM-DD)
  - `endDate`: Data final (YYYY-MM-DD)

## Estrutura de Categorizau00e7u00e3o
O sistema utiliza uma estrutura hieru00e1rquica para organizar os gastos:

```
comida/
u251cu2500u2500 mercado
u251cu2500u2500 restaurante
u2514u2500u2500 delivery

moradia/
u251cu2500u2500 aluguel
u251cu2500u2500 energia
u251cu2500u2500 agua
u251cu2500u2500 internet
u251cu2500u2500 gu00e1s
u251cu2500u2500 agua de beber
u2514u2500u2500 imprevistos

transporte/
u251cu2500u2500 gasolina
u2514u2500u2500 oficina

lazer/
u251cu2500u2500 cigarro
u251cu2500u2500 bebedeira
u251cu2500u2500 roupas
u251cu2500u2500 cabelereiro
u2514u2500u2500 academia

trabalho/
u2514u2500u2500 ferramentas

financeiro/
u251cu2500u2500 cartu00e3o de credito
u2514u2500u2500 agiota
```

## Tecnologias Utilizadas

### Backend
- Node.js com Express.js
- MongoDB com Mongoose
- JSON Web Tokens (JWT) para autenticau00e7u00e3o

### Frontend
- HTML5, CSS3 e JavaScript
- Bootstrap 5 para interface responsiva
- Chart.js para visualizau00e7u00f5es gru00e1ficas

## Desenvolvedores
- [Seu Nome] - Desenvolvedor Full Stack
