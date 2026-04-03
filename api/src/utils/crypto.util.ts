import type { UUID } from 'node:crypto'
import { createHash, randomUUID } from 'node:crypto'

import { compare, hash } from 'bcryptjs'

/** Crypto helpers for passwords and token values. */
export const CryptoUtil = {
  /** Hashes a token or password. */
  async hash(token: string): Promise<string> {
    return await hash(token, 12)
  },

  /** Compares two hashed values. */
  async compare(token1: string, token2: string): Promise<boolean> {
    return await compare(token1, token2)
  },

  /** Generates a UUID. */
  genUuid(): UUID {
    return randomUUID()
  },

  /** Creates a SHA-256 hash. */
  sha256(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  },
}
