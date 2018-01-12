import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  const steps = [
    location => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      const unblock = history.block()

      history.push('/home')

      expect(history.location).toMatchObject({
        pathname: '/',
      })

      unblock()
    },
  ]

  execSteps(steps, history, done)
}
