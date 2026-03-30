import { describe, expect, it } from 'vitest'
import { publicColumns, UserInsertSchema, UserSelectSchema, UserUpdateSchema } from './user.schema'

describe('userSchema', () => {
  describe('insert validation', () => {
    it('accepts valid payload', () => {
      const payload = {
        firstName: 'brian',
        lastName: 'adams',
        username: 'adams1',
        email: 'adams@mail.com',
      }

      const result = UserInsertSchema.safeParse(payload)

      expect(result.success).toBe(true)
    })

    describe('username boundaries', () => {
      const tests = [
        { username: 'adam', valid: false, desc: 'shorter than 5 chars' },
        { username: 'abcde', valid: true, desc: 'exactly 5 chars' },
        { username: 'a'.repeat(255), valid: true, desc: 'exactly 255 chars' },
        { username: 'a'.repeat(256), valid: false, desc: 'longer than 255 chars' },
      ]

      tests.forEach(({ username, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} username ${desc}`, () => {
          const payload = {
            username,
            firstName: 'Brian',
            lastName: 'Adams',
            email: 'adams@mail.com',
          }
          const result = UserInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    describe('firstName boundaries', () => {
      const tests = [
        { firstName: '', valid: false, desc: 'shorter than 1 char' },
        { firstName: 'a', valid: true, desc: 'exactly 1 chars' },
        { firstName: 'a'.repeat(255), valid: true, desc: 'exactly 255 chars' },
        { firstName: 'a'.repeat(256), valid: false, desc: 'longer than 255 chars' },
      ]

      tests.forEach(({ firstName, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} firstName ${desc}`, () => {
          const payload = {
            firstName,
            username: 'badams',
            lastName: 'Adams',
            email: 'adams@mail.com',
          }
          const result = UserInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    describe('lastName boundaries', () => {
      const tests = [
        { lastName: '', valid: false, desc: 'shorter than 1 char' },
        { lastName: 'a', valid: true, desc: 'exactly 1 chars' },
        { lastName: 'a'.repeat(255), valid: true, desc: 'exactly 255 chars' },
        { lastName: 'a'.repeat(256), valid: false, desc: 'longer than 255 chars' },
      ]

      tests.forEach(({ lastName, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} lastName ${desc}`, () => {
          const payload = {
            lastName,
            username: 'badams',
            firstName: 'brian',
            email: 'adams@mail.com',
          }
          const result = UserInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    describe('email validation', () => {
      const tests = [
        { email: '', valid: false, desc: 'empty string' },
        { email: 'a', valid: false, desc: 'too short' },
        { email: 'invalid', valid: false, desc: 'invalid format' },
        { email: 'user@mail.com', valid: true, desc: 'valid email' },
        {
          email: `${'a'.repeat(245)}@x.com`,
          valid: true,
          desc: '255 chars max',
        },
        {
          email: `${'a'.repeat(250)}@x.com`,
          valid: false,
          desc: 'longer than 255 chars',
        },
      ]

      tests.forEach(({ email, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} email ${desc}`, () => {
          const payload = {
            username: 'adams1',
            firstName: 'Brian',
            lastName: 'Adams',
            email,
          }
          const result = UserInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    it('rejects password in insert', () => {
      const USER_1 = {
        username: 'adams',
        firstName: 'brian',
        lastName: 'adams',
        email: 'badam@mail.com',
        password: 'qwertz123',
      }

      const result = UserInsertSchema.safeParse(USER_1)

      expect(result.success).toBe(false)
    })

    it('rejects createdAt in insert', () => {
      const USER_1 = {
        firstName: 'brian',
        lastName: 'adams',
        username: 'adams',
        email: 'badam@mail.com',
        createdAt: new Date().toISOString(),
      }

      const result = UserInsertSchema.safeParse(USER_1)

      expect(result.success).toBe(false)
    })

    it('rejects updatedAt in insert', () => {
      const USER_1 = {
        firstName: 'brian',
        lastName: 'adams',
        username: 'adams',
        email: 'badam@mail.com',
        updatedAt: new Date().toISOString(),
      }

      const result = UserInsertSchema.safeParse(USER_1)

      expect(result.success).toBe(false)
    })

    it('rejects missing required fields', () => {
      const result = UserInsertSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('rejects unknown fields', () => {
      const payload = {
        firstName: 'brian',
        lastName: 'adams',
        username: 'adams1',
        email: 'adams@mail.com',
        role: 'admin',
      }

      const result = UserInsertSchema.safeParse(payload)

      expect(result.success).toBe(false)
    })
  })

  describe('update validation', () => {
    it('allows partial updates', () => {
      const payload = {
        username: 'adams',
      }

      const result = UserUpdateSchema.safeParse(payload)

      expect(result.success).toBe(true)
    })
  })

  describe('public shape', () => {
    it('public columns do not include password', () => {
      expect(publicColumns).not.toHaveProperty('password')
    })

    it('rejects password in select', () => {
      const USER_1 = {
        username: 'adams',
        firstName: 'brian',
        lastName: 'adams',
        email: 'badam@mail.com',
        password: 'qwertz123',
      }

      const result = UserSelectSchema.safeParse(USER_1)

      expect(result.success).toBe(false)
    })
  })
})
