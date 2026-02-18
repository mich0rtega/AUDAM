import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';

type GroupedCount = {
  key: string;
  quantity: number;
};

export class DashboardService {

  static async overview(environmentId: string, role: Role) {
    if (role === Role.ADMIN) {
      return this.adminOverview(environmentId);
    }

    if (role === Role.ALMACEN) {
      return this.almacenOverview(environmentId);
    }

    if (role === Role.AUTORIZADOR) {
      return this.autorizadorOverview(environmentId);
    }

    if (role === Role.COMPRAS) {
      return this.comprasOverview(environmentId);
    }

    return { message: 'Rol sin dashboard configurado' };
  }

  private static async adminOverview(environmentId: string) {
    const [
      consumoPorCentroCosto,
      movimientosPorTipo,
      productosBajoStock,
      entradasPorOrigen,
      salidasPorDestino,
      historialRequisiciones
    ] = await Promise.all([
      this.getConsumptionByCostCenter(environmentId),
      this.getMovementsByDirection(environmentId),
      this.getLowStockProducts(environmentId),
      this.getEntriesByOrigin(environmentId),
      this.getExitsByDestination(environmentId),
      this.getRequisitionHistory(environmentId)
    ]);

    return {
      role: Role.ADMIN,
      consumoPorCentroCosto,
      movimientosPorTipo,
      productosBajoStock,
      entradasPorOrigen,
      salidasPorDestino,
      historialRequisiciones
    };
  }

  private static async almacenOverview(environmentId: string) {
    const [
      movimientosDiarios,
      stockPorUbicacion,
      productosBajoStock,
      requisicionesRecibidasDesdeOtroAserradero,
      requisicionesSolicitadasPorMilpillas,
      analisisEntrada,
      productosConMasMovimientos
    ] = await Promise.all([
      this.getDailyMovements(environmentId),
      this.getStockByLocation(environmentId),
      this.getLowStockProducts(environmentId),
      this.getRequisitionsBySolicitorPattern(environmentId, 'aserradero'),
      this.getRequisitionsBySolicitorPattern(environmentId, 'milpillas'),
      this.getEntryAnalysis(environmentId),
      this.getTopProductsByMovements(environmentId)
    ]);

    return {
      role: Role.ALMACEN,
      movimientosDiarios,
      stockPorUbicacion,
      productosBajoStock,
      requisicionesRecibidasDesdeOtroAserradero,
      requisicionesSolicitadasPorMilpillas,
      analisisEntrada,
      productosConMasMovimientos
    };
  }

  private static async autorizadorOverview(environmentId: string) {
    const [
      requisicionesPendientes,
      consumoPorCentroCosto,
      picosPorTemporada
    ] = await Promise.all([
      this.getPendingRequisitions(environmentId),
      this.getConsumptionByCostCenter(environmentId),
      this.getSeasonalPeaks(environmentId)
    ]);

    return {
      role: Role.AUTORIZADOR,
      requisicionesPendientes,
      consumoPorCentroCosto,
      picosPorTemporada
    };
  }

  private static async comprasOverview(environmentId: string) {
    const [
      entradasYSalidasConsumidasPorMes,
      comunidad
    ] = await Promise.all([
      this.getMonthlyInOut(environmentId),
      this.getComunidadOverview(environmentId)
    ]);

    return {
      role: Role.COMPRAS,
      entradasYSalidasConsumidasPorMes,
      comunidad
    };
  }

  private static async getConsumptionByCostCenter(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      name: string;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        COALESCE(cc.name, 'SIN CENTRO DE COSTO') AS name,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      LEFT JOIN "CostCenter" cc ON cc.id = m."costCenterId"
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'OUT'
      GROUP BY COALESCE(cc.name, 'SIN CENTRO DE COSTO')
      ORDER BY quantity DESC
    `);

    return rows.map((r) => ({
      centroCosto: r.name,
      quantity: Number(r.quantity)
    }));
  }

  private static async getMovementsByDirection(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      direction: string;
      quantity: bigint;
      movements: bigint;
    }>>(Prisma.sql`
      SELECT
        mt.direction,
        COALESCE(SUM(md.quantity), 0) AS quantity,
        COUNT(DISTINCT m.id) AS movements
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      WHERE m."environmentId" = ${environmentId}
      GROUP BY mt.direction
      ORDER BY mt.direction ASC
    `);

    return rows.map((r) => ({
      direction: r.direction,
      quantity: Number(r.quantity),
      movimientos: Number(r.movements)
    }));
  }

  private static getLowStockProducts(environmentId: string, threshold = 10) {
    return prisma.product.findMany({
      where: {
        environmentId,
        stockActual: { lte: threshold },
        isActive: true
      },
      orderBy: { stockActual: 'asc' },
      take: 20,
      select: {
        id: true,
        marca: true,
        modelo: true,
        stockActual: true,
        unit: true,
        sku: true
      }
    });
  }

  private static async getEntriesByOrigin(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      key: string;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        COALESCE(mt.name, 'SIN ORIGEN') AS key,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'IN'
      GROUP BY COALESCE(mt.name, 'SIN ORIGEN')
      ORDER BY quantity DESC
    `);

    return this.normalizeGroupedRows(rows);
  }

  private static async getExitsByDestination(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      key: string;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        COALESCE(cc.name, 'SIN DESTINO') AS key,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      LEFT JOIN "CostCenter" cc ON cc.id = m."costCenterId"
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'OUT'
      GROUP BY COALESCE(cc.name, 'SIN DESTINO')
      ORDER BY quantity DESC
    `);

    return this.normalizeGroupedRows(rows);
  }

  private static getRequisitionHistory(environmentId: string) {
    return prisma.requisition.findMany({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        status: { select: { name: true } },
        destination: { select: { id: true, name: true, code: true } },
        requester: { select: { id: true, email: true } }
      }
    });
  }

  private static async getDailyMovements(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      date: Date;
      entradas: bigint;
      salidas: bigint;
    }>>(Prisma.sql`
      SELECT
        DATE(m."createdAt") AS date,
        COALESCE(SUM(CASE WHEN mt.direction = 'IN' THEN md.quantity ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN mt.direction = 'OUT' THEN md.quantity ELSE 0 END), 0) AS salidas
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      WHERE m."environmentId" = ${environmentId}
      GROUP BY DATE(m."createdAt")
      ORDER BY DATE(m."createdAt") DESC
      LIMIT 30
    `);

    return rows.map((r) => ({
      date: r.date,
      entradas: Number(r.entradas),
      salidas: Number(r.salidas)
    }));
  }

  private static async getStockByLocation(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      key: string;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        COALESCE(cc.name, 'ALMACEN GENERAL') AS key,
        COALESCE(SUM(
          CASE
            WHEN mt.direction = 'IN' THEN md.quantity
            WHEN mt.direction = 'OUT' THEN -md.quantity
            ELSE 0
          END
        ), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      LEFT JOIN "CostCenter" cc ON cc.id = m."costCenterId"
      WHERE m."environmentId" = ${environmentId}
      GROUP BY COALESCE(cc.name, 'ALMACEN GENERAL')
      ORDER BY quantity DESC
    `);

    return this.normalizeGroupedRows(rows);
  }

  private static getRequisitionsBySolicitorPattern(environmentId: string, pattern: string) {
    return prisma.requisition.findMany({
      where: {
        environmentId,
        solicitorName: {
          contains: pattern,
          mode: 'insensitive'
        }
      },
      include: {
        status: { select: { name: true } },
        destination: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  private static async getEntryAnalysis(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      key: string;
      quantity: bigint;
      total: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT
        COALESCE(pt.name, 'SIN TIPO') AS key,
        COALESCE(SUM(md.quantity), 0) AS quantity,
        COALESCE(SUM(md.quantity * md."unitPrice"), 0) AS total
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      INNER JOIN "Product" p ON p.id = md."productId"
      LEFT JOIN "ProductType" pt ON pt.id = p."typeId"
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'IN'
      GROUP BY COALESCE(pt.name, 'SIN TIPO')
      ORDER BY quantity DESC
    `);

    return rows.map((r) => ({
      categoria: r.key,
      quantity: Number(r.quantity),
      total: Number(r.total)
    }));
  }

  private static async getTopProductsByMovements(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      productId: string;
      marca: string;
      modelo: string | null;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        p.id AS "productId",
        p.marca,
        p.modelo,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      INNER JOIN "Product" p ON p.id = md."productId"
      WHERE m."environmentId" = ${environmentId}
      GROUP BY p.id, p.marca, p.modelo
      ORDER BY quantity DESC
      LIMIT 15
    `);

    return rows.map((r) => ({
      productId: r.productId,
      producto: `${r.marca}${r.modelo ? ` ${r.modelo}` : ''}`,
      quantity: Number(r.quantity)
    }));
  }

  private static getPendingRequisitions(environmentId: string) {
    return prisma.requisition.findMany({
      where: {
        environmentId,
        status: {
          name: {
            contains: 'pendiente',
            mode: 'insensitive'
          }
        }
      },
      include: {
        destination: { select: { name: true } },
        requester: { select: { email: true } },
        status: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 40
    });
  }

  private static async getSeasonalPeaks(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      month: Date;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        DATE_TRUNC('month', m."createdAt") AS month,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'OUT'
      GROUP BY DATE_TRUNC('month', m."createdAt")
      ORDER BY quantity DESC
      LIMIT 12
    `);

    return rows.map((r) => ({
      month: r.month,
      quantity: Number(r.quantity)
    }));
  }

  private static async getMonthlyInOut(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      month: Date;
      entradas: bigint;
      salidas: bigint;
    }>>(Prisma.sql`
      SELECT
        DATE_TRUNC('month', m."createdAt") AS month,
        COALESCE(SUM(CASE WHEN mt.direction = 'IN' THEN md.quantity ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN mt.direction = 'OUT' THEN md.quantity ELSE 0 END), 0) AS salidas
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      WHERE m."environmentId" = ${environmentId}
      GROUP BY DATE_TRUNC('month', m."createdAt")
      ORDER BY DATE_TRUNC('month', m."createdAt") DESC
      LIMIT 12
    `);

    return rows.map((r) => ({
      month: r.month,
      entradas: Number(r.entradas),
      salidas: Number(r.salidas)
    }));
  }

  private static async getComunidadOverview(environmentId: string) {
    const [
      salidas,
      productosMasUsados,
      entradas
    ] = await Promise.all([
      this.getExitsByDestination(environmentId),
      this.getTopProductsByOutMovements(environmentId),
      this.getEntriesByOrigin(environmentId)
    ]);

    return {
      salidas,
      productosMasUsados,
      entradas
    };
  }

  private static async getTopProductsByOutMovements(environmentId: string) {
    const rows = await prisma.$queryRaw<Array<{
      key: string;
      quantity: bigint;
    }>>(Prisma.sql`
      SELECT
        CONCAT(p.marca, COALESCE(CONCAT(' ', p.modelo), '')) AS key,
        COALESCE(SUM(md.quantity), 0) AS quantity
      FROM "Movement" m
      INNER JOIN "MovementType" mt ON mt.id = m."typeId"
      INNER JOIN "MovementDetail" md ON md."movementId" = m.id
      INNER JOIN "Product" p ON p.id = md."productId"
      WHERE m."environmentId" = ${environmentId}
        AND mt.direction = 'OUT'
      GROUP BY CONCAT(p.marca, COALESCE(CONCAT(' ', p.modelo), ''))
      ORDER BY quantity DESC
      LIMIT 10
    `);

    return this.normalizeGroupedRows(rows);
  }

  private static normalizeGroupedRows(
    rows: Array<{ key: string; quantity: bigint }>
  ): GroupedCount[] {
    return rows.map((r) => ({
      key: r.key,
      quantity: Number(r.quantity)
    }));
  }

}
