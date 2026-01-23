import "@auth/styles/Auth.css" 

import {EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useState } from "react";
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

import Modal from "@modal/Modal";
import { API_BASE_URL } from "@api/apiUtils";

export default function SignUpPage(){

    const [password1Visible, setPassword1Visible] = useState(false);
    const [password2Visible, setPassword2Visible] = useState(false);
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
    const [initialValidationErrorMessage, setInitialValidationErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


    async function handleSubmit(e: React.MouseEvent){

        e.preventDefault();
        const emailTrimmed = email.trim();
        const pas1Trimmed = password1.trim();
        //const pas2Trimmed = password2.trim();

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailTrimmed, password: pas1Trimmed }),
            });

            if (res.ok) {
                setEmail("");
                setPassword1("");
                setPassword2("");
                //toast.success("Account succesfully created")
                setIsModalOpen(true);

            } else if (res.status === 400) {
                //const text = await res.text();
                //setInitialValidationPassed(true);
                //setInitialValidationErrorMessage(text || "Nieprawidłowe dane (400).");
                toast.error("Incorrect data")
            } else if (res.status === 409) {
                //setInitialValidationPassed(true);
                //setInitialValidationErrorMessage("Użytkownik o tym e-mailu już istnieje.");
                toast.error("Account with given e-mail already exists")
            } else {
                toast.error("Account with given e-mail already exists")
                //const text = await res.text();
                //setInitialValidationPassed(true);
                //setInitialValidationErrorMessage(text || `Błąd serwera (${res.status}).`);
            }
            } catch (e: any) {
                //setInitialValidationPassed(true);
                //setInitialValidationErrorMessage(e.message ?? "Błąd sieci.");
                toast.error("Network error")
            }
        }
    


    function checkIfValidationPassed(emailValue: string, password1Value: string, password2Value: string){
        const emailTrimmed = emailValue.trim();
        const pas1Trimmed = password1Value.trim();
        const pas2Trimmed = password2Value.trim();
        

        if(emailTrimmed.length == 0 || pas1Trimmed.length == 0 || pas2Trimmed.length == 0){
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
        <>
    <div className="LoginPageWrapper">
        <div className="login-page">
            <h1 className="login-header">Create an account</h1>
            
            <form className="login-form">
                <div className = "login-form-row">
                    <input className="login-text-field" type="email" name="email" id="login-email" placeholder="Email" required
                onChange={(e)=>{setEmail(e.target.value);checkIfValidationPassed(e.target.value, password1, password2);}}/>
                </div>
                
                <div className = "login-form-row">
                    <div className = "login-password-wrapper">
                    <input className="login-text-field" type={password1Visible? "text" : "password"} name="password" id="login-password" placeholder="Password"
                    onChange={(e)=>{setPassword1(e.target.value);  checkIfValidationPassed(email, e.target.value, password2);}} required/>
                    <span  className="toggle-password" onClick={()=>{togglePassword(1);}}>
                        {password1Visible?
                        <EyeIcon id="login-password-icon" className="password-icon"/> :
                        <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                    </span>
                </div>
                </div>
                
                <div className = "login-form-row">
                    <div className = "login-password-wrapper">
                    <input className="login-text-field" type={password2Visible? "text" : "password"} name="password" id="login-password-confirm" placeholder="Repeat password"
                    onChange={(e)=>{setPassword2(e.target.value);  checkIfValidationPassed(email, password1, e.target.value);}} required/>
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
                    <input className={`login-button SignUpButton ${!initialValidationPassed? "DisabledButton" : ""}`} type="submit" value="Sign up" disabled={!initialValidationPassed} onClick={(e)=>handleSubmit(e)}/>
                </div>

                                                <div className = "login-form-row">
                    <Link to="/app/about#privacySection">Site data usage</Link>
                </div>
                
            </form>
        </div>
    </div>
            <Modal open={isModalOpen} onClose={()=>{setIsModalOpen(false)}}>
                            <div className="DefaultModalTextWrapper ChangePasswordTextWrapper">
                                <h2>Account created</h2>
                                <p>To log in to your new account, please activate it by clicking link sent to your email</p>
                            </div>
                            <div className="DefaultModalButtonWrapper ChangePasswordButtonWrapper">
                                <button className="ModalButton ChangePasswordOkButton" onClick={()=>{ navigate("/app/login", { replace: true });}}>Ok</button>
                            </div>
            </Modal>
            </>
    );
}