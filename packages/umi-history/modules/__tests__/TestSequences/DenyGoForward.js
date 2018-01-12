import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  let unblock
  const steps = [
    location => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.push('/home')
    },
    (location, action) => {
      expect(action).toBe('PUSH')
      expect(location).toMatchObject({
        pathname: '/home',
      })

      history.goBack()
    },
    (location, action) => {
      expect(action).toBe('POP')
      expect(location).toMatchObject({
        pathname: '/',
      })

      unblock = history.block(nextLocation => {
        expect(nextLocation).toMatchObject({
          pathname: '/home',
        })

        return 'Are you sure?'
      })

      history.goForward()
    },
    (location, action) => {
      expect(action).toBe('POP')
      expect(location).toMatchObject({
        pathname: '/',
      })

      unblock()
    },
  ]

  execSteps(steps, history, done)
}
