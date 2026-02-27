# Agenda Pro Serviços

Aplicativo web completo para gestão de agenda de prestadores de serviço (técnicos, manutenção, instalações, visitas técnicas etc.).

## Stack

- **Frontend:** Next.js + React + TypeScript
- **UI:** Tailwind CSS
- **Backend:** API REST com Route Handlers do Next.js (Node.js)
- **Banco:** SQLite com Prisma ORM
- **Estado de dados:** React Query

## Funcionalidades

- Calendário anual com visualização por **dia / semana / mês / ano**
- Cadastro, edição, exclusão e conclusão de serviços
- Regra de conflito de horário (bloqueia sobreposição)
- Dashboard com métricas financeiras e operacionais
- Filtros por cliente, tipo, data, status + busca rápida
- Cores por tipo de serviço
- Notificação de serviços do dia ao abrir o app
- Exportação:
  - Agenda em PDF
  - Lista de serviços (CSV)
  - Relatório financeiro mensal (JSON)

## Estrutura de dados (Service)

- id
- nomeCliente
- telefoneCliente (opcional)
- tipoServico (enum)
- dataServico
- horaInicio
- horaFim
- localServico
- enderecoCompleto
- valorServico
- observacoes
- status (agendado/concluido/cancelado)
- createdAt
- updatedAt

## Como executar

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Acesse: `http://localhost:3000`

## Endpoints principais

- `GET /api/services` (lista + filtros)
- `POST /api/services` (criar serviço)
- `GET /api/services/:id`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/dashboard`
- `GET /api/export/pdf`
- `GET /api/export/services`
- `GET /api/export/monthly?month=10&year=2026`

## Produção

```bash
npm run build
npm start
```
