class Exception {
  constructor (name, message) {
    this.name = name
    this.message = message
  }
}

class InvalidPlaceException extends Exception {
  constructor (config) {
    super(
      'InvalidPlaceException',
      'Piece can not place touching a rival\'s one'
    )
    this.config = config
  }
}

class UnavailablePlaceException extends Exception {
  constructor (config) {
    super(
      'UnavailablePlaceException',
      'Piece can not put on sibling occupied place'
    )
    this.config = config
  }
}

class MandatoryPlaceQueenBeeException extends Exception {
  constructor (bug, used) {
    super(
      'MandatoryPlaceQueenBeeException',
      'It is mandatory place queen been this round'
    )
    this.bug = bug
    this.used = used
  }
}

class BugUnknownException extends Exception {
  constructor (bug, pieces) {
    super(
      'BugUnknownException',
      'Unknown bug informed'
    )
    this.bug = bug
    this.pieces = pieces
  }
}

class BugAlreadyPlacedException extends Exception {
  constructor (bug, used) {
    super(
      'BugAlreadyPlacedException',
      'Bug has already placed by player'
    )
    this.bug = bug
    this.used = used
  }
}

export {
  InvalidPlaceException,
  MandatoryPlaceQueenBeeException,
  BugUnknownException,
  BugAlreadyPlacedException,
  UnavailablePlaceException
}
