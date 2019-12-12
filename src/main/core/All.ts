class Hive {
  private pieces: Array<Piece> = []
  private one: string = 'one'
  private two: string = 'two'

  public started(): boolean {
    return this.pieces.length !== 0
  }

  public starts(bug: string) {
    this.pieces.push(new Piece(bug, this.one))
    return this
  }

  public piecesBy(player: string) {
    return this.pieces.filter((piece) => piece.player === player)
  }

  public responses(bug: string, position: number, target: string) {
    const incoming = new Piece(bug, this.two)
    const outgoing = this.pieces.find((piece) => piece.player === this.one)
    outgoing.join(incoming, position)
    this.pieces.push(incoming)
    return this
  }

  public puts(bug: string, position: number, target: string) {
    const incomingPlayer = this.turnBelongsTo()
    this.lastChanceToPutTheBeeBy(incomingPlayer)
    const incoming = new Piece(bug, incomingPlayer)
    const outgoing = this.piecesBy(incomingPlayer)
      .find((piece) => piece.bug === target)
    outgoing.join(incoming, position)
    this.pieces.push(incoming)
    return this
  }

  private playerHasPutTheBee(player: string) {
    return this.piecesBy(player).some((piece) => piece.bug === 'Bee')
  }

  private forthTurnOf(player: string) {
    return this.piecesBy(player).length === 3
  }

  private turnBelongsTo() {
    return this.pieces.length > 0 && this.pieces.some((piece, index, all) => {
      return index === all.length - 1 && piece.player === 'one'
    }) ? 'two' : 'one'
  }

  private lastChanceToPutTheBeeBy(player: string) {
    if (this.forthTurnOf(player) && !this.playerHasPutTheBee(player)) {
      throw new Error("Imperative put the Bee")
    }
  }
}

class Piece {
  constructor(
    public bug: string,
    public player: string,
    private positions: Array<Piece> = []
  ) {}

  public join(incoming: Piece, position: number) {
    this.positions[position] = incoming
  }
}

export { Hive }
