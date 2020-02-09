import {
  BugUnknownException, InvalidPlaceException, MandatoryPlaceQueenBeeException,
  BugAlreadyPlacedException, UnavailablePlaceException
} from '@/core/usecases/Exceptions'

const placement = (bug, player, location, directions = {
  n: 0, ne: 0, se: 0, s: 0, sw: 0, nw: 0
}) => {
  const result = { bug, player, location, directions }
  return result
}

const redirect = (source, target, direction) => {
  const { bug, player, location, directions } = source
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

const valid = (bug, bugs) => {
  if (!bugs.some((piece) => piece === bug)) {
    throw new BugUnknownException(bug, bugs)
  }
  return bug
}

const alreadyPlaced = (bug, placements) => {
  const next = placements.length
  if (next > 1) {
    const player = next % 2 === 0 ? 'O' : 'T'
    const hasPlaced = placements
      .filter((p) => p.player === player)
      .some((p) => p.bug === bug)
    if (hasPlaced) {
      throw new BugAlreadyPlacedException()
    }
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

export default class Hive {
  constructor () {
    this.placements = []
    this.pieces = [
      'Q', 'S#1', 'S#2', 'B#1', 'B#2', 'G#1', 'G#2', 'G#3', 'A#1', 'A#2', 'A#3'
    ]
  }

  execute (statement) {
    const [ command, ...params ] = statement.split(',')
    if (command === 'P') {
      const [ bug, direction, target ] = params
      return this.place(bug, direction, target)
    }
    if (command === 'M') {
      return this.move(params)
    }
  }

  place (bug, direction, target) {
    const { placements } = firstRound(
      nextRounds(
        alreadyPlaced(
          valid(
            bug, this.pieces
          ), this.placements
        ), direction, target
      )
    )
    this.placements = [...placements]
    this.config = this.placements.map((placement) => serialize(placement))
    return this
  }
}
