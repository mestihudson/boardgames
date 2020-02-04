class Hive {
  constructor () {
    this.config = []
  }

  put (bug) {
    this.config.push(bug + ':0,0,0,0,0,0')
    if (this.config.length === 2) {
      this.pair(0, 1)
    }
    return this
  }

  pair (one, two) {
    this.before = [...this.config]
    this.after = this.before.map((turn, index) => {
      if (index === one) {
        return this.glue(this.pieceAt(one), this.pieceAt(two), 'n')
      }
      if (index === two) {
        return this.glue(this.pieceAt(two), this.pieceAt(one), 'n')
      }
      return turn
    })
    this.config = this.after
  }

  glue (one, two, position) {
    one.side[position] = two.bug
    return this.toLine(one)
  }

  toLine (piece) {
    return [
      piece.bug,
      [
        piece.side.n,
        piece.side.ne,
        piece.side.se,
        piece.side.s,
        piece.side.sw,
        piece.side.nw
      ].join(',')
    ].join(':')
  }

  pieceAt (position) {
    const [bug, sides] = this.config[position].split(':')
    const [n, ne, se, s, sw, nw] = sides.split(',')
    return {
      bug,
      side: {
        n, ne, se, s, sw, nw
      }
    }
  }
}

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
