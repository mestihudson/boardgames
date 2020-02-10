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

const firstRound = ({ bug, placements, direction }) => {
  if (placements.length < 2) {
    const result = firstPlace(
      secondPlace({ bug, placements, direction })
    )
    return result
  }
  return { placements }
}

const alreadyPlaced = ({ bug, placements }) => {
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

const nextRounds = ({ bug, placements }, direction, target) => {
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

export default class Hive {
  constructor () {
    this.turn = new Turn()
    this.bugs = new Bugs()
    this.placements = []
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

  place ({ command, bug, direction, target, placements }) {
    if (command === 'P') {
      return firstRound(
        nextRounds(
          this.alreadyPlaced({
            ...this.valid({ bug }), placements
          }), direction, target
        )
      )
    }
    return { placements }
  }

  move ({ command, bug, direction, target, placements }) {
    if (command === 'M') {
      return queen(this.turn, target.split(':'), direction, placements)
    }
    return { placements }
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

class Bugs {
  constructor () {
    this.names = [
      'Q', 'S#1', 'S#2', 'B#1', 'B#2', 'G#1', 'G#2', 'G#3', 'A#1', 'A#2', 'A#3'
    ]
  }

  valid (bug) {
    return this.names.some((name) => name === bug)
  }
}
