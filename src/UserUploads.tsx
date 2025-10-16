import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { storage } from "./firebase";
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

export default function UserUploads() {
  const { uid: routeUid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);

  // folder for that user's uploads
  const folderRef = useMemo(() => {
    return routeUid ? ref(storage, `Tags/${routeUid}/`) : null;
  }, [routeUid]);

  async function listAllDeep(folderRef: StorageReference): Promise<StorageReference[]> {
    const res = await listAll(folderRef);
    const nested = await Promise.all(res.prefixes.map(listAllDeep));
    return [...res.items, ...nested.flat()];
  }

  useEffect(() => {
    if (!folderRef) {
      setItems([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const fileRefs = await listAllDeep(folderRef);
        const withTime = await Promise.all(
          fileRefs.map(async (itemRef) => {
            const [url, meta] = await Promise.all([
              getDownloadURL(itemRef),
              getMetadata(itemRef),
            ]);
            const storagePath = itemRef.fullPath;
            const description = meta.customMetadata?.description ?? "";
            const uid = meta.customMetadata?.uid ?? (routeUid ?? "");
            const id = meta.generation ?? storagePath;
            const time = meta.timeCreated ? Date.parse(meta.timeCreated) : 0;
            return { id, url, description, storagePath, uid, time };
          })
        );
        withTime.sort((a, b) => b.time - a.time);
        setItems(withTime.map(({ time, ...rest }) => rest));
      } catch (e) {
        console.error("Failed to load user uploads:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [folderRef, routeUid]);

  const deleteImage = async (item: ImgItem) => {
    try {
      // only allow if current user owns it
      if (!user || user.uid !== item.uid) return;
      await deleteObject(ref(storage, item.storagePath));
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete image.");
    }
  };

  if (!routeUid) return <p>Invalid user.</p>;
  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1>User uploads</h1>
      <button onClick={() => navigate("/")}>Home</button>
      {items.length === 0 && <p>No uploads yet.</p>}
      {items.map((item) => (
        <figure key={item.id}>
          <img
            src={item.url}
            alt={item.description || "Uploaded image"}
          />
          <figcaption>{item.description || <em>(No description)</em>}</figcaption>

          {/* show delete ONLY if viewing your own uid */}
          {user && user.uid === item.uid && (
            <button onClick={() => deleteImage(item)}>Delete</button>
          )}
        </figure>
      ))}
    </div>
  );
}