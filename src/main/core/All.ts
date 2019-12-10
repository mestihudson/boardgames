class Hive {
  private pieces: Array<Piece> = []
  private one: string = 'one'
  private two: string = 'two'

  started(): boolean {
    return this.pieces.length !== 0
  }

  starts(bug: string) {
    this.pieces.push(new Piece(bug, this.one))
    return this
  }

  piecesBy(player: string) {
    return this.pieces.filter((piece) => piece.player === player)
  }

  responses(bug: string, position: number, target: string) {
    const incoming = new Piece(bug, this.two)
    const outgoing = this.pieces.find((piece) => piece.player === this.one)
    outgoing.join(incoming, position)
    this.pieces.push(incoming)
    return this
  }

  puts(player: string, bug: string, position: number, target: string) {
    const incomingPlayer = this.one === player ? 'one' : 'two'
    if (
      this.lastChanceToPutTheBeeOf(incomingPlayer) &&
      !this.playerHasPutTheBee(incomingPlayer)
    ) {
      throw new Error("Imperative put the Bee")
    }
    const incoming = new Piece(bug, incomingPlayer)
    const outgoing = this.piecesBy(incomingPlayer)
      .find((piece) => piece.bug === target)
    outgoing.join(incoming, position)
    this.pieces.push(incoming)
    return this
  }

  playerHasPutTheBee(player: string) {
    return this.piecesBy(player).some((piece) => piece.bug === 'Bee')
  }

  lastChanceToPutTheBeeOf(player: string) {
    return this.piecesBy(player).length === 3
  }
}

class Piece {
  constructor(
    public bug: string,
    public player: string,
    private positions: Array<Piece> = []
  ) {}

  join(incoming: Piece, position: number) {
    this.positions[position] = incoming
  }
}

export { Hive }
