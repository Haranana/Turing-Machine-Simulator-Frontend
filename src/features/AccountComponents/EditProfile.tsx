import { useContext, useState } from "react";
import { AccountDataContext } from "./AccountDataContext";
import Modal from "../Modal/Modal";
import toast from "react-hot-toast";

export default function EditProfile(){
    const accountData = useContext(AccountDataContext);
    const [isChangePasswordModalOpen , setChangePasswordModalOpen]= useState<boolean>(false);

    async function onChangePasswordClicked() {
        if (!accountData) return;

        try {
            const res = await fetch("http://localhost:9090/api/account/password/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: accountData.email }),
            });

            if (res.ok) {
            setChangePasswordModalOpen(true);
            } else {
            toast.error("Password couldn't be changed");
            }
        } catch {
            toast.error("Password couldn't be changed");
        }
    }

    return <div className="AccountPageSubpage LoadTuringMachineSubpage">
        <p className="editProfileTextField">Email: {accountData?.email}</p>
        <p className="editProfileTextField">User since: {accountData?.createdAt}</p>
        <button className="editProfileButton changePasswordButton" onClick={onChangePasswordClicked}>Change password</button>
        <button className="editProfileButton deleteAccountButton">Delete account</button> 
        {/*<hr className='LineSeparator'></hr>*/}
        <Modal open={isChangePasswordModalOpen} onClose={()=>{setChangePasswordModalOpen(false)}}>
                        <div className="ChangePasswordTextWrapper">
                            <h2>E-mail sent!</h2>
                            <p>To change your password please log in into your mail and follow instructions in message send by us</p>
                        </div>
                        <div className="ChangePasswordButtonWrapper">
                            <button className="ModalButton ChangePasswordOkButton" onClick={()=>{setChangePasswordModalOpen(false);}}>Ok</button>
                        </div>
        </Modal>
    </div>
}