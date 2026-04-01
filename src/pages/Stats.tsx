import {
  IonBadge,
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
  IonNote,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import './Stats.css'
import { useGame } from '../hooks/useGame'

const Stats: React.FC = () => {
  const { game } = useGame()

  const totalRounds = game.rounds.length

  const getPlayerTotal = (playerName: string): number => {
    return game.rounds.reduce(
      (sum, round) => sum + (round.scores[playerName] ?? 0),
      0,
    )
  }

  const getPlayerAvg = (playerName: string): string => {
    if (totalRounds === 0) return '0.0'
    return (getPlayerTotal(playerName) / totalRounds).toFixed(1)
  }

  const getBlitzCount = (playerName: string): number => {
    return game.rounds.filter((round) => round.blitzer === playerName).length
  }

  const getHighScore = (playerName: string): number => {
    if (game.rounds.length === 0) return 0
    return Math.max(...game.rounds.map((r) => r.scores[playerName] ?? 0))
  }

  const sortedPlayers = [...game.players].sort(
    (a, b) => getPlayerTotal(b) - getPlayerTotal(a),
  )

  const leader = sortedPlayers[0]

  if (game.players.length === 0) {
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

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Game Summary</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol className="ion-text-center">
                  <div className="stat-value">{totalRounds}</div>
                  <div className="stat-label">Rounds</div>
                </IonCol>
                <IonCol className="ion-text-center">
                  <div className="stat-value">{game.players.length}</div>
                  <div className="stat-label">Players</div>
                </IonCol>
                {leader && totalRounds > 0 && (
                  <IonCol className="ion-text-center">
                    <div className="stat-value stat-leader">{leader}</div>
                    <div className="stat-label">Leading</div>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Leaderboard</IonCardTitle>
          </IonCardHeader>
          <IonList lines="full">
            {sortedPlayers.map((playerName, index) => (
              <IonItem key={playerName}>
                <IonNote slot="start" className="rank-badge">
                  {index + 1}
                </IonNote>
                <IonLabel>
                  <h2>{playerName}</h2>
                  <p>
                    Avg {getPlayerAvg(playerName)} pts/round · High{' '}
                    {getHighScore(playerName)}
                  </p>
                </IonLabel>
                <div slot="end" className="ion-text-right">
                  <IonBadge color="primary">
                    {getPlayerTotal(playerName)}
                  </IonBadge>
                  {getBlitzCount(playerName) > 0 && (
                    <IonChip color="success" className="blitz-chip">
                      ⚡ {getBlitzCount(playerName)}
                    </IonChip>
                  )}
                </div>
              </IonItem>
            ))}
          </IonList>
        </IonCard>

        {totalRounds > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Round History</IonCardTitle>
            </IonCardHeader>
            <IonList lines="full">
              {[...game.rounds].reverse().map((round, index) => (
                <IonItem key={round.id}>
                  <IonLabel>
                    <h2>Round {totalRounds - index}</h2>
                    <p>
                      {Object.entries(round.scores)
                        .sort(([, a], [, b]) => b - a)
                        .map(([name, score]) => `${name}: ${score}`)
                        .join(' · ')}
                    </p>
                    {round.blitzer && (
                      <p>
                        <IonChip color="success" className="blitz-chip-small">
                          ⚡ {round.blitzer} blitzed
                        </IonChip>
                      </p>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}

export default Stats
