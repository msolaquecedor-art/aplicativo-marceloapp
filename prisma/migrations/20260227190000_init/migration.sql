-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "telefoneCliente" TEXT,
    "tipoServico" TEXT NOT NULL,
    "dataServico" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "localServico" TEXT NOT NULL,
    "enderecoCompleto" TEXT NOT NULL,
    "valorServico" REAL NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Service_dataServico_horaInicio_horaFim_idx" ON "Service"("dataServico", "horaInicio", "horaFim");

-- CreateIndex
CREATE INDEX "Service_nomeCliente_idx" ON "Service"("nomeCliente");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");
