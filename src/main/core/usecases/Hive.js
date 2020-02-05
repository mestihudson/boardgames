import InvalidPlaceError from '@/core/usecases/InvalidPlaceError'

export default class Hive {
  constructor () {
    this.config = []
  }

  put (bug, direction, target) {
    this.config.push(
      this.from(
        this.create(bug)
      )
    )
    switch (this.config.length) {
      case 2: {
        const { one, two } = this.join(this.at(0), this.at(1), direction)
        const after = [one, two].map((item) => this.from(item))
        this.config = [...after]
        break
      }
      default: {
        if (this.config.length > 2) {
          const before = [...this.config]
          const lastIndex = this.config.length - 1
          const latest = this.at(lastIndex)
          for (let index = 0, size = before.length; index < size; index++) {
            const current = this.to(before[index])
            if (target === current.bug) {
              if (index % 2 === lastIndex % 2) {
                const { one, two } = this.join(current, latest, direction)
                before[index] = this.from(one)
                before[size - 1] = this.from(two)
                break
              }
              throw new InvalidPlaceError()
            }
          }
          this.config = [...before]
          break
        }
      }
    }
    return this
  }

  join (one, two, direction) {
    one.side[direction || 'n'] = two.bug
    two.side.n = one.bug
    return { one, two }
  }

  from ({ bug, side }) {
    return [
      bug,
      [
        side.n,
        side.ne,
        side.se,
        side.s,
        side.sw,
        side.nw
      ].join(',')
    ].join(':')
  }

  at (position) {
    return this.to(this.config[position])
  }

  to (line) {
    const [bug, sides] = line.split(':')
    const [n, ne, se, s, sw, nw] = sides.split(',')
    return this.create(bug, n, ne, se, s, sw, nw)
  }

  create (bug, n = 0, ne = 0, se = 0, s = 0, sw = 0, nw = 0) {
    return { bug, side: { n, ne, se, s, sw, nw } }
  }
}
