import crypto from 'crypto';

export function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generarExpiracion() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}