import { createContext, useContext, useState, useEffect } from 'react'
import { Preferences } from '@capacitor/preferences'
import { Game, Round } from '../pages/Score'

const GAME_DATA_KEY = '_blitz_game_data' as const
const GAME_HISTORY_KEY = '_blitz_game_history' as const

const generateId = (): number => Math.round(Math.random() * 1_000_000_000)

const initGame = (players?: string[]): Game => ({
  id: generateId(),
  players: players ?? [],
  rounds: [],
  start_time: new Date(),
})

interface GameContextValue {
  game: Game
  history: Game[]
  saveRound: (newRound: Round) => Promise<void>
  newGame: () => void
  addPlayer: (newPlayerName: string) => Promise<void>
  removePlayer: (playerName: string) => Promise<void>
  deleteGame: (gameId: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [game, setGame] = useState<Game>(initGame())
  const [history, setHistory] = useState<Game[]>([])

  useEffect(() => {
    const loadSaved = async () => {
      const [gameResult, historyResult] = await Promise.all([
        Preferences.get({ key: GAME_DATA_KEY }),
        Preferences.get({ key: GAME_HISTORY_KEY }),
      ])

      const gameInPreferences = (
        gameResult.value ? JSON.parse(gameResult.value) : initGame()
      ) as Game
      const historyInPreferences = (
        historyResult.value ? JSON.parse(historyResult.value) : []
      ) as Game[]

      setGame(gameInPreferences)
      setHistory(historyInPreferences)
    }
    loadSaved()
  }, [])

  const persist = (g: Game) =>
    Preferences.set({ key: GAME_DATA_KEY, value: JSON.stringify(g) })

  const persistHistory = (h: Game[]) =>
    Preferences.set({ key: GAME_HISTORY_KEY, value: JSON.stringify(h) })

  const newGame = () => {
    if (game.rounds.length > 0) {
      const completedGame: Game = { ...game, end_time: new Date() }
      setHistory((oldHistory) => {
        const updatedHistory = [...oldHistory, completedGame]
        persistHistory(updatedHistory)
        return updatedHistory
      })
    }
    const ng = initGame(game.players)
    persist(ng)
    setGame(ng)
  }

  const deleteGame = (gameId: number) => {
    setHistory((oldHistory) => {
      const updatedHistory = oldHistory.filter((g) => g.id !== gameId)
      persistHistory(updatedHistory)
      return updatedHistory
    })
  }

  const saveRound = async (newRound: Round) => {
    setGame((oldGame) => {
      for (const player of oldGame.players) {
        if (isNaN(newRound.scores[player]) || newRound.scores[player] === null) {
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
      const newGameData = {
        ...oldGame,
        players: [...oldGame.players, newPlayerName],
      }
      persist(newGameData)
      return newGameData
    })
  }

  const removePlayer = async (playerName: string) => {
    setGame((oldGame) => {
      const players = oldGame.players.filter((p) => p !== playerName)
      const rounds = oldGame.rounds.map((r) => {
        const scores = { ...r.scores }
        delete scores[playerName]
        return { ...r, scores }
      })
      const newGameData = { ...oldGame, rounds, players }
      persist(newGameData)
      return newGameData
    })
  }

  return (
    <GameContext.Provider
      value={{ game, history, saveRound, newGame, addPlayer, removePlayer, deleteGame }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
