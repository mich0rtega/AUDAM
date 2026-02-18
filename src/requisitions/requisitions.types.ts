import { Requisition, RequisitionDetail, RequisitionStatus, CostCenter, Product, User } from '@prisma/client';

export interface CreateRequisitionDto {
  folio: string;
  solicitorId: string;
  solicitorName: string;
  destinationId: string; 
  statusId: string;
  details: RequisitionDetailDto[];
}

export interface RequisitionDetailDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
  observations?: string;
}

export interface UpdateRequisitionDto {
  statusId?: string;
  authorizerId?: string | null;  // ← Cambiado para aceptar null
  observations?: string;
}

export interface AuthorizeRequisitionDto {
  authorizerId: string;
  approved: boolean;
  observations?: string;
}

export interface RequisitionFilters {
  statusId?: string;
  solicitorId?: string;
  startDate?: Date;
  endDate?: Date;
  folio?: string;
  costCenterId?: string;
}

export interface RequisitionWithDetails extends Requisition {
  status: RequisitionStatus;
  destination: CostCenter;
  requester: Pick<User, 'email'>;
  authorizer?: Pick<User, 'email'> | null;
  details: (RequisitionDetail & {
    product: Pick<Product, 'marca' | 'modelo' | 'sku' | 'unit'>;
  })[];
}