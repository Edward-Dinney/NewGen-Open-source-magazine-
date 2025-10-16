import { useState } from "react";
import {getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from "react-router-dom";


const Login = () => {

    const auth = getAuth();
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const[error, setError] = useState('');

    const signInWithGoogle = async () => {
        setAuthing(true);

        signInWithPopup(auth, new GoogleAuthProvider())
            .then(response => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch(error => {
                console.log(error);
                setAuthing(false);
            })
    }

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
            <input
                type="email"
                placeholder="Email"
                className=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            <input
                type="password"
                placeholder="Password"
                className=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
            
            <div>
                <button className="" onClick={signInWithEmail} disabled={authing}>
                    Log In
                </button>

                <button className="" onClick={signInWithGoogle} disabled={authing}>
                    Log In With Goodgle
                </button>
                <button type="button" onClick={() => navigate("/signup")}>Sign up</button>
            </div>
        </div>
        );


}

export default Login;