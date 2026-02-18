export interface CreateMovementDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  observations?: string;
}

export interface CreateMovementDto {
  typeId: string;
  responsibleId: string;
  costCenterId?: string;
  observations?: string;
  details: CreateMovementDetailDto[];
}

export interface UpdateMovementDto {
  typeId?: string;
  responsibleId?: string;
  costCenterId?: string;
  observations?: string;
}

// Interfaz que faltaba para pdf-generator
export interface MovementWithDetails {
  id: string;
  environmentId: string;
  typeId: string;
  responsibleId: string;
  costCenterId?: string | null;
  observations?: string | null;
  createdAt: Date;
  type: {
    id: string;
    name: string;
    direction: 'IN' | 'OUT';
  };
  responsible: {
    id: string;
    email: string;
  };
  costCenter?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  details: {
    id: string;
    movementId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    observations?: string | null;
    product: {
      id: string;
      marca: string;
      modelo?: string | null;
      sku?: string | null;
      unit?: string | null;
      especificacion?: string | null;
    };
  }[];
}