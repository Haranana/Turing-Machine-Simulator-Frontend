import "./page.css" 
import "./login-page.css" 
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from "../auth/AuthContext";
import {EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useState } from "react";


export default function LoginPage(){

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
    const [errorMessage ,setErrorMessage] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const {login} = useAuth();
    const navigate = useNavigate();

     async function handleSubmit(e: React.MouseEvent){

        e.preventDefault();
        const emailTrimmed = email.trim();
        const passwordTrimmed = password1.trim();

        try {
            const res = await fetch(`http://localhost:9090/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: passwordTrimmed }),
            });

            if (!res.ok) {
                if (res.status === 401) setErrorMessage("Nieprawidłowy e-mail lub hasło.");
                else setErrorMessage(`Błąd logowania (${res.status}).`);
                return;
            }

            const data = (await res.json()) as {
                accessToken: string;
                tokenType: string;
                expiresInSeconds: number;
            };

            console.log("login with: ", rememberMe);
            login(data.accessToken, data.tokenType, data.expiresInSeconds, rememberMe);
            navigate("/account", { replace: true });
            } catch (e: any) {
                setErrorMessage(e?.message ?? "Błąd sieci.");
            } 
     }

     function checkIfValidationPassed(emailValue: string, password1Value: string){
        const emailTrimmed = emailValue.trim();
        const pas1Trimmed = password1Value.trim();
    
        if(emailTrimmed.length == 0 || pas1Trimmed.length == 0){
            setInitialValidationPassed(false);
        }
        else{
            setInitialValidationPassed(true);
        }
    }

    function togglePassword() {
        passwordVisible? setPasswordVisible(false) : setPasswordVisible(true);
    }

    return(
    <div className="page">
        <div className="login-window">
            <h1 className="login-header">Sign in</h1>
            
            <form>
                <label><input className="login-text-field" type="email" name="email" id="login-email" placeholder="Email" onChange={(e)=>{setEmail(e.target.value);checkIfValidationPassed(e.target.value , password1);}} required/></label><br></br>
                <div className = "login-password-wrapper">
                    <input className="login-text-field" type={passwordVisible? "text" : "password"} name="password" id="login-password" placeholder="Password" onChange={(e)=>{setPassword1(e.target.value);checkIfValidationPassed( email , e.target.value);}} required/>
                    <span  className="toggle-password" onClick={()=>togglePassword()}>
                        {passwordVisible?
                        <EyeIcon id="login-password-icon" className="password-icon"/> :
                        <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                    </span>
                </div>
                
                
                <div className="login-remember-forgot">
                    <label><input className="login-checkbox"  type="checkbox" name="remember-me" id="login-remember-me" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)}/>Remember me</label>
                    <Link  className="remember-me-link" to="password/change" title='ChangePassword'>Forgot password?</Link>
                </div>

                            
                <div className="ErrorMesssageWrapper">
                    <p className="ErrorMessage">{errorMessage}</p>
                </div>
                <input className={`login-button ${!initialValidationPassed? "DisabledButton" : ""}`} type="submit" value="Log in" disabled={!initialValidationPassed} onClick={(e)=>handleSubmit(e)}/>
                <div className="login-signup">
                    <span>Don't have an account? <Link className="login-signup-link" to="/signup" title='SignUp'>Sign up</Link></span>
                </div>


            </form>
        </div>
    </div>
    );
}