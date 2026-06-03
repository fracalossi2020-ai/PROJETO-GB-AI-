# GB.AI - Plataforma SaaS de Delivery

Plataforma completa de delivery e gestão de pedidos para restaurantes, lanchonetes, pizzarias e mais.

## 🚀 Como rodar

```bash
cd gbai-saas
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

## 🌐 Acessos

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/login | Login |
| http://localhost:3000/cadastro | Cadastro |
| http://localhost:3000/setup/step-1-dados | Onboarding wizard |
| http://localhost:3000/dashboard | Painel admin |
| http://localhost:3000/burger-king-gb | Cardápio público |

## 🔐 Login de teste
```
E-mail: admin@gbai.com
Senha: admin123
```

## ✨ Funcionalidades

### Onboarding (6 passos)
1. Dados do estabelecimento
2. Formas de pagamento
3. Horário de funcionamento
4. Cardápio (templates + IA)
5. Configuração de delivery
6. Estrutura de salão

### Painel Admin
- Dashboard com métricas
- Gerenciamento de pedidos (Kanban)
- Editor de cardápio
- Lista de clientes
- Financeiro
- Configurações (WhatsApp, iFood)

### Cardápio Público
- Design mobile-first
- Carrinho com adicionais
- Checkout em 3 passos
- Rastreamento de pedido

## 🎨 Design
- Cor primária: #ff9607 (laranja)
- Cor secundária: #000000 (preto)
- Moderno, tecnológico e interativo
