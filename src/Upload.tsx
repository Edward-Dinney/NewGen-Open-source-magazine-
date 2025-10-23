import "./App.css";
import { useState, useEffect, useMemo } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata, type StorageReference } from 'firebase/storage';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import home from "./assets/home.png";
import loginbutton from "./assets/login.png";
import loginbuttonhover from "./assets/login-hover.png"
import logoutbutton from "./assets/logout.png"
import logoutbuttonhover from "./assets/logout-hover.png"
import upload from "./assets/upload.png";
import userupload from "./assets/userupload.png"
import useruploadhover from "./assets/userupload-hover.png"
import backbutton from "./assets/backbutton.png"
import uploadbutton from "./assets/upload-button.png"
import publish from "./assets/publish.png"
import girl from "./assets/girl.gif"

export default function Upload(){
  type ImgItem = {id: string; url: string; description: string; storagePath: string; uid: string };
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageList, setImageList] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [Hover, setHover] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUpload(e.target.files?.[0] ?? null);
    const file = e.target.files?.[0];
  if (!file) return;
  setPreview(URL.createObjectURL(file)); // temporary preview URL
  setImageUpload(file);
  };

  const uploadTag = async () => {
    if (!imageUpload || !user) return;
    setLoading(true);
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
    setLoading(false);
    navigate("/");
  };

  return(
    <div className='Upload2'>
      <div className="Header">
            <img src={backbutton} className="back-button" onClick={() => navigate(-1)}/>
             </div>
        <div className="UploadWrapper">
        <div className='Uploadbox'>
          {loading && (
      <div className="Loading">
      <img src={girl} alt="Loading…" />
      </div>
      )}
        <label htmlFor="file-input" className="upload-image-button">
  {preview ? (
    <>
    <div className="SideBySide">
    <img src={preview} alt="preview" className="preview-image" />
      <div className='Description-box'>
        <label htmlFor="desc-input"></label>
        <textarea
          className="textbox"
          placeholder="Write description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          />
      </div>
    </div>
    </>
  ) : (
    <img src={uploadbutton} alt="Upload" className="plus-icon" />
  )}
</label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      
      </div>
      {imageUpload && 
      <>
      <img className="Publish" src={publish} onClick={uploadTag}/>
      </>}
      </div>
    </div>

  );

}