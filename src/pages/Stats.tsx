import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import './Stats.css'
import { useGame } from '../hooks/useGame'
import { Game } from './Score'

const getGameWinner = (game: Game): string | null => {
  if (game.players.length === 0 || game.rounds.length === 0) return null
  const totals = game.players.map((p) => ({
    name: p,
    score: game.rounds.reduce((sum, r) => sum + (r.scores[p] ?? 0), 0),
  }))
  return totals.sort((a, b) => b.score - a.score)[0].name
}

const Stats: React.FC = () => {
  const { game, history } = useGame()

  const allGames = [...history, game]
  const completedGames = history.length + (game.rounds.length > 0 ? 1 : 0)
  const allPlayers = [...new Set(allGames.flatMap((g) => g.players))]
  const totalRounds = allGames.reduce((sum, g) => sum + g.rounds.length, 0)

  const getPlayerTotalScore = (playerName: string): number => {
    return allGames.reduce(
      (gameSum, g) =>
        gameSum +
        g.rounds.reduce((rSum, r) => rSum + (r.scores[playerName] ?? 0), 0),
      0,
    )
  }

  const getPlayerRoundsPlayed = (playerName: string): number => {
    return allGames.reduce(
      (sum, g) =>
        g.players.includes(playerName) ? sum + g.rounds.length : sum,
      0,
    )
  }

  const getPlayerGamesPlayed = (playerName: string): number => {
    return allGames.filter(
      (g) => g.players.includes(playerName) && g.rounds.length > 0,
    ).length
  }

  const getPlayerWins = (playerName: string): number => {
    return allGames.filter((g) => getGameWinner(g) === playerName).length
  }

  const getPlayerAvg = (playerName: string): string => {
    const rounds = getPlayerRoundsPlayed(playerName)
    if (rounds === 0) return '0.0'
    return (getPlayerTotalScore(playerName) / rounds).toFixed(1)
  }

  const getPlayerBlitzes = (playerName: string): number => {
    return allGames.reduce(
      (sum, g) =>
        sum + g.rounds.filter((r) => r.blitzer === playerName).length,
      0,
    )
  }

  const sortedPlayers = [...allPlayers].sort(
    (a, b) => getPlayerTotalScore(b) - getPlayerTotalScore(a),
  )

  const leader = sortedPlayers[0]

  if (allPlayers.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Stats</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Stats</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonGrid style={{ height: '100%' }}>
            <IonRow
              style={{ height: '100%' }}
              className="ion-align-items-center"
            >
              <IonCol>
                <div className="ion-text-center">
                  <strong>No players yet — add players on the Score tab</strong>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Stats</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonCard className="summary-card">
          <IonCardHeader>
            <IonCardTitle>All-Time Summary</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol className="ion-text-center">
                  <div className="stat-value">{completedGames}</div>
                  <div className="stat-label">Games</div>
                </IonCol>
                <IonCol className="ion-text-center">
                  <div className="stat-value">{totalRounds}</div>
                  <div className="stat-label">Rounds</div>
                </IonCol>
                {leader && totalRounds > 0 && (
                  <IonCol className="ion-text-center">
                    <div className="stat-value stat-leader">{leader}</div>
                    <div className="stat-label">All-Time Leader</div>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonCard className="leaderboard-card">
          <IonCardHeader>
            <IonCardTitle>Leaderboard</IonCardTitle>
          </IonCardHeader>
          <IonList lines="full">
            {sortedPlayers.map((playerName, index) => (
              <IonItem key={playerName} className={`leaderboard-item${index < 3 ? ` rank-top-${index + 1}` : ''}`}>
                <div slot="start" className="rank-badge-container">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (
                    <span className="rank-badge">{index + 1}</span>
                  )}
                </div>
                <IonLabel>
                  <h2>{playerName}</h2>
                  <p>
                    Avg {getPlayerAvg(playerName)} pts/round ·{' '}
                    {getPlayerGamesPlayed(playerName)} games ·{' '}
                    {getPlayerWins(playerName)} wins
                  </p>
                </IonLabel>
                <div slot="end" className="leaderboard-end">
                  <div className="leaderboard-score">{getPlayerTotalScore(playerName)}</div>
                  {getPlayerBlitzes(playerName) > 0 && (
                    <IonChip color="success" className="blitz-chip">
                      ⚡ {getPlayerBlitzes(playerName)}
                    </IonChip>
                  )}
                </div>
              </IonItem>
            ))}
          </IonList>
        </IonCard>
      </IonContent>
    </IonPage>
  )
}

export { getGameWinner }
export default Stats

