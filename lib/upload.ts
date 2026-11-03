import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

/**
 * Universal image upload helper:
 * 1. Tries /api/upload (Vercel Blob)
 * 2. If Vercel Blob token is not set, uploads directly to Firebase Storage
 * 3. Falls back to base64 Data URL so preview/save never crashes
 */
export async function uploadImageFile(file: File, folder: string = "uploads"): Promise<string> {
  const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // 1. Try Vercel Blob via API route
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url && (data.url.startsWith("http://") || data.url.startsWith("https://"))) {
        return data.url;
      }
    }
  } catch (blobErr) {
    console.warn("Vercel Blob upload failed, attempting Firebase Storage:", blobErr);
  }

  // 2. Try Firebase Storage
  try {
    if (storage && typeof storage.app !== "undefined") {
      const storageRef = ref(storage, `${folder}/${safeFilename}`);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || "image/jpeg",
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }
  } catch (storageErr) {
    console.warn("Firebase Storage upload failed, falling back to base64:", storageErr);
  }

  // 3. Fallback to base64 data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to Data URL."));
      }
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsDataURL(file);
  });
}
