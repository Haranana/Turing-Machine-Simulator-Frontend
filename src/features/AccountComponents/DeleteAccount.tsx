

import { useState } from "react";
import Modal from "../Modal/Modal";
import { useAuth } from "../../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function DeleteAccount(){
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(true);
    const [deletionResult, setDeletionResult] = useState<"successful" | "error" | "loading" | "stopped">("loading");
    const {logout} = useAuth();
    const navigate = useNavigate();

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



        return(        <>                
            <Modal open={!isConfirmDeleteModalOpen} onClose={()=>{ navigate("/login", { replace: true });}}>
                        
                            {deletionResult==="successful"?  
                                <div className="DefaultModalTextWrapper"> <h2>Account has been successfully deleted</h2>
                                <p>Return to login page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/login" title='index'>here</Link></p>
                                 </div>
                            : deletionResult==="error"?
                            <div className="DefaultModalTextWrapper"> <h2>Account couldn't be deleted</h2>
                            <p>Return to login page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/login" title='index'>here</Link></p> 
                            </div>
                            :  deletionResult==="loading"? 
                            <div className="DefaultModalTextWrapper"> <h2>Loading...</h2> </div>
                            : <div className="DefaultModalTextWrapper"> <h2>Account deletion stopped</h2>
                            <p>Return to login page by clicking <Link className="DeleteAccountConfirmIndexLink" to="/login" title='index'>here</Link></p>  </div>}                        
                        <div className="DefaultModalButtonWrapper">                           
                                <button className="ModalButton " onClick={()=>{ navigate("/login", { replace: true });}}>Ok</button>                                                   
                        </div>
                      
            </Modal>
            <Modal open={isConfirmDeleteModalOpen} onClose={()=>{onDecline()}}>
                        <div className="DefaultModalTextWrapper DeleteAccountConfirmTextWrapper">
                            <h2>Account deletion</h2>
                            <p>Are you sure you want to delete your account and every saved turing machine? This action is irreversible. </p>
                        </div>
                        <div className="DefaultModalButtonWrapper">                           
                                <button className="ModalButton DeleteAccountConfirmOkButton" onClick={()=>{onConfirm()}}>Delete</button>                                                   
                                <button className="ModalButton" onClick={()=>{onConfirm()}}>Cancel</button>
                        </div>
                      
            </Modal>
        </>

        
    );
}