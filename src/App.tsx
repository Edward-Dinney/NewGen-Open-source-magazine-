import './App.css';
import { useState, useEffect, useMemo } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata, deleteObject, type StorageReference } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import home from "./assets/home.png";
import loginbutton from "./assets/login.png";
import loginbuttonhover from "./assets/login-hover.png"
import logoutbutton from "./assets/logout.png"
import logoutbuttonhover from "./assets/logout-hover.png"
import uploadbutton from "./assets/upload.png";
import uploadbuttonhover from "./assets/upload-hover.png";
import userupload from "./assets/userupload.png"
import useruploadhover from "./assets/userupload-hover.png"
import girl from "./assets/girl.gif";

function App() {
  type ImgItem = {id: string; url: string; description: string; storagePath: string; uid: string };
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageList, setImageList] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState<string>("");
  const [Hover, setHover] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      <div className="Header">
      <img src={home} alt="Home" className="home-button" onClick={() => window.location.reload()}/>

      <div className='Menu-container'>
      {user ? (
        <>
        <button onClick={() => navigate("/myuploads")} className='UserUpload' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <img src={userupload} alt='User uploads' className='user-upload-button'/>
        </button>
        <button onClick={() => navigate("/upload")} className='Upload' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <img src={uploadbutton} className='upload-button'/>
        </button>
        <button onClick={handleLogout} className='Logout' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <img src={logoutbutton} alt='Logout button' className='logout-button'/>
        </button>
        </>
      ) : (<button onClick={() => navigate("/login")} className='Login' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <img src={loginbutton} className='login-button'/>
      </button>)}
      </div>
      </div>

      <div className='Body'>
      {loading && (
      <div className="Loading">
      <img src={girl} alt="Loading…" />
      </div>
      )}
      {!loading && imageList.length === 0 && <p>No images yet.</p>}

      {imageList.map((item) => (
      <figure key={item.id} onClick={() => navigate(`/image/${encodeURIComponent(item.storagePath)}`)} className="gallery-item">
      <img src={item.url} alt={item.description || "Uploaded image"} />
      </figure>
))}
      </div>
    </div>
  );
}

export default App;
