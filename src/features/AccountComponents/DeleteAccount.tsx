

import { useState } from "react";
import Modal from "../Modal/Modal";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";

export default function DeleteAccount(){
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(true);
    const [deletionResult, setDeletionResult] = useState<"successful" | "error" | "loading" | "stopped">("loading");
    const {logout} = useAuth();

    async function onConfirm(){

        let params = new URLSearchParams(document.location.search);
        const token : string | null = params.get("token"); 
        if(token == null){
            setDeletionResult("error");
            setConfirmDeleteModalOpen(false);
            return
        }

        try {
            const res = await fetch(`http://localhost:9090/api/account/delete/confirm?token=${encodeURIComponent(token)}`, {
                method: "POST",
            });

            if (res.ok) {
                logout();
                setDeletionResult("successful");
                setConfirmDeleteModalOpen(false);
            } else {
               setDeletionResult("error");
               setConfirmDeleteModalOpen(false);
            }
        } catch {
            setDeletionResult("error");
            setConfirmDeleteModalOpen(false);
        }
        
    }

    function onDecline(){
        setDeletionResult("stopped");
        setConfirmDeleteModalOpen(false);
    }



        return(<div className="DeleteAccountConfirmPage">
            {deletionResult==="successful"?  
            <div className="DeleteAccountConfirmPageSuccess"> <h1>Account has been successfully deleted</h1>
            <span>Return to main page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/index" title='index'>here</Link></span> </div>
            : deletionResult==="error"?
            <div className="DeleteAccountConfirmPageError"> <h1>Account couldn't be deleted</h1>
            <span>Return to main page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/index" title='index'>here</Link></span> </div>
             : 
            deletionResult==="loading"?
            <div className="DeleteAccountConfirmPageLoading"> <h1>Loading...</h1> </div>
             : 
            <div className="DeleteAccountConfirmPageError"> <h1>Account deletion stopped</h1>
            <span>Return to main page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/index" title='index'>here</Link></span> </div>}
            <Modal open={isConfirmDeleteModalOpen} onClose={()=>{onDecline()}}>
                        <div className="DeleteAccountConfirmTextWrapper">
                            <h2>Account deletion</h2>
                            <p>Are you sure you want to delete your account and every saved turing machine? This action is irreversible. </p>
                        </div>
                        <div className="DeleteAccountConfirmButtonWrapper">
                            <button className="ModalButton DeleteAccountConfirmOkButton" onClick={()=>{onConfirm()}}>Ok</button>
                        </div>
        </Modal>
        </div>

        
    );
}