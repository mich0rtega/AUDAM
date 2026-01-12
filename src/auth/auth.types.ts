export enum Environment {
  AUDAM = 'AUDAM',
  COMUNIDAD = 'COMUNIDAD',
}

export enum Role {
  ADMIN = 'ADMIN',
  ALMACEN = 'ALMACEN',
  AUTORIZADOR = 'AUTORIZADOR',
  COMPRAS = 'COMPRAS',
  USUARIO = 'USUARIO',
}

export interface JwtBasePayload {
  userId: string;
}

export interface JwtContextPayload extends JwtBasePayload {
  environment: Environment;
  role: Role;
}
