import { useContext, useState } from "react";
import { AccountDataContext } from "./AccountDataContext";
import Modal from "../Modal/Modal";
import toast from "react-hot-toast";
import { useApiFetch } from "../../api/util";
import { dateToShowable } from "./TuringMachineToLoad";

export default function EditProfile(){

    const accountData = useContext(AccountDataContext);
    const [isChangePasswordModalOpen , setChangePasswordModalOpen]= useState<boolean>(false);
    const [isDeleteAccountModalOpen , setDeleteAccountModalOpen]= useState<boolean>(false);
    const apiFetch = useApiFetch();

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

    async function onDeleteAccountClicked(){
        if (!accountData) return;

        try {
            const res = await apiFetch("http://localhost:9090/api/account/delete/token", {
                method: "POST",
            });

            if (res.ok) {
                setDeleteAccountModalOpen(true);
            } else {
                toast.error("Account couldn't be Deleted");
            }
        } catch {
            toast.error("Account couldn't be Deleted");
        }
    }

    return <div className="AccountPageSubpage LoadTuringMachineSubpage">

        <div className="editProfileRow">
            <div className="editProfileTextField">
                <p className="editProfileTextFieldTitle">Email: </p>
                <p className="editProfileTextFieldValue">{accountData?.email}</p>
            </div>
        </div>

        <div className="editProfileRow">
            <div className="editProfileTextField">
                <p className="editProfileTextFieldTitle">User since: </p>
                <p className="editProfileTextFieldValue">{accountData != null? dateToShowable(accountData.createdAt) : ""}</p>
            </div>
        </div>

        <div className="editProfileRow"><button className="editProfileButton changePasswordButton" onClick={onChangePasswordClicked}>Change password</button></div>
        

        <div className="editProfileRow"><button className="editProfileButton deleteAccountButton" onClick={onDeleteAccountClicked}>Delete account</button> </div>
        
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
        <Modal open={isDeleteAccountModalOpen} onClose={()=>{setDeleteAccountModalOpen(false)}}>
                        <div className="DeleteAccountTextWrapper">
                            <h2>E-mail sent!</h2>
                            <p>To delete your account please log in into your mail and follow instructions in message send by us</p>
                        </div>
                        <div className="DeleteAccountButtonWrapper">
                            <button className="ModalButton DeleteAccountOkButton" onClick={()=>{setDeleteAccountModalOpen(false);}}>Ok</button>
                        </div>
        </Modal>
    </div>
}