export interface CreateProductDto {
  typeId: string;
  statusId: string;
  proveedorId?: string;
  marca: string;
  modelo?: string;
  especificacion?: string;
  precioUnitario: number;
}

export interface CreateMovementDto {
  typeId: string;
  quantity: number;
  unitPrice: number;
  costCenterId: string;
  direction: 'IN' | 'OUT';
}
