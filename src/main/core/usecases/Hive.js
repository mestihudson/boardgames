export default class Hive {
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
      switch (index) {
        case one:
          return this.glue(this.pieceAt(one), this.pieceAt(two), 'n')
        case two:
          return this.glue(this.pieceAt(two), this.pieceAt(one), 'n')
      }
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
