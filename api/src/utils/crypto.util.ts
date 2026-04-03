import type { UUID } from 'node:crypto'
import { createHash, randomUUID } from 'node:crypto'

import { compare, hash } from 'bcryptjs'

export const CryptoUtil = {
  async hash(token: string): Promise<string> {
    return await hash(token, 12)
  },

  async compare(token1: string, token2: string): Promise<boolean> {
    return await compare(token1, token2)
  },

  genUuid(): UUID {
    return randomUUID()
  },

  sha256(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  },
}
