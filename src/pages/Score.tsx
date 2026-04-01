import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonModal,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonPopover,
  IonInput,
  IonRadioGroup,
  IonRadio,
  useIonAlert,
} from '@ionic/react'
import './Score.css'
import { OverlayEventDetail } from '@ionic/core/components'

import { add, ellipsisVertical, ellipsisHorizontal, trophy } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useGame } from '../hooks/useGame'

export interface PlayerScore {
  [playerName: string]: number
}

export interface Round {
  id: number
  blitzer?: string
  scores: PlayerScore
  timestamp: Date
}

export interface Game {
  id: number
  players: string[]
  rounds: Round[]
  start_time: Date
  end_time?: Date
}

interface IMenuPopoverProps {
  onDismiss: (data?: any, role?: string | undefined) => void
}
const Popover: React.FC<IMenuPopoverProps> = ({ onDismiss }) => (
  <IonContent>
    <IonList>
      <IonItem button onClick={() => onDismiss(null, 'reset')}>
        <IonLabel>Reset Game</IonLabel>
      </IonItem>
    </IonList>
  </IonContent>
)

const Score: React.FC = () => {
  const [presentMenu, dismissMenu] = useIonPopover(Popover, {
    onDismiss: (data: any, role: string) => dismissMenu(data, role),
  })

  const modal = useRef<HTMLIonModalElement>(null)

  const generateId = (): number => Math.round(Math.random() * 1000)

  const initRound = (): Round => ({
    id: generateId(),
    scores: {},
    timestamp: new Date(),
  })

  const { game, newGame, saveRound, addPlayer, removePlayer } = useGame()
  const [presentAlert] = useIonAlert()
  const [round, setRound] = useState<Round>(initRound())

  const calculatePlayerScore = (playerName: string) => {
    try {
      return (
        game.rounds
          .map((round) => round.scores[playerName] ?? 0)
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          ) ?? 0
      )
    } catch (err) {
      console.error(err)
      return 0
    }
  }

  function save() {
    modal.current?.dismiss(null, 'save')
  }

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === 'save') {
      saveRound(round)
    }
  }

  const canSaveRound = (): boolean => {
    if (!round.blitzer) return false

    for (const player of game.players) {
      // if no score was specified, make sure to set it to a valid number
      if (isNaN(round.scores[player]) || round.scores[player] === null) {
        return false
      }
    }

    return true
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dutch Blitz</IonTitle>
          <IonButtons slot="end">
            {game.rounds.length > 0 && (
              <IonBadge color="primary" className="round-badge">
                {game.rounds.length} {game.rounds.length === 1 ? 'Round' : 'Rounds'}
              </IonBadge>
            )}
            <IonButton
              onClick={(e: any) =>
                presentMenu({
                  event: e,
                  onDidDismiss: (e: CustomEvent) => {
                    if (e.detail.role === 'reset') newGame()
                  },
                })
              }
            >
              <IonIcon ios={ellipsisHorizontal} md={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {game.players.length === 0 ? (
          <div className="empty-state ion-padding ion-text-center">
            <IonText color="medium">
              <p>No players yet. Add players to start a game.</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {[...game.players]
              .sort((a, b) => calculatePlayerScore(b) - calculatePlayerScore(a))
              .map((playerName, index) => {
                const score = calculatePlayerScore(playerName)
                return (
                  <IonItem
                    key={playerName}
                    button
                    detail={false}
                    onClick={() =>
                      presentAlert({
                        header: `Remove ${playerName}?`,
                        buttons: [
                          'Cancel',
                          {
                            text: 'Remove',
                            role: 'destructive',
                            handler: () => removePlayer(playerName),
                          },
                        ],
                      })
                    }
                  >
                    <IonNote slot="start" className="rank-number">
                      {index + 1}
                    </IonNote>
                    {index === 0 && game.rounds.length > 0 && (
                      <IonIcon icon={trophy} color="warning" slot="start" />
                    )}
                    <IonLabel>{playerName}</IonLabel>
                    <IonBadge
                      slot="end"
                      color={score < 0 ? 'danger' : score === 0 ? 'medium' : 'primary'}
                    >
                      {score}
                    </IonBadge>
                  </IonItem>
                )
              })}
          </IonList>
        )}

        <div className="ion-padding">
          <IonButton
            expand="block"
            fill="outline"
            onClick={() =>
              presentAlert({
                header: 'Add New Player',
                buttons: [
                  'Cancel',
                  {
                    text: 'Add',
                    handler: (data) => addPlayer(data.name),
                  },
                ],
                inputs: [
                  {
                    id: 'name',
                    name: 'name',
                    placeholder: 'Player name',
                  },
                ],
              })
            }
          >
            Add Player
          </IonButton>
        </div>

        <IonModal
          ref={modal}
          trigger="open-modal"
          onWillDismiss={(ev) => onWillDismiss(ev)}
          onWillPresent={() => {
            setRound(initRound())
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => modal.current?.dismiss()}>
                  Cancel
                </IonButton>
              </IonButtons>
              <IonTitle>Add Round</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  strong
                  onClick={() => save()}
                  disabled={!canSaveRound()}
                >
                  Save
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonListHeader className="modal-section-header">
              <IonLabel>
                Scores
                <p>Enter each player's card count for this round</p>
              </IonLabel>
            </IonListHeader>
            <IonList inset>
              {game.players.map((playerName) => {
                const currentTotal = calculatePlayerScore(playerName)
                return (
                  <IonItem key={playerName}>
                    <IonLabel>
                      {playerName}
                      <p>{currentTotal} pts total</p>
                    </IonLabel>
                    <IonInput
                      className="score-input"
                      slot="end"
                      type="number"
                      inputmode="decimal"
                      placeholder="0"
                      value={round.scores[playerName] ?? ''}
                      onIonInput={(ev) => {
                        const value = (ev.target as HTMLIonInputElement)
                          .value as string
                        const number = parseFloat(value)
                        setRound((oldRound) => {
                          const newScores = { ...oldRound.scores }
                          if (isNaN(number)) {
                            delete newScores[playerName]
                          } else {
                            newScores[playerName] = number
                          }
                          return { ...oldRound, scores: newScores }
                        })
                      }}
                    />
                  </IonItem>
                )
              })}
            </IonList>

            <IonListHeader className="modal-section-header">
              <IonLabel>
                Blitzer
                <p>Who went out first?</p>
              </IonLabel>
            </IonListHeader>
            <IonList inset>
              <IonRadioGroup
                value={round.blitzer}
                onIonChange={(ev) =>
                  setRound((oldRound) => ({
                    ...oldRound,
                    blitzer: ev.target.value,
                  }))
                }
              >
                {game.players.map((playerName) => (
                  <IonItem key={playerName}>
                    <IonRadio value={playerName} justify="start">
                      {playerName}
                    </IonRadio>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>

      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton id="open-modal" disabled={game.players.length === 0}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Score
