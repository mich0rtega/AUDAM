import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RequisitionWithDetails } from '../requisitions/requisitions.types';
import { MovementWithDetails } from '../movements/movements.types';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

// Tipo auxiliar para los detalles de movimiento
type MovementDetail = MovementWithDetails['details'][0];

export class PDFGeneratorService {

  static async generateRequisitionPDF(
    requisition: RequisitionWithDetails,
    environmentName: string
  ): Promise<Buffer> {

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // ENCABEZADO
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`COMUNIDAD ${environmentName.toUpperCase()}`, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(14)
       .text('REQUISICIÓN DE MATERIALES', { align: 'center' })
       .moveDown(0.3);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Folio: ${requisition.folio}`, { align: 'center' })
       .moveDown(0.2);

    doc.text(`Fecha: ${format(new Date(requisition.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, { align: 'center' })
       .moveDown(1);

    // INFORMACIÓN
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('INFORMACIÓN GENERAL', { underline: true })
       .moveDown(0.5);

    doc.font('Helvetica')
       .fontSize(10);

    doc.text(`Solicitante: ${requisition.solicitorName || 'N/A'}`, { continued: false })
       .text(`Destino: ${requisition.destination?.name || 'N/A'}`)
       .text(`Estado: ${requisition.status?.name || 'N/A'}`)
       .moveDown(1);

    if (requisition.observations) {
      doc.text(`Observaciones: ${requisition.observations}`)
         .moveDown(1);
    }

    // TABLA DE PRODUCTOS
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('DETALLE DE PRODUCTOS', { underline: true })
       .moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [40, 200, 80, 80, 90];
    const headers = ['No.', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'];

    let currentX = 50;
    doc.fontSize(10).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: colWidths[i], align: 'center' });
      currentX += colWidths[i];
    });

    doc.moveTo(50, tableTop + 15)
       .lineTo(540, tableTop + 15)
       .stroke();

    // Filas
    doc.font('Helvetica').fontSize(9);
    let rowY = tableTop + 20;
    let totalGeneral = 0;

    requisition.details.forEach((detail, index) => {
      currentX = 50;
      
      doc.text((index + 1).toString(), currentX, rowY, { width: colWidths[0], align: 'center' });
      currentX += colWidths[0];
      
      const productName = `${detail.product.marca} ${detail.product.modelo || ''}`.trim();
      doc.text(productName, currentX, rowY, { width: colWidths[1] });
      currentX += colWidths[1];
      
      doc.text(detail.quantity.toString(), currentX, rowY, { width: colWidths[2], align: 'center' });
      currentX += colWidths[2];
      
      const unitPrice = Number(detail.unitPrice) || 0;
      doc.text(this.formatCurrency(unitPrice), currentX, rowY, { width: colWidths[3], align: 'right' });
      currentX += colWidths[3];
      
      const subtotal = detail.quantity * unitPrice;
      totalGeneral += subtotal;
      doc.text(this.formatCurrency(subtotal), currentX, rowY, { width: colWidths[4], align: 'right' });
      
      rowY += 20;

      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }
    });

    // Total
    doc.moveTo(50, rowY)
       .lineTo(540, rowY)
       .stroke();

    rowY += 10;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('TOTAL:', 370, rowY)
       .text(this.formatCurrency(totalGeneral), 460, rowY, { align: 'right' });

    // Firmas
    doc.moveDown(3);
    const signatureY = doc.y + 50;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('_____________________', 100, signatureY, { align: 'center', width: 150 })
       .text('Solicitante', 100, signatureY + 20, { align: 'center', width: 150 });

    doc.text('_____________________', 350, signatureY, { align: 'center', width: 150 })
       .text('Autorizado por', 350, signatureY + 20, { align: 'center', width: 150 });

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }


  static async generateMovementPDF(
    movement: MovementWithDetails,
    environmentName: string
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // ENCABEZADO
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`COMUNIDAD ${environmentName.toUpperCase()}`, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(14)
       .text('MOVIMIENTO DE ALMACÉN', { align: 'center' })
       .moveDown(0.3);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Fecha: ${format(new Date(movement.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, { align: 'center' })
       .moveDown(1);

    // INFORMACIÓN
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('INFORMACIÓN GENERAL', { underline: true })
       .moveDown(0.5);

    doc.font('Helvetica')
       .fontSize(10);

    doc.text(`Tipo de Movimiento: ${movement.type?.name || 'N/A'}`, { continued: false })
       .text(`Dirección: ${movement.type?.direction === 'IN' ? 'ENTRADA' : 'SALIDA'}`)
       .text(`Responsable: ${movement.responsible?.email || 'N/A'}`)
       .text(`Centro de Costo: ${movement.costCenter?.name || 'N/A'}`)
       .moveDown(1);

    if (movement.observations) {
      doc.text(`Observaciones: ${movement.observations}`)
         .moveDown(1);
    }

    // TABLA DE PRODUCTOS
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('DETALLE DE PRODUCTOS', { underline: true })
       .moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [40, 200, 80, 80, 90];
    const headers = ['No.', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'];

    let currentX = 50;
    doc.fontSize(10).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: colWidths[i], align: 'center' });
      currentX += colWidths[i];
    });

    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    // Filas
    doc.font('Helvetica').fontSize(9);
    let rowY = tableTop + 20;

    movement.details.forEach((detail: MovementDetail, index: number) => {
      currentX = 50;
      
      doc.text((index + 1).toString(), currentX, rowY, { width: colWidths[0], align: 'center' });
      currentX += colWidths[0];
      
      const productName = `${detail.product.marca} ${detail.product.modelo || ''}`.trim();
      doc.text(productName, currentX, rowY, { width: colWidths[1] });
      currentX += colWidths[1];
      
      doc.text(detail.quantity.toString(), currentX, rowY, { width: colWidths[2], align: 'center' });
      currentX += colWidths[2];
      
      const unitPrice = Number(detail.unitPrice) || 0;
      doc.text(`$${unitPrice.toFixed(2)}`, currentX, rowY, { width: colWidths[3], align: 'right' });
      currentX += colWidths[3];
      
      const subtotal = detail.quantity * unitPrice;
      doc.text(`$${subtotal.toFixed(2)}`, currentX, rowY, { width: colWidths[4], align: 'right' });
      
      rowY += 20;

      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }
    });

    // Firmas
    doc.moveDown(3);
    const signatureY = doc.y + 50;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('_____________________', 100, signatureY, { align: 'center', width: 150 })
       .text('Responsable', 100, signatureY + 20, { align: 'center', width: 150 });

    doc.text('_____________________', 350, signatureY, { align: 'center', width: 150 })
       .text('Recibido por', 350, signatureY + 20, { align: 'center', width: 150 });

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  static sendPDFResponse(res: Response, pdfBuffer: Buffer, filename: string) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }

  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }
}
