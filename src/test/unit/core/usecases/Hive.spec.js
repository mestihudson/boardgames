import Hive from '@/core/usecases/Hive'

describe('Hive', () => {
  describe('put', () => {
    it.each([
      [['B'], ['B:0,0,0,0,0,0']],
      [['B', 'G'], ['B:G,0,0,0,0,0', 'G:B,0,0,0,0,0']]
    ])('should have, for given %p bugs, this config %p', (bugs, config) => {
      const hive = new Hive()
      bugs.forEach((bug) => {
        hive.put(bug)
      })
      expect(hive.config).toStrictEqual(config)
    })
  })
})
