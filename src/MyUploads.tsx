// src/MyUploads.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { storage } from "./firebase";
import { useNavigate } from 'react-router-dom';
import {
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
  type StorageReference,
} from "firebase/storage";

type ImgItem = {
  id: string;            // stable id (storagePath or meta.generation)
  url: string;
  description: string;
  storagePath: string;   // e.g. "Tags/<uid>/<file>"
  uid: string;           // uploader uid
};


export default function MyUploads() {
  const { user } = useAuth();
  const [items, setItems] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Folder for THIS user’s uploads
  const userFolderRef = useMemo(() => {
    return user ? ref(storage, `Tags/${user.uid}/`) : null;
  }, [user?.uid]);

  // Recursively list all files under the user's folder (covers subfolders too)
  async function listAllDeep(folderRef: StorageReference): Promise<StorageReference[]> {
    const res = await listAll(folderRef);
    const nested = await Promise.all(res.prefixes.map(listAllDeep));
    return [...res.items, ...nested.flat()];
  }

  useEffect(() => {
    if (!user || !userFolderRef) {
      setItems([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const fileRefs = await listAllDeep(userFolderRef);

        const withTime = await Promise.all(
          fileRefs.map(async (itemRef) => {
            const [url, meta] = await Promise.all([
              getDownloadURL(itemRef),
              getMetadata(itemRef),
            ]);

            const storagePath = itemRef.fullPath; // "Tags/<uid>/<file>"
            const description = meta.customMetadata?.description ?? "";
            const uid = meta.customMetadata?.uid ?? user.uid; // fallback to current user
            const id = meta.generation ?? storagePath;        // stable id
            const time = meta.timeCreated ? Date.parse(meta.timeCreated) : 0;

            return { id, url, description, storagePath, uid, time };
          })
        );

        // newest first
        withTime.sort((a, b) => b.time - a.time);
        setItems(withTime.map(({ time, ...rest }) => rest));
      } catch (e) {
        console.error("Failed to load user uploads:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userFolderRef, user]);

  const deleteImage = async (item: ImgItem) => {
    try {
      await deleteObject(ref(storage, item.storagePath));
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete image.");
    }
  };

  if (!user) return <p>Please log in to see your uploads.</p>;
  if (loading) return <p>Loading…</p>;


  return (
    <div>
      <h1>My uploads</h1>
      <button onClick={() => navigate("/")}>Home</button>
      {items.map((item) => (
        <figure key={item.id}>
          <img
            src={item.url}
            alt={item.description || "Uploaded image"}
          />
          <figcaption>{item.description || <em>(No description)</em>}</figcaption>
          {/* Only the owner can see this page, but keep the button anyway */}
          <button onClick={() => deleteImage(item)}>Delete</button>
        </figure>
      ))}
    </div>
  );
}
