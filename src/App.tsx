import './App.css';
import { useState, useEffect, useMemo } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata, type StorageReference } from 'firebase/storage';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext"

function App() {
  type ImgItem = {id: string; url: string; description: string; storagePath: string; uid: string };
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageList, setImageList] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState<string>("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Memoize the reference so it doesn't change on each render
  const imageListRef = useMemo(() => ref(storage, 'Tags/'), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUpload(e.target.files?.[0] ?? null);
  };

  const uploadTag = async () => {
    if (!imageUpload || !user) return;
    const path = `Tags/${user.uid}/${uuidv4()}-${imageUpload.name}`;
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, imageUpload, {
      customMetadata: {
        description: (description ?? "").trim(),
        uid: user.uid,
      },
    });
    const url = await getDownloadURL(snapshot.ref);
    setImageList((prev) => [
      {
        id: path,
        url,
        description: (description ?? "").trim(),
        storagePath: path,
        uid: user.uid,
      },
      ...prev,
    ]);

    setImageUpload(null);
    setDescription("");
  };

  const handleLogout = async () => {
    await logout();
  };

  const deleteImage = async (item: ImgItem) => {
    try {
      await deleteObject(ref(storage, item.storagePath));
      setImageList((prev) =>
        prev.filter((img) => img.storagePath !== item.storagePath)
      );
    } catch (e) {
      console.error("Failed to delete image:", e);
    }
  };

  async function listAllDeep(folderRef: StorageReference): Promise<StorageReference[]> {
    const res = await listAll(folderRef);
    const nested = await Promise.all(res.prefixes.map(listAllDeep)); // dive into uid folders
    return [...res.items, ...nested.flat()];
  }
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const fileRefs = await listAllDeep(imageListRef);

        const itemsWithTime = await Promise.all(
          fileRefs.map(async (itemRef) => {
            const [url, meta] = await Promise.all([
              getDownloadURL(itemRef),
              getMetadata(itemRef),
            ]);

            const storagePath = itemRef.fullPath; // "Tags/<uid>/<file>"
            const uidFromMeta = meta.customMetadata?.uid;
            const uidFromPath = storagePath.split("/")[1] ?? ""; // extract uid
            const uid = uidFromMeta ?? uidFromPath;
            const description = meta.customMetadata?.description ?? "";
            const id = meta.generation ?? storagePath; // stable id
            const time = meta.timeCreated ? Date.parse(meta.timeCreated) : 0;

            return { id, url, description, storagePath, uid, time };
          })
        );

        // Sort newest first (by timeCreated if available)
        itemsWithTime.sort((a, b) => b.time - a.time);
        setImageList(itemsWithTime.map(({ time, ...rest }) => rest));
      } catch (e) {
        console.error("Failed to load images", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [imageListRef]);


  return (
    <div className="App">
      {user ? (
        <>
        <button onClick={handleLogout}>Log out</button>
        <button onClick={() => navigate("/myuploads")}>My uploads</button>
        </>
      ) : (<button onClick={() => navigate("/login")}>Log in</button>)}
    
      <div>
        <label htmlFor="file-input">Upload an image</label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="desc-input">Description</label>
        <input
          id="desc-input"
          type="text"
          placeholder="Write description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button onClick={uploadTag} disabled={!imageUpload || !user}>
        {imageUpload ? 'Upload Image' : 'Choose a file first'}
      </button>

      {loading && <p role="status" aria-live="polite">Loading…</p>}
      {!loading && imageList.length === 0 && <p>No images yet.</p>}

      {imageList.map((item) => (
        <figure key={item.id}>
        <img src={item.url} alt={item.description || "Uploaded image"} />
        <figcaption>{item.description}</figcaption>
        {user && user.uid === item.uid && (
        <button onClick={() => deleteImage(item)}>Delete</button>
        )}
        <button onClick={() => navigate(`/uploads/${item.uid}`)}>
         More from this user
        </button>
      </figure>
))}
    </div>
  );
}

export default App;
