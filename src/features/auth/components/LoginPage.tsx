import "@auth/styles/Auth.css" 

import {Link, useNavigate} from 'react-router-dom';
import {EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useState } from "react";
import { toast } from 'react-hot-toast';

import { useAuth } from "@auth/hooks/AuthContext";
import { API_BASE_URL } from "@api/apiUtils";

export default function LoginPage(){

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
    const [errorMessage ,_] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const {login} = useAuth();
    const navigate = useNavigate();

     async function handleSubmit(e: React.MouseEvent){

        e.preventDefault();
        const emailTrimmed = email.trim();
        const passwordTrimmed = password1.trim();

        try {
            const res : Response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailTrimmed, password: passwordTrimmed }),
            });

            if (!res.ok) {
                if( res.status === 403) {
                    toast.error("Account is disabled");
                }
                else{
                    toast.error("Incorrect e-mail or password");
                } 

                return;
            }

            const data = (await res.json()) as {
                accessToken: string;
                tokenType: string;
                expiresInSeconds: number;
            };

            login(data.accessToken, data.tokenType, data.expiresInSeconds, rememberMe);
            navigate("/app/account", { replace: true });
            } catch (e: any) {
                toast.error(e?.message);
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
        <div className="LoginPageWrapper">
        <div className="login-page">
            <h1 className="login-header">Sign in</h1>
            
            <form className="login-form">
                <div className="login-form-row">
                     <input className="login-text-field" type="email" name="email" id="login-email" placeholder="Email" onChange={(e)=>{setEmail(e.target.value);checkIfValidationPassed(e.target.value , password1);}} required/>
                </div>
               
                <div className = "login-form-row">
                    <div className="login-password-wrapper">
                        <input className="login-text-field" type={passwordVisible? "text" : "password"} name="password" id="login-password" placeholder="Password" onChange={(e)=>{setPassword1(e.target.value);checkIfValidationPassed( email , e.target.value);}} required/>
                        <div  className="toggle-password" onClick={()=>togglePassword()}>
                            {passwordVisible?
                            <EyeIcon id="login-password-icon" className="password-icon"/> :
                            <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                        </div>
                    </div>
                </div>
                
                
                <div className="login-form-row login-remember-forgot">
                    <div>
                        <label><input className="login-checkbox"  type="checkbox" name="remember-me" id="login-remember-me" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)}/>Remember me</label>
                    </div>
                    
                    <div>
                        <Link  className="remember-me-link" to="/app/password/change" title='ChangePassword'>Forgot password?</Link>
                    </div>
                    
                </div>

                            
                <div className="ErrorMesssageWrapper">
                    <p className="ErrorMessage">{errorMessage}</p>
                </div>
                <div className="login-form-row">
                      <input className={` login-button ${!initialValidationPassed? "DisabledButton" : ""}`} type="submit" value="Log in" disabled={!initialValidationPassed} onClick={(e)=>handleSubmit(e)}/>
                </div>
              
                <div className="login-form-row login-signup">
                    <span>Don't have an account? <Link className="login-signup-link" to="/app/signup" title='SignUp'>Sign up</Link></span>
                </div>


            </form>
        </div>
        </div>
    );
}