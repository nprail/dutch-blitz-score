import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import './Stats.css'

const fullHeight = {
  height: '100%',
}

const Stats: React.FC = () => {
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
        <IonGrid style={fullHeight}>
          <IonRow style={fullHeight} className="ion-align-items-center">
            <IonCol>
              <div className="ion-text-center">
                <strong>Coming soon</strong>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Stats
