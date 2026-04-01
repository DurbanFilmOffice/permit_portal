import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true
  return new Date() > expiresAt
}

export function getVerificationTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24)
  return expiry
}