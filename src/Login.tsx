import './App.css'
import { useState } from "react";
import {getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import home from "./assets/home.png"
import backbutton from "./assets/backbutton.png"
import loginbutton from "./assets/login-button.png"
import signupbuttom from "./assets/signup-button.png"
import google from "./assets/signinwithgoogle.png"


const Login = () => {

    const auth = getAuth();
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const[error, setError] = useState('');

    const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    // Call popup directly in the click handler; avoid doing other async work first.
    const res = await signInWithPopup(getAuth(), provider);
    console.log(res.user.uid);
    navigate('/');
  } catch (err: any) {
    console.warn('Popup sign-in failed:', err?.code);

    // Common popup errors that should fallback to redirect
    const popupBlocked =
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request';

    if (popupBlocked) {
      // Redirect flow is more reliable on Safari/iOS and locked-down browsers.
      await signInWithRedirect(getAuth(), provider);
      return;
    }

    // Surface unexpected errors
    setAuthing(false);
    setError(err?.message ?? 'Sign-in failed.');
  }
};

    const signInWithEmail = async () => {
        setAuthing(true);
        setError('');

        signInWithEmailAndPassword(auth, email, password)
            .then(response => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch(error => {
                console.log(error);
                setAuthing(false);
            })
    }

    return(
        <div className="">
            <div className="Header">
            <img src={backbutton} className="back-button" onClick={() => navigate(-1)}/>
             </div>
            <center>
            <img src={home} className="home-splash" onClick={() => window.location.reload()}/>
            <button className="gsi-material-button" aria-label="Sign in with Google" onClick={signInWithGoogle}>
  <div className="gsi-material-button-state" />
  <div className="gsi-material-button-content-wrapper">
    <div className="gsi-material-button-icon" aria-hidden="true">
      <svg
        viewBox="0 0 48 48"
        style={{ display: 'block' }}
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        /* If you ever need it: xmlnsXlink="http://www.w3.org/1999/xlink" */
      >
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
    </div>

    <span className="gsi-material-button-contents">Sign in with Google</span>
    {/* If you need a hidden label, use a screen-reader class instead of inline style */}
    {/* <span className="sr-only">Sign in with Google</span> */}
  </div>
</button>
            <div className="Login-input">
            <input
                type="email"
                placeholder="Email"
                className="Email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            
            <input
                type="password"
                placeholder="Password"
                className="Password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
            </div>
            </center>
            <div className="Login-block">
                <img src={loginbutton} className="email-button" onClick={signInWithEmail}/>
                <img src={signupbuttom} className="signup-button"onClick={() => navigate("/signup")}/>
            </div>
        </div>
        );


}

export default Login;