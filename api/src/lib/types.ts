import type { createContainer } from '@api/di'

export interface AppEnvironment {
  Variables: {
    container: ReturnType<typeof createContainer>
  }
}
