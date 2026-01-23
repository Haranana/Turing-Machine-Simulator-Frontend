import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Modal from "@modal/Modal";
import { API_BASE_URL } from "@api/apiUtils";

export default function AccountActivatedPage(){
    //const [activationResponse, setActivationResponse] = useState<String>("");
    const [activated, setActivated] = useState<"active" | "error" | "loading">("loading");
    const navigate = useNavigate();

    useEffect(()=>{
        let params = new URLSearchParams(document.location.search);
        const token : string | null = params.get("token"); 
        if(token == null){
            setActivated("error");
            return
        }

        const run = async ()=>{
            try {
                const res = await fetch(`${API_BASE_URL}/api/account/activate?token=${encodeURIComponent(token)}`, {method: "POST"})
                if (res.status == 200 ) {
                    setActivated("active")
                }else{
                    setActivated("error");
                }
            }catch(e: any){
                setActivated("error");
            }
        };
        run().catch(console.error);

    },[]);

    return <>
                <Modal open={true} onClose={()=>{ navigate("/app/login", { replace: true });}}>
                                <div className="DefaultModalTextWrapper ChangePasswordTextWrapper">
                                    
                                     {activated==="active"?<><h2>Account created</h2>  <p>Account has been successfully activated, please log in  <Link className="accountActivatedLoginLink" to="/app/login" title='Login'>here</Link></p> </> 
                                    : activated==="loading"?  <p>Loading...</p> :  <p>Something went wrong</p>}
                                </div>
                                <div className="DefaultModalButtonWrapper ChangePasswordButtonWrapper">
                                    <button className="ModalButton ChangePasswordOkButton" onClick={()=>{ navigate("/login", { replace: true });}}>Ok</button>
                                </div>
                </Modal>
                </>
}