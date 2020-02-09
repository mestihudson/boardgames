import Hive from '@/core/usecases/Hive'

describe('Hive', () => {
  const execute = (statements) => {
    const hive = new Hive()
    statements.forEach((statement) => {
      const command = typeof statement === 'string'
        ? statement
        : ['P'].concat(statement).join(',')
      hive.execute(command)
    })
    return hive
  }

  const shouldThrow = (callback, name) => {
    try {
      callback()
      fail('should have raised an exception')
    } catch (e) {
      expect(e).toMatchObject({ name })
    }
  }

  const shouldMatch = (commands, config) => {
    expect(execute(commands)).toMatchObject({ config })
  }

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
  ])('should be possible to place bugs', shouldMatch)

  it.each([
    [[['S']]],
    [[['A']]]
  ])('should not accept unknown bug', (bugs) => {
    shouldThrow(() => execute(bugs), 'BugUnknownException')
  })

  it.each([
    [[['S#1'], ['B#1'], ['S#1']]],
    [[['S#1'], ['B#1'], ['Q', 'se', 'S#1'], ['B#1', 's', 'B#1']]],
    [[['S#1'], ['B#1'], ['Q', 'se', 'S#1'], ['A#1', 's', 'B#1'], ['S#1', 's', 'Q']]]
  ])('should not accept already placed bug', (bugs) => {
    shouldThrow(() => execute(bugs), 'BugAlreadyPlacedException')
  })

  it.each([
    [
      [['S#1'], ['B#1', 'se', 'S#1']],
      ['S#1:O:0:0,0,B#1,0,0,0', 'B#1:T:1:S#1,0,0,0,0,0']
    ],
    [
      [['A#1'], ['Q', 's', 'A#1']],
      ['A#1:O:0:0,0,0,Q,0,0', 'Q:T:1:A#1,0,0,0,0,0']
    ]
  ])('should accept not sibling join only on the first round', shouldMatch)

  it.each([
    [[['S#1'], ['G#1'], ['B#1', 'se', 'G#1']]],
    [[['S#1'], ['G#1'], ['B#1', 'se', 'S#1'], ['A#1', 's', 'B#1']]]
  ])('should not accept sibling join after the first round', (bugs) => {
    shouldThrow(() => execute(bugs), 'InvalidPlaceException')
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
  ])('should place queen bee until fourth round', (bugs) => {
    shouldThrow(() => execute(bugs), 'MandatoryPlaceQueenBeeException')
  })

  it.each([
    [[['S#1'], ['B#1'], ['A#1', 's', 'S#1'], ['Q', 's', 'B#1'], ['Q', 's', 'S#1']]]
  ])('should not accept join on occupied place', (bugs) => {
    shouldThrow(() => execute(bugs), 'UnavailablePlaceException')
  })

  xit('should not can move if queen bee has not placed', () => {})

  xit('should can move only after queen bee placed', () => {})
})
