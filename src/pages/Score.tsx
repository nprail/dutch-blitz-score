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
  IonPage,
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

import { add, ellipsisVertical, ellipsisHorizontal } from 'ionicons/icons'
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
}

interface IMenuPopoverProps {
  onDismiss: (data?: any, role?: string | undefined) => void
}
const Popover: React.FC<IMenuPopoverProps> = (props) => {
  const { onDismiss } = props

  return (
    <IonContent>
      <IonList>
        <IonItem button={true}>
          <IonLabel onClick={(e) => onDismiss(null, 'reset')}>
            Reset Game
          </IonLabel>
        </IonItem>
      </IonList>
    </IonContent>
  )
}

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
            0
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
          <IonTitle>Blitz Score</IonTitle>
          <IonBadge slot="end">{game.rounds.length}</IonBadge>
          <IonButtons slot="end">
            <IonButton
              onClick={(e: any) =>
                presentMenu({
                  event: e,
                  onDidDismiss: (e: CustomEvent) => {
                    if (e.detail.role === 'reset') {
                      newGame()
                    }
                  },
                })
              }
            >
              <IonIcon ios={ellipsisHorizontal} md={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {game.players
            .sort((a, b) => calculatePlayerScore(b) - calculatePlayerScore(a))
            .map((playerName, index) => (
              <IonItem
                key={index}
                onClick={() => {
                  presentAlert({
                    header: `Remove ${playerName}?`,
                    buttons: [
                      'Cancel',
                      {
                        text: 'Remove',
                        handler: (data) => removePlayer(playerName),
                      },
                    ],
                  })
                }}
              >
                <IonLabel>{playerName}</IonLabel>
                <IonBadge slot="end">
                  {calculatePlayerScore(playerName)}
                </IonBadge>
              </IonItem>
            ))}
        </IonList>

        <IonButton
          className="ion-padding"
          onClick={() =>
            presentAlert({
              header: 'Add New Player',
              buttons: [
                'Cancel',
                {
                  text: 'Save',
                  handler: (data) => addPlayer(data.name),
                },
              ],
              inputs: [
                {
                  id: 'name',
                  name: 'name',
                  placeholder: 'Name',
                },
              ],
            })
          }
        >
          Add Player
        </IonButton>

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
                  strong={true}
                  onClick={() => save()}
                  disabled={!canSaveRound()}
                >
                  Save
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <h1>Scores</h1>
            <IonList>
              {game.players.map((playerName) => (
                <IonItem
                  key={playerName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IonLabel>{playerName}</IonLabel>
                  <IonInput
                    slot="end"
                    type="number"
                    value={round.scores[playerName]}
                    onIonInput={(ev) => {
                      const value = (ev.target as HTMLIonInputElement)
                        .value as string

                      setRound((oldRound) => {
                        const number = parseFloat(value)

                        if (!isNaN(number)) {
                          oldRound.scores[playerName] = number
                        }

                        return {
                          ...oldRound,
                        }
                      })
                    }}
                  ></IonInput>
                </IonItem>
              ))}
            </IonList>

            <h1>Blitzer</h1>
            <IonList>
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
                    <IonLabel>{playerName}</IonLabel>
                    <IonRadio slot="end" value={playerName}></IonRadio>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>

      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton id="open-modal">
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Score
