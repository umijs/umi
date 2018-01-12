import expect from 'expect'
import execSteps from './execSteps'

export default (history, done) => {
  const steps = [
    () => {
      expect(() => {
        history.replace('/hello%')
      }).toThrow(
        'Pathname "/hello%" could not be decoded. This is likely caused by an invalid percent-encoding.',
      )
    },
  ]

  execSteps(steps, history, done)
}
