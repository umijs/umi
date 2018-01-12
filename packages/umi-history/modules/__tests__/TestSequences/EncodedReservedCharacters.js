import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  const steps = [
    () => {
      // encoded string
      const pathname = '/view/%23abc'
      history.replace(pathname)
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc',
      })

      // encoded object
      const pathname = '/view/%23abc'
      history.replace({ pathname })
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc',
      })
      // unencoded string
      const pathname = '/view/#abc'
      history.replace(pathname)
    },
    location => {
      expect(location).toMatchObject({
        pathname: '/view/',
        hash: '#abc',
      })
    },
  ]

  execSteps(steps, history, done)
}
