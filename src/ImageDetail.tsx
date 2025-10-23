import "./App.css"
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { storage } from "./firebase";
import { ref, getDownloadURL, getMetadata, deleteObject } from "firebase/storage";
import { useAuth } from "./AuthContext";
import girl from "./assets/girl.gif"
import backbutton from "./assets/backbutton.png"

type ImgItem = {
  id: string;            // stable id (storagePath or meta.generation)
  url: string;
  description: string;
  storagePath: string;   // e.g. "Tags/<uid>/<file>"
  uid: string;           // uploader uid
};

export default function ImageDetail() {
  const { id } = useParams();            // the image ID (path)
  const [imageData, setImageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [items, setItems] = useState<ImgItem[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadImage = async () => {
      try {
        const imageRef = ref(storage, id);
        const [url, meta] = await Promise.all([
          getDownloadURL(imageRef),
          getMetadata(imageRef),
        ]);

        setImageData({
          url,
          description: meta.customMetadata?.description ?? "",
          uid: meta.customMetadata?.uid ?? "",
          storagePath: imageRef.fullPath,
        });
      } catch (err) {
        console.error("Failed to load image:", err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [id]);

 const handleDelete = async () => {
    if (!imageData) return;
    if (!user || user.uid !== imageData.uid) return; // extra safety

    try {
      setDeleting(true);
      await deleteObject(ref(storage, imageData.storagePath));
      // After delete, go back or to the user's uploads
      navigate(`/uploads/${imageData.uid}`);
    } catch (e) {
      console.error("Failed to delete image:", e);
      alert("Failed to delete image.");
      setDeleting(false);
    }
  };

 const deleteImage = async (item: ImgItem) => {
     try {
       setLoading(true)
       await deleteObject(ref(storage, item.storagePath));
       setItems((prev) => prev.filter((i) => i.id !== item.id));
       navigate("/");
       setLoading(false)
     } catch (e) {
       console.error("Delete failed", e);
       alert("Failed to delete image.");
     }
   };


  if (loading) {
    return (
      <div className="Loading">
        <img src={girl} alt="Loading…" />
      </div>
    );
  }

  if (!imageData) return <p>Image not found.</p>;

  const isOwner = user && user.uid === imageData.uid;

  return (
    <div className="ImageDetail">
      <div className="Header">
            <img src={backbutton} className="back-button" onClick={() => navigate(-1)}/>
             </div>
      {loading && (
      <div className="Loading">
      <img src={girl} alt="Loading…" />
      </div>
      )}
      <div className="Detail-set">
      <div className="Image-Detail-Box">
      <img src={imageData.url} alt={imageData.description} className="detail-image" />
      </div>
      {imageData.description && (
        <figcaption className="detail-caption">
        {imageData.description}
        </figcaption>
      )}
      </div>
      <div className="Button-set">
      <button className="Writer" onClick={() => navigate(`/uploads/${imageData.uid}`)}>
          More from this writer
        </button>
     {isOwner && (
       <button className="Delete-button" onClick={() => deleteImage(imageData)}>Delete</button>
     )}
     </div>
      </div>
  );
}