import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const EXCLUDED_PATHS = new Set(['/auth/login']);

const isProduction = process.env.NODE_ENV === 'production';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(res: Response, csrfToken?: string) {
  const token = csrfToken ?? generateCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'none',
    secure: isProduction
  });

  return token;
}

export function clearCsrfCookie(res: Response) {
  res.clearCookie(CSRF_COOKIE_NAME);
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (EXCLUDED_PATHS.has(req.path)) {
    return next();
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.header(CSRF_HEADER_NAME);

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      message: 'CSRF token faltante'
    });
  }

  if (!safeCompare(csrfCookie, csrfHeader)) {
    return res.status(403).json({
      message: 'CSRF token inválido'
    });
  }

  return next();
}

export const csrfConfig = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME
};