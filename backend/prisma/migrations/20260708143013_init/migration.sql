-- CreateEnum
CREATE TYPE "RolAdmin" AS ENUM ('admin');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('Lima', 'Norte', 'Sur', 'Centro');

-- CreateEnum
CREATE TYPE "TipoEmpresa" AS ENUM ('TECPORT', 'Cliente', 'Partner', 'Logistica', 'Portuaria', 'Otra');

-- CreateEnum
CREATE TYPE "NivelOperador" AS ENUM ('Principiante', 'Intermedio', 'Avanzado', 'Maestro');

-- CreateEnum
CREATE TYPE "EstadoCertificacion" AS ENUM ('vigente', 'por_vencer', 'vencido', 'inactivo');

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" UUID NOT NULL,
    "auth_user_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolAdmin" NOT NULL DEFAULT 'admin',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "tipo_empresa" "TipoEmpresa" NOT NULL,
    "region" "Region" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operadores" (
    "id" UUID NOT NULL,
    "codigo_operador" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "fecha_nacimiento" DATE,
    "celular" TEXT,
    "correo" TEXT,
    "linkedin" TEXT,
    "region" "Region" NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nivel" "NivelOperador" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "motivo_inactivo" TEXT,
    "fecha_inactivacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificaciones" (
    "id" UUID NOT NULL,
    "operador_id" UUID NOT NULL,
    "equipo_id" UUID NOT NULL,
    "nombre_certificacion" TEXT NOT NULL,
    "entidad_emisora" TEXT NOT NULL,
    "fecha_emision" DATE,
    "fecha_vencimiento" DATE NOT NULL,
    "estado" "EstadoCertificacion" NOT NULL DEFAULT 'vigente',
    "archivo_url" TEXT,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_auth_user_id_key" ON "admin_profiles"("auth_user_id");

-- CreateIndex
CREATE INDEX "empresas_region_idx" ON "empresas"("region");

-- CreateIndex
CREATE INDEX "empresas_tipo_empresa_idx" ON "empresas"("tipo_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_nombre_key" ON "equipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "operadores_codigo_operador_key" ON "operadores"("codigo_operador");

-- CreateIndex
CREATE UNIQUE INDEX "operadores_dni_key" ON "operadores"("dni");

-- CreateIndex
CREATE INDEX "operadores_empresa_id_idx" ON "operadores"("empresa_id");

-- CreateIndex
CREATE INDEX "operadores_region_idx" ON "operadores"("region");

-- CreateIndex
CREATE INDEX "operadores_activo_idx" ON "operadores"("activo");

-- CreateIndex
CREATE INDEX "operadores_nivel_idx" ON "operadores"("nivel");

-- CreateIndex
CREATE INDEX "certificaciones_operador_id_idx" ON "certificaciones"("operador_id");

-- CreateIndex
CREATE INDEX "certificaciones_equipo_id_idx" ON "certificaciones"("equipo_id");

-- CreateIndex
CREATE INDEX "certificaciones_estado_idx" ON "certificaciones"("estado");

-- CreateIndex
CREATE INDEX "certificaciones_fecha_vencimiento_idx" ON "certificaciones"("fecha_vencimiento");

-- AddForeignKey
ALTER TABLE "operadores" ADD CONSTRAINT "operadores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "operadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
