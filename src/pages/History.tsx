import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react'
import { trash } from 'ionicons/icons'
import './History.css'
import { useGame } from '../hooks/useGame'
import { Game } from './Score'
import { getGameWinner } from './Stats'

const formatDate = (dateVal: Date | string): string => {
  const d = new Date(dateVal)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPlayerTotal = (game: Game, playerName: string): number => {
  return game.rounds.reduce((sum, r) => sum + (r.scores[playerName] ?? 0), 0)
}

const GameDetail: React.FC<{ game: Game }> = ({ game }) => {
  const sortedPlayers = [...game.players].sort(
    (a, b) => getPlayerTotal(game, b) - getPlayerTotal(game, a),
  )

  return (
    <div className="game-detail">
      <IonList lines="full">
        {sortedPlayers.map((playerName, index) => (
          <IonItem key={playerName}>
            <IonNote slot="start" className="rank-badge">
              {index + 1}
            </IonNote>
            <IonLabel>{playerName}</IonLabel>
            <IonBadge slot="end" color="primary">
              {getPlayerTotal(game, playerName)}
            </IonBadge>
          </IonItem>
        ))}
      </IonList>

      {game.rounds.length > 0 && (
        <div className="round-history">
          <p className="round-history-title">Round History</p>
          <IonList lines="full">
            {[...game.rounds].reverse().map((round, index) => (
              <IonItem key={round.id}>
                <IonLabel>
                  <h2>Round {game.rounds.length - index}</h2>
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
        </div>
      )}
    </div>
  )
}

const History: React.FC = () => {
  const { history, deleteGame } = useGame()
  const [presentAlert] = useIonAlert()

  if (history.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>History</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">History</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonGrid style={{ height: '100%' }}>
            <IonRow
              style={{ height: '100%' }}
              className="ion-align-items-center"
            >
              <IonCol>
                <div className="ion-text-center">
                  <strong>
                    No past games yet — finish a game and start a new one to
                    save it here
                  </strong>
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
          <IonTitle>History</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">History</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonAccordionGroup>
          {[...history].reverse().map((pastGame) => {
            const winner = getGameWinner(pastGame)
            return (
              <IonAccordion key={pastGame.id} value={String(pastGame.id)}>
                <IonItem slot="header">
                  <IonLabel>
                    <h2>{formatDate(pastGame.start_time)}</h2>
                    <p>
                      {pastGame.rounds.length} rounds ·{' '}
                      {pastGame.players.join(', ')}
                    </p>
                    {winner && <p>Winner: {winner}</p>}
                  </IonLabel>
                </IonItem>
                <div slot="content">
                  <GameDetail game={pastGame} />
                  <div className="delete-row">
                    <IonButton
                      color="danger"
                      fill="clear"
                      onClick={() =>
                        presentAlert({
                          header: 'Delete Game?',
                          message: 'This cannot be undone.',
                          buttons: [
                            'Cancel',
                            {
                              text: 'Delete',
                              role: 'destructive',
                              handler: () => deleteGame(pastGame.id),
                            },
                          ],
                        })
                      }
                    >
                      <IonIcon slot="start" icon={trash} />
                      Delete Game
                    </IonButton>
                  </div>
                </div>
              </IonAccordion>
            )
          })}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  )
}

export default History
