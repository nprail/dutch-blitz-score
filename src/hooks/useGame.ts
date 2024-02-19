import { useState, useEffect } from 'react'

import { Preferences } from '@capacitor/preferences'
import { Game, Round } from '../pages/Score'

const GAME_DATA_KEY = '_blitz_game_data' as const

const initGame = (players?: string[]): Game => ({
  id: generateId(),
  players: players ?? [],
  rounds: [],
  start_time: new Date(),
})

const generateId = (): number => Math.round(Math.random() * 1000)

export function useGame() {
  const [game, setGame] = useState<Game>(initGame())

  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: GAME_DATA_KEY })

      const gameInPreferences = (value ? JSON.parse(value) : initGame()) as Game

      setGame(gameInPreferences)
    }
    loadSaved()
  }, [])

  const persist = (game: Game) =>
    Preferences.set({
      key: GAME_DATA_KEY,
      value: JSON.stringify(game),
    })

  const newGame = () => {
    setGame((oldGame) => {
      const newGame = initGame(oldGame.players)
      persist(newGame)

      return newGame
    })
  }

  const saveRound = async (newRound: Round) => {
    setGame((oldGame) => {
      for (const player of oldGame.players) {
        // if no score was specified, make sure to set it to a valid number
        if (
          isNaN(newRound.scores[player]) ||
          newRound.scores[player] === null
        ) {
          newRound.scores[player] = 0
        }
      }

      const newGameData = {
        ...oldGame,
        rounds: [...oldGame.rounds, newRound],
      }

      persist(newGameData)

      return newGameData
    })
  }

  const addPlayer = async (newPlayerName: string) => {
    setGame((oldGame) => {
      const newGame = {
        ...oldGame,
        players: [...oldGame.players, newPlayerName],
      }

      persist(newGame)

      return newGame
    })
  }

  const removePlayer = async (playerName: string) => {
    setGame((oldGame) => {
      const players = oldGame.players.filter((player) => player !== playerName)

      const rounds = oldGame.rounds.map((r) => {
        delete r.scores[playerName]
        return r
      })

      const newGame = {
        ...oldGame,
        rounds,
        players,
      }

      persist(newGame)

      return newGame
    })
  }

  return {
    saveRound,
    newGame,
    addPlayer,
    removePlayer,
    game,
  }
}
