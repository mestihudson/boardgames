@focus
Feature: Hive
  Scenario: Starts
      Given There is no started hive
       When Player one starts with "Beetle" bug
       Then Hive is started
        And Hive has "1" piece of "one" player
        And Hive has "0" piece of "two" player

  Scenario: Responses
      Given There is a started hive with "Spider" bug
       When Player two responses with "Ant" on position "0" of "Spider" bug
       Then Hive has "1" piece of "one" player
        And Hive has "1" piece of "two" player

  Scenario: Puts
      Given There is a hive started with "Grasshopper" and responded with position "0" of "Bee" bug
       When Player "one" puts "Spider" on position "2" of "Grasshopper" bug
       Then Hive has "2" pieces of "one" player
        And Hive has "1" piece of "two" player

  Scenario: Imperative bee application
      Given There is a hive with six played turns
       When Player "one" puts "Grasshopper" on hive
       Then There has raised a error "Imperative put the Bee"
