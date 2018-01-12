import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  const steps = [
    location => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.replace('/home?the=query#the-hash')
    },
    (location, action) => {
      expect(action).toBe('REPLACE')
      expect(location).toMatchObject({
        pathname: '/home',
        search: '?the=query',
        hash: '#the-hash',
      })
    },
  ]

  execSteps(steps, history, done)
}
