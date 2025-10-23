import './App.css'
import { useState } from "react";
import {getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import home from "./assets/home.png"
import backbutton from "./assets/backbutton.png"
import loginbutton from "./assets/login-button.png"
import signupbuttom from "./assets/signup-button.png"
import google from "./assets/signinwithgoogle.png"

const Signup = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const[error, setError] = useState('');

    const signUpWithGoogle =async () => {
        setAuthing(true);

        signInWithPopup(auth, new GoogleAuthProvider())
            .then(response => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch(error => {
                console.log(error);
                setAuthing(false);
            });
    };

    const signUpWithEmail = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setAuthing(true);
        setError('');

        createUserWithEmailAndPassword(auth, email, password)
            .then(response => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch(error => {
                console.log(error);
                setError(error.message);
                setAuthing(false);
            });
    }

    return(
        <div className="">
            <div className="Header">
            <img src={backbutton} className="back-button" onClick={() => navigate(-1)}/>
            </div>
            <center>
            <img src={home} className="home-splash" onClick={() => window.location.reload()}/>
            <button className="gsi-material-button" aria-label="Sign in with Google" onClick={signUpWithGoogle}>
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

    <span className="gsi-material-button-contents">Sign up with Google</span>
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
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="Password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Re-Enter Password"
                    className="Re-Password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            </center>
            <div className="Login-block">
                <img
                    src={signupbuttom}
                    onClick={signUpWithEmail}
                    className="signup-button"/>
            </div>
        </div>

    );
}

export default Signup;