import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Xử lý cực kỳ cẩn thận Private Key: loại bỏ ngoặc kép và fix newline
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n')
    : undefined,
};

export function createAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    console.log('--- Firebase Admin Debug ---');
    console.log('Project ID:', firebaseAdminConfig.projectId);
    console.log('Client Email:', firebaseAdminConfig.clientEmail);
    console.log('Private Key EXISTS:', !!firebaseAdminConfig.privateKey);
    console.log('Private Key START:', firebaseAdminConfig.privateKey?.substring(0, 30));

    return admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('FIREBASE ADMIN INIT ERROR:', error);
    throw error;
  }
}

export const adminAuth = () => createAdminApp().auth();
export const adminDb = () => createAdminApp().firestore();
export const adminStorage = () => createAdminApp().storage();
