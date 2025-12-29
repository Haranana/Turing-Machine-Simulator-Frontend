import "@auth/styles/Auth.css" 

import { useState } from "react";
import { toast } from 'react-hot-toast';

import Modal from "@modal/Modal";

export default function ForgotPasswordPage(){
    const [email, setEmail] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
    const [initialValidationErrorMessage, setInitialValidationErrorMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


    async function handleSubmit(e: React.MouseEvent){

        e.preventDefault();
        const emailTrimmed = email.trim();

        try {
            const res = await fetch(`http://localhost:9090/api/account/password/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailTrimmed}),
            });

            if (res.ok) {
                setIsModalOpen(true);                   
            } else {
                toast.error("Email couldn't be send");
            }
            } catch (e: any) {
                toast.error("Network error")
            }
        }
    


    function checkIfValidationPassed(emailValue: string,){
        const emailTrimmed = emailValue.trim();

        
        if(emailTrimmed.length == 0 ){
            setInitialValidationPassed(false);
            setInitialValidationErrorMessage("No field can be left empty");
        }
        else{
            setInitialValidationPassed(true);
            setInitialValidationErrorMessage(null);
        }
    }

    return(<>
    <div className="LoginPageWrapper">
        <div className="login-page">
            <h1 className="login-header">Forgot password?</h1>
            <p>Enter the email for your account so we can send you a link to reset your password.</p>
            
            <form className="login-form">
                <div className = "login-form-row">
                    <input className="login-text-field" type="email" name="email" id="login-email" placeholder="Email" required
                onChange={(e)=>{setEmail(e.target.value);checkIfValidationPassed(e.target.value);}}/>
                </div>
                                
                <div className = "login-form-row">
                    <div className="ErrorMesssageWrapper">
                        <p className="ErrorMessage">{initialValidationErrorMessage}</p>
                    </div>
                </div>

                <div className = "login-form-row">
                    <input className={`login-button SignUpButton ${!initialValidationPassed? "DisabledButton" : ""}`} type="submit" value="SEND EMAIL" disabled={!initialValidationPassed} onClick={(e)=>handleSubmit(e)}/>
                </div>
                
            </form>
        </div>
    </div>
        <Modal open={isModalOpen} onClose={()=>{setIsModalOpen(false)}}>
                        <div className="DefaultModalTextWrapper">
                            <h2>E-mail sent!</h2>
                            <p>To recover your password please log in into your mail and follow instructions in message send by us</p>
                        </div>
                        <div className="DefaultModalButtonWrapper">
                            <button className="ModalButton ChangePasswordOkButton" onClick={()=>{setIsModalOpen(false);}}>Ok</button>
                        </div>
        </Modal>
            
            </>
    );
}