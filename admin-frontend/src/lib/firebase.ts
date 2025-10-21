// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Allowed image types
const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "JPEG",
  "image/jpg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP"
};

const validateImage = (file: File): boolean => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    throw new Error(`Invalid file type. Please upload one of these types: ${Object.values(ALLOWED_IMAGE_TYPES).join(', ')}`);
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }
  
  return true;
};

const getSecureImagePath = (fileName: string): string => {
  const timestamp = Date.now();
  const randomId = uuidv4();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  return `news-articles/${timestamp}_${randomId}_${sanitizedFileName}`;
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate the image
    validateImage(file);

    // Generate secure path
    const secureStoragePath = getSecureImagePath(file.name);
    const storageRef = ref(storage, secureStoragePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get and return the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const baseUrl = "automotive-5f3b5.firebasestorage.app";
    const path = imageUrl.split(baseUrl)[1].split('?')[0];
    const imageRef = ref(storage, path);
    
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Service account configuration (if needed for admin SDK)
export const serviceAccount = {
  type: import.meta.env.VITE_FIREBASE_TYPE,
  project_id: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: import.meta.env.VITE_FIREBASE_PRIVATE_KEY_ID,
  private_key: import.meta.env.VITE_FIREBASE_PRIVATE_KEY,
  client_email: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
  client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID,
  auth_uri: import.meta.env.VITE_FIREBASE_AUTH_URI,
  token_uri: import.meta.env.VITE_FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: import.meta.env.VITE_FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: import.meta.env.VITE_FIREBASE_CLIENT_CERT_URL,
};
