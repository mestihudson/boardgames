import {
  BugUnknownException, InvalidPlaceException, MandatoryPlaceQueenBeeException,
  BugAlreadyPlacedException, UnavailablePlaceException
} from '@/core/usecases/Exceptions'

class Placement {
  constructor ({ bug, player, location, directions }) {
    this.bug = bug
    this.player = player
    this.location = location
    this.directions = new Directions(directions)
  }
}

const placement = (bug, player, location, directions = {
  n: 0, ne: 0, se: 0, s: 0, sw: 0, nw: 0
}) => {
  const result = { bug, player, location, directions }
  return result
}

const redirect = (source, target, direction) => {
  const { bug, player, location, directions } = source
  // Object.entries(directions).find((d) => d === target.bug)
  // TODO: find a way to make it immutable
  directions[direction] = target.bug
  // TODO: find a way to make it immutable
  const result = placement(bug, player, location, directions)
  // console.log(result)
  return result
}

const join = (one, two, direction) => {
  const result = {
    one: redirect(one, two, direction), two: redirect(two, one, 'n')
  }
  return result
}

const secondPlace = ({ bug, placements, direction }) => {
  if (placements.length === 1) {
    const { one, two } = join(
      placements[0], placement(bug, 'T', 1), direction || 'n'
    )
    const result = { bug, placements: [one, two], direction }
    return result
  }
  return { bug, placements }
}

const firstPlace = ({ bug, placements }) => {
  if (placements.length === 0) {
    const result = { bug, placements: [placement(bug, 'O', 0)] }
    return result
  }
  return { bug, placements }
}

const queenHasPlaced = ({ bug, placements }) => {
  const next = placements.length
  const player = next % 2 === 0 ? 'O' : 'T'
  const hasPlaced = placements
    .filter((p) => p.player === player)
    .some((p) => p.bug === 'Q')
  if ([6, 7].some((index) => index === next) && bug !== 'Q' && !hasPlaced) {
    throw new MandatoryPlaceQueenBeeException()
  }
  return { bug, placements }
}

const available = ({ bug, placements, target }, direction) => {
  const next = placements.length
  const player = next % 2 === 0 ? 'O' : 'T'
  const first = placements.find((p) => p.bug === target && p.player === player)
  if (first.directions[direction] !== 0) {
    throw new UnavailablePlaceException()
  }
  return { bug, placements, direction, target }
}

const sibling = ({ bug, placements }, target) => {
  const next = placements.length
  const player = next % 2 === 0 ? 'O' : 'T'
  const first = placements.find((p) => p.bug === target && p.player === player)
  if (first === undefined) {
    throw new InvalidPlaceException()
  }
  return { bug, placements, target }
}

const nextPlace = ({ bug, placements }, target, direction) => {
  const next = placements.length
  const player = next % 2 === 0 ? 'O' : 'T'
  const first = placements.find((p) => p.bug === target && p.player === player)
  const { one, two } = join(first, placement(bug, player, next), direction)
  const result = {
    placements: placements
      .map((p) => p.bug === target && p.player === player ? one : p)
      .concat([two])
  }
  return result
}

const serialize = ({ bug, player, location, directions }) => {
  const serialized = [
    bug, player, location,
    Object.entries(directions).map(([, direction]) => direction).join(',')
  ].join(':')
  return serialized
}

const bugFinder = (placement, bug, player) =>
  placement.bug === bug && placement.player === player

const placementBy = (bug, player, placements) =>
  placements.find((placement) => bugFinder(placement, bug, player))

const queen = (
  sourcePlayer, [targetBug, targetPlayer], targetDirection, placements
) => {
  const source = placementBy('Q', sourcePlayer, placements)
  const target = placementBy(targetBug, targetPlayer, placements)
  const { one, two } = join(source, target, targetDirection)
  const result = {
    placements: placements
      .map((p) => bugFinder(p, source.bug, source.player) ? one : p)
      .map((p) => bugFinder(p, target.bug, target.player) ? two : p)
  }
  return result
}

export default class Hive {
  move ({ command, bug, direction, target, placements }) {
    if (command === 'M') {
      return queen(this.turn, target.split(':'), direction, placements)
    }
    return { placements }
  }

  valid ({ bug }) {
    if (!this.bugs.valid(bug)) {
      throw new BugUnknownException(bug, this.bugs)
    }
    return { bug }
  }

  alreadyPlaced({ bug, placements }) {
    const puts = new Turns(placements)
    if (puts.next() && puts.placed(bug)) {
      throw new BugAlreadyPlacedException()
    }
    return { bug, placements }
  }

  firstRound ({ bug, placements, direction }) {
    if (placements.length < 2) {
      const result = firstPlace(
        secondPlace({ bug, placements, direction })
      )
      return result
    }
    return { placements }
  }

  place ({ command, bug, direction, target, placements }) {
    if (command === 'P') {
      return this.firstRound({
        ...this.nextRounds({
          ...this.alreadyPlaced({
            ...this.valid({ bug }), placements
          }), direction, target
        })
      })
    }
    return { placements }
  }

  execute (statement) {
    this.turn.toggle()
    const [command, bug, direction, target] = statement.split(',')
    const { placements } = this.move({
      ...this.place({
        command, bug, direction, target, placements: this.placements
      }), command, bug, direction, target
    })
    this.placements = [...placements]
    this.config = this.placements.map((placement) => serialize(placement))
    return this
  }

  constructor () {
    this.turn = new Turn()
    this.placements = []
    this.bugs = new Bugs()
    this.pĺayers = new Players()
    this.cells = new Cells(new CellFactory(this.bugs, this.players))
  }

  nextRounds ({ bug, placements, direction, target }) {
    if (placements.length >= 2) {
      const result = {
        ...nextPlace(
          queenHasPlaced(
            available(
              sibling({ bug, placements }, target), direction
            )
          ), target, direction
        ),
        bug,
        direction
      }
      return result
    }
    return { bug, placements, direction }
  }
}

class CellFactory {
  constructor (bugsRepository, playersRepository) {
    this.bugs = bugsRepository
    this.players = playersRepository
  }

  create (bug) {
    this.valid(bug)
    return new Cell(this.bugs.by(bug), this.players.current())
  }

  valid (bug) {
    if (!this.bugs.valid(bug)) {
      throw new BugUnknownException()
    }
  }
}

class Place {
  constructor (cellsRepository) {
    this.cells = cellsRepository
  }

  execute(souce, target, edge) {
    if (this.firstRound()) {
      if (this.notStarted()) {
        this.cells.add(source)
      } else {
        this.cells.join(source, target, edge)
      }
    } else {
      this.cells.join(source, target, edge)
    }
  }

  notStarted () {
    return this.cells.length === 0
  }

  firstRound () {
    return this.cells.length < 2
  }
}

class Cells {
  constructor (cellFactory) {
    this.entries = []
    this.cellFactory = cellFactory
  }

  exists (cell) {
    return this.by(cell) !== undefined
  }

  by (cell) {
    return this.entries.find((entry) => entry.is(cell))
  }

  add (bug) {
    this.entries.push(this.already(this.cellFactory.create(bug)))
  }

  touch (sourceCell, targetCell, edge) {
     const [ source, target ] = [
       sourceCell.join(targetCell, new Edge('North', 'N')),
       targetCell.join(sourceCell, edge)
     ]
     return { source, target }
  }

  join (sourceBug, targetCell, edge) {
    const { source, target } = this.touch(
      this.cellFactory.create(sourceBug),
      this.by(targetCell),
      edge
    )
    this.add(source)
    this.update(target)
  }

  update (target) {
    this.entries = this.entries
      .map((entry) => entry.is(target) ? target : entry)
  }

  already (cell) {
    if (this.exists(cell)) {
      throw new BugAlreadyPlacedException()
    }
    return cell
  }
}

class Cell {
  constructor (bug, player, edges) {
    this.bug = bug
    this.player = player
    this.edges = edges || new Edges()
  }

  is (
    o,
    by = (left, right) => left.bug.is(right.bug) && left.player.is(right.player)
  ) {
    return by(this, o)
  }
}

class Edges {
  constructor (entries) {
    this.entries = (entries || [
      ['North', 'N'], ['Northeast', 'NE'], ['Southeast', 'SE'],
      ['South', 'S'], ['Southwest', 'SE'], ['Northwest', 'NW'],
      ['Up', 'U'], ['Down', 'D']
    ])
      .map(([name, mnemonic], index) => new Edge(name, mnemonic, index))
  }
}

class Edge {
  constructor (name, mnemonic, index, cell) {
    this.name = name
    this.mnemonic = mnemonic
    this.index = index
    this.cell = cell
  }
}

class Player {
  constructor (name) {
    this.name = name
  }

  name () {
    return this.name
  }
  is (o) {
    return this.name() === o.name()
  }
}

class Players {
  constructor (entries) {
    this.first = false
    this.entries = (entries || ['O', 'T']).map((name) => new Player(name))
  }

  toggle () {
    this.first != this.first
  }

  current () {
    return this.first ? this.one() : this.two()
  }

  one () {
    return this.entries.find((entry, index) => index === 0)
  }

  two () {
    return this.entries.find((entry, index) => index === 1)
  }
}

class Turn {
  toggle () {
    this.state = this.state === undefined || 'T' ? 'O' : 'T'
  }

  player () {
    return this.state
  }
}

class Turns {
  constructor (entries) {
    this.entries = entries
  }

  placed (bug) {
    return this.entries
      .filter((p) => p.player === this.player())
      .some((p) => p.bug === bug)
  }

  player () {
    return this.size() % 2 === 0 ? 'O' : 'T'
  }

  next () {
    return this.size() > 1
  }

  size () {
    return this.entries.length
  }
}

class Bugs {
  constructor () {
    this.entries = [
      ['Q'], [ 'S', 1 ], ['S', 2], ['B', 1], ['B', 2],
      ['G', 1], ['G', 2], ['G', 3], ['A', 1], ['A', 2], ['A', 3]
    ].map(([ name, index ]) => new Bug(name, index))
  }

  valid (id) {
    return this.by(id) !== undefined
  }

  by (id) {
    return this.entries.find((entry) => entry.id() === id)
  }
}

class Bug {
  constructor (name, index) {
    this.name = name
    this.index = index
  }

  id () {
    return this.index === undefined
      ? `${this.name}`
      : `${this.name}#${this.index}`
  }

  is (o) {
    return this.id() === o.id()
  }
}
