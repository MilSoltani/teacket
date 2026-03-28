import { describe, expect, it } from 'vitest'
import { UserRoutes } from './user.routes'

describe('route definitions', () => {
  it('should have correct methods', () => {
    expect(UserRoutes.getAll.method).toBe('get')
    expect(UserRoutes.getById.method).toBe('get')
    expect(UserRoutes.update.method).toBe('put')
    expect(UserRoutes.create.method).toBe('post')
    expect(UserRoutes.delete.method).toBe('delete')
  })

  it('should have correct paths', () => {
    expect(UserRoutes.getAll.path).toBe('/')
    expect(UserRoutes.getById.path).toBe('/{id}')
    expect(UserRoutes.update.path).toBe('/{id}')
    expect(UserRoutes.create.path).toBe('/')
    expect(UserRoutes.delete.path).toBe('/{id}')
  })

  it('should have correct tag', () => {
    expect(UserRoutes.getAll.tags).toContain('User')
    expect(UserRoutes.getById.tags).toContain('User')
    expect(UserRoutes.update.tags).toContain('User')
    expect(UserRoutes.create.tags).toContain('User')
    expect(UserRoutes.delete.tags).toContain('User')
  })
})
