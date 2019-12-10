import { Before, Given, When, Then } from 'cucumber'
import { expect } from 'chai'

import { Hive } from '@/main/core/All'

let hive: Hive
let error

Before(() => {
  hive = new Hive()
})

Given(/^There is no started hive$/, () => {
  expect(hive.started()).not.to.be.ok
})

When(/^Player one starts with "(\w+)" bug$/, (bug: string) => {
  hive.starts(bug)
})

Then(/^Hive is started$/, () => {
  expect(hive.started()).to.be.ok
})

Then(/^Hive has "(\d+)" pieces? of "(\w+)" player$/, (
  pieces: number, player: string
) => {
  expect(hive.piecesBy(player)).to.have.lengthOf(pieces)
})

Given(/^There is a started hive with "(\w+)" bug$/, (bug: string) => {
  hive.starts(bug)
})

When(/^Player two responses with "(\w+)" on position "(\d+)" of "(\w+)" bug$/, (
  bug: string, position: number, target: string
) => {
  hive.responses(bug, position, target)
})

Given(/^There is a hive started with "(\w+)" and responded with position "(\d+)" of "(\w+)" bug$/, (
  bug: string, position: number, target: string
) => {
  hive
    .starts(bug)
    .responses(target, position, bug)
})

When(/^Player "(\w+)" puts "(\w+)" on position "(\d+)" of "(\w+)" bug$/, (
  player: string, incoming: string, position: number, target: string
) => {
  hive.puts(player, incoming, position, target)
})

Given(/^There is a hive with six played turns$/, () => {
  hive
    .starts("Beetle")
    .responses("Spider", 1, "Beetle")
    .puts("one", "Ant", 1, "Beetle")
    .puts("two", "Grasshopper", 1, "Spider")
    .puts("one", "Spider", 1, "Ant")
    .puts("two", "Beetle", 1, "Grasshopper")
})

When(/^Player "(\w+)" puts "(\w+)" on hive$/, (player: string, bug: string) => {
  try {
    hive.puts(player, bug, 1, "Ant")
  } catch(e) {
    error = e
  }
})

Then('There has raised a error {string}', (message: string) => {
  expect(error.message).to.be.equal(message)
})

