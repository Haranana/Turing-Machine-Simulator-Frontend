import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AccountActivatedPage(){
    //const [activationResponse, setActivationResponse] = useState<String>("");
    const [activated, setActivated] = useState<"active" | "error" | "loading">("loading");

    useEffect(()=>{
        let params = new URLSearchParams(document.location.search);
        const token : string | null = params.get("token"); 
        if(token == null){
            setActivated("error");
            return
        }

        const run = async ()=>{
            try {
                const res = await fetch(`http://localhost:9090/api/account/activate?token=${encodeURIComponent(token)}`, {method: "POST"})
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

    return <div className="AccountActivatedPage">
        {activated==="active"?  <span>Account has been successfully activated, please log in  <Link className="accountActivatedLoginLink" to="/login" title='Login'>here</Link></span> 
        : activated==="loading"?  <span>Loading</span> :  <span>Something went wrong</span>}
    </div>
}