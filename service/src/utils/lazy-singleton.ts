type Factory<T> = () => T
type Singleton<T> = Readonly<{
  get: () => T
  dispose: () => void
}>

const singleton = <T>(factory: Factory<T>): Singleton<T> => {
  let instance: T | null = null

  const get = () => {
    if (!instance) {
      instance = factory()
    }
    return instance as T
  }

  const dispose = () => {
    instance = null
  }

  return {
    get,
    dispose,
  }
}

export default singleton