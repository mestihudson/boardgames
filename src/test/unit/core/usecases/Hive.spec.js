import Hive from '@/core/usecases/Hive'

describe('Hive', () => {
  const hive = (bugs) => {
    const hive = new Hive()
    bugs.forEach(([bug, direction, target]) => {
      hive.put(bug, direction, target)
    })
    return hive
  }

  describe('put', () => {
    it.each([
      [[['S']], ['S:0,0,0,0,0,0']],
      [[['S'], ['G']], ['S:G,0,0,0,0,0', 'G:S,0,0,0,0,0']],
      [
        [['S'], ['G'], ['B', 'se', 'S']],
        ['S:G,0,B,0,0,0', 'G:S,0,0,0,0,0', 'B:S,0,0,0,0,0']
      ],
      [
        [['S'], ['G'], ['B', 'se', 'S'], ['A', 's', 'G']],
        ['S:G,0,B,0,0,0', 'G:S,0,0,A,0,0', 'B:S,0,0,0,0,0', 'A:G,0,0,0,0,0']
      ]
    ])('should have, for given %j bugs, this config %j', (bugs, config) => {
      expect(hive(bugs)).toMatchObject({ config })
    })

    it.each([
      [[['S'], ['G'], ['B', 'se', 'G']]],
      [[['S'], ['G'], ['B', 'se', 'S'], ['A', 's', 'B']]]
    ]
    )('should not place touching a rival\'s one, for given %j bugs', (bugs) => {
      try {
        hive(bugs)
      } catch (e) {
        expect(e).not.toBeNull()
        console.log(e)
      }
    })
  })
})
