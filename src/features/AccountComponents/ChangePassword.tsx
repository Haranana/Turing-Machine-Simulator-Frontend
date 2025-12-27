import "./../Tape/tape.css" 
import "./../../pages/login-page.css" 
import {EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ChangePassword(){

    const [password1Visible, setPassword1Visible] = useState(false);
    const [password2Visible, setPassword2Visible] = useState(false);
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
    const [initialValidationErrorMessage, setInitialValidationErrorMessage] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) {
            toast.error("Password couldn't be changed");
            return;
        }

        const passwordTrimmed = password1.trim();

        try {
            const res = await fetch(
            `http://localhost:9090/api/account/password/change?token=${encodeURIComponent(token)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: passwordTrimmed }),
            }
            );

            if (res.ok) {
            toast.success("Password changed successfully");
            // tu ewentualnie redirect na /login
            } else if (res.status === 409) {
            toast.error("Password couldn't be changed");
            } else {
            toast.error(`Error while changing password: ${res.status}`);
            }
        } catch {
            toast.error("Password couldn't be changed");
        }
    }

     function checkIfValidationPassed(password1Value: string, password2Value: string){
        const pas1Trimmed = password1Value.trim();
        const pas2Trimmed = password2Value.trim();

        if(pas1Trimmed.length == 0 || pas2Trimmed.length == 0){
            setInitialValidationPassed(false);
            setInitialValidationErrorMessage("No field can be left empty");
        }
        else if(pas1Trimmed != pas2Trimmed){
            setInitialValidationPassed(false);
            setInitialValidationErrorMessage("Passwords do not match");
        }
        else if(pas1Trimmed.length < 8){
            setInitialValidationPassed(false);
            setInitialValidationErrorMessage("Password must be at least 8 characters long");
        }
        else{
            setInitialValidationPassed(true);
            setInitialValidationErrorMessage(null);
        }
    }

    function togglePassword(passwordId: number) {
        if(passwordId==1){
            password1Visible? setPassword1Visible(false) : setPassword1Visible(true);
        }
        else{
            password2Visible? setPassword2Visible(false) : setPassword2Visible(true);
        }
    }

    return(
    <div className="LoginPageWrapper">
        <div className="login-page">
            <h1 className="login-header">Change password</h1>
            
            <form className="login-form" onSubmit={handleSubmit}>
                <div className = "login-form-row">
                    <div className = "login-password-wrapper">
                        <input className="login-text-field" type={password1Visible? "text" : "password"} name="password" id="login-password" placeholder="Password"
                        onChange={(e)=>{setPassword1(e.target.value);  checkIfValidationPassed(e.target.value, password2);}} required/>
                        <span  className="toggle-password" onClick={()=>{togglePassword(1);}}>
                            {password1Visible?
                            <EyeIcon id="login-password-icon" className="password-icon"/> :
                            <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                        </span>
                    </div>
                </div>
                <div className = "login-form-row">
                    <div className = "login-password-wrapper">
                        <input className="login-text-field" type={password2Visible? "text" : "password"} name="password" id="login-password" placeholder="Repeat password"
                        onChange={(e)=>{setPassword2(e.target.value);  checkIfValidationPassed(password1, e.target.value);}} required/>
                        <span  className="toggle-password" onClick={()=>{togglePassword(2);}}>
                            {password2Visible?
                            <EyeIcon id="login-password-icon" className="password-icon"/> :
                            <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                        </span>
                    </div>
                </div>
                <div className = "login-form-row">       
                 <div className="ErrorMesssageWrapper">
                    <p className="ErrorMessage">{initialValidationErrorMessage}</p>
                </div>
                </div>     
                <div className = "login-form-row">  
               <input
                className={`login-button ${!initialValidationPassed ? "DisabledButton" : ""}`}
                type="submit"
                value="Change password"
                disabled={!initialValidationPassed}
                />
                </div>
                                <div className="login-form-row login-signup">
                    <span><Link className="login-signup-link" to="/login" title='Login'>return to login page</Link></span>
                </div>
            </form>
        </div>
    </div>
    );
}