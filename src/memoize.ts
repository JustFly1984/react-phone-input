const Cache = Map

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEqualArrays (a: any[], b: any[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

// eslint-disable-next-line perf-standard/check-function-inline
export default function memoize<Fn> (func: Fn): Fn {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memoized: any = function memoized (this: Function, ...args: any[]): any {
    const cache = memoized.cache

    if (cache.has('args') && isEqualArrays(cache.get('args'), args)) {
      return cache.get('result')
    }

    const result = func.apply(this, args) // eslint-disable-line babel/no-invalid-this

    memoized.cache = cache.set('args', args)
      .set('result', result)

    return result
  }

  memoized.cache = new Cache()

  return memoized
}
