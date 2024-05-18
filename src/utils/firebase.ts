import firebase from 'firebase-admin';

let app: firebase.app.App;

export const verifyToken = async (token: string) => {
  try {
    if (!app) {
      app = firebase.initializeApp({
        credential: firebase.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
        }),
      });
    }

    const decodedToken = await app.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return error;
  }
};
