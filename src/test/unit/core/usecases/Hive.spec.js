import Hive from '@/core/usecases/Hive'

describe('Hive', () => {
  const execute = (bugs) => {
    const hive = new Hive()
    bugs.forEach(([bug, direction, target]) => {
      hive.execute(bug, direction, target)
    })
    return hive
  }

  describe('execute', () => {
    it.each([
      [[['S#1']], ['S#1:O:0:0,0,0,0,0,0']],
      [
        [['S#1'], ['G#1']],
        ['S#1:O:0:G#1,0,0,0,0,0', 'G#1:T:1:S#1,0,0,0,0,0']
      ],
      [
        [['S#1'], ['G#1'], ['B#1', 'se', 'S#1']],
        [
          'S#1:O:0:G#1,0,B#1,0,0,0', 'G#1:T:1:S#1,0,0,0,0,0',
          'B#1:O:2:S#1,0,0,0,0,0'
        ]
      ],
      [
        [['S#1'], ['G#1'], ['B#1', 'se', 'S#1'], ['A#1', 's', 'G#1']],
        [
          'S#1:O:0:G#1,0,B#1,0,0,0', 'G#1:T:1:S#1,0,0,A#1,0,0',
          'B#1:O:2:S#1,0,0,0,0,0', 'A#1:T:3:G#1,0,0,0,0,0'
        ]
      ]
    ])('should have, for given %j bugs, this config %j', (bugs, config) => {
      expect(execute(bugs)).toMatchObject({ config })
    })

    it.each([
      [[['S#1'], ['G#1'], ['B#1', 'se', 'G#1']]],
      [[['S#1'], ['G#1'], ['B#1', 'se', 'S#1'], ['A#1', 's', 'B#1']]]
    ]
    )('should not place touching a rival\'s one, for given %j bugs', (bugs) => {
      try {
        execute(bugs)
        fail('Should have raised an exception')
      } catch (e) {
        expect(e).toMatchObject({ name: 'InvalidPlaceException' })
      }
    })

    it.each([
      [[['S#1'], ['B#1'], ['A#1', 's', 'S#1'], ['Q', 's', 'B#1'], ['Q', 's', 'S#1']]]
    ])('should raise an exception when a bug try to occupy an already sibling place, given %j', (bugs) => {
      try {
        execute(bugs)
        fail('Should have raised an exception')
      } catch (e) {
        expect(e).toMatchObject({ name: 'UnavailablePlaceException' })
      }
    })

    it('should raise a exception when a unknown bug is informed', () => {
      try {
        const bugs = [[['S']]]
        execute(bugs)
        fail('Should have raised an exception')
      } catch (e) {
        expect(e).toMatchObject({ name: 'BugUnknownException' })
      }
    })

    it.each([
      [[['S#1'], ['B#1'], ['S#1']]],
      [[['S#1'], ['B#1'], ['Q', 'se', 'S#1'], ['B#1', 's', 'B#1']]],
      [[['S#1'], ['B#1'], ['Q', 'se', 'S#1'], ['A#1', 's', 'B#1'], ['S#1', 's', 'Q']]]
    ])('should raise an exception when a bug has already placed by a player, given %j', (bugs) => {
      try {
        execute(bugs)
        fail('Should have raised an exception')
      } catch (e) {
        expect(e).toMatchObject({ name: 'BugAlreadyPlacedException' })
      }
    })

    it.each([
      [[
        ['S#1'],
        ['G#1'],
        ['B#1', 'se', 'S#1'],
        ['A#1', 's', 'G#1'],
        ['G#1', 's', 'S#1'],
        ['B#1', 'sw', 'G#1'],
        ['A#1', 's', 'G#1']
      ]],
      [[
        ['S#1'],
        ['G#1'],
        ['B#1', 'se', 'S#1'],
        ['A#1', 's', 'G#1'],
        ['G#1', 's', 'S#1'],
        ['B#1', 'sw', 'G#1'],
        ['Q', 's', 'G#1'],
        ['B#2', 's', 'B#1']
      ]]
    ])('should, queen bee, enter the game until fourth round, given %j placed bugs', (bugs) => {
      try {
        execute(bugs)
        fail('Should have raised an exception')
      } catch (e) {
        expect(e).toMatchObject({ name: 'MandatoryPlaceQueenBeeException' })
      }
    })
  })
})
