import firebase from 'firebase-admin';

let app: firebase.app.App;

const initFirebase = () => {
  if (!app) {
    app = firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  }
}

export const verifyToken = async (token: string) => {
  try {
    initFirebase();
    const decodedToken = await app.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return error;
  }
};

export const sendPushNotification = async (message: firebase.messaging.MulticastMessage) => {
  try {
    initFirebase();
    await app.messaging().sendEachForMulticast(message);
  } catch (error) {
    return error;
  }
}

