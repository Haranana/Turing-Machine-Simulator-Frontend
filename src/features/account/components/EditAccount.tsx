import { useContext, useState } from "react";
import toast from "react-hot-toast";

import { AccountDataContext } from "@account/hooks/AccountDataContext";
import Modal from "@modal/Modal";
import { useApiFetch } from "@api/apiUtils";
import { dateToShowable } from "@account/components/TmView";
import { API_BASE_URL } from "@api/apiUtils";

export default function EditProfile(){

    const accountData = useContext(AccountDataContext);
    const [isChangePasswordModalOpen , setChangePasswordModalOpen]= useState<boolean>(false);
    const [isDeleteAccountModalOpen , setDeleteAccountModalOpen]= useState<boolean>(false);
    const apiFetch = useApiFetch();

    async function onChangePasswordClicked() {
        if (!accountData) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/account/password/token`, {
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
            const res = await apiFetch(`${API_BASE_URL}/api/account/delete/token`, {
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

        function isAccountDataLoaded(){
        return accountData!=null&& accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null;
    }

    return <>
    <div className="AccountPageSubpage EditAccountSubpage">
     {isAccountDataLoaded() ? <>
        <div className="editProfileRow">
            <div className="editProfileTextField">
                <p className="editProfileTextFieldTitle">Email: </p>
                <p className="editProfileTextFieldValue">{accountData?.email}</p>
            </div>
        </div>

        <div className="editProfileRow">
            <div className="editProfileTextField">
                <p className="editProfileTextFieldTitle">User since: </p>
                <p className="editProfileTextFieldValue">{ (accountData != null && accountData.createdAt != null)? dateToShowable(accountData.createdAt) : ""}</p>
            </div>
        </div>

        <div className="editProfileRow"><button className="editProfileButton changePasswordButton" onClick={onChangePasswordClicked}>Change password</button></div>
    
        <div className="editProfileRow"><button className="editProfileButton deleteAccountButton" onClick={onDeleteAccountClicked}>Delete account</button> </div>
        </> : 
        <div className="DataNotLoadedDiv">Error: Account data couldn't be loaded</div> }
        
    </div>

        {/*<hr className='LineSeparator'></hr>*/}
        <Modal open={isChangePasswordModalOpen} onClose={()=>{setChangePasswordModalOpen(false)}}>
                        <div className="DefaultModalTextWrapper ChangePasswordTextWrapper">
                            <h2>E-mail sent!</h2>
                            <p>To change your password please log in into your mail and follow instructions in message send by us</p>
                        </div>
                        <div className="DefaultModalButtonWrapper ChangePasswordButtonWrapper">
                            <button className="ModalButton ChangePasswordOkButton" onClick={()=>{setChangePasswordModalOpen(false);}}>Ok</button>
                        </div>
        </Modal>
        <Modal open={isDeleteAccountModalOpen} onClose={()=>{setDeleteAccountModalOpen(false)}}>
                        <div className="DefaultModalTextWrapper DeleteAccountTextWrapper">
                            <h2>E-mail sent!</h2>
                            <p>To delete your account please log in into your mail and follow instructions in message send by us</p>
                        </div>
                        <div className="DefaultModalButtonWrapper DeleteAccountButtonWrapper">
                            <button className="ModalButton DeleteAccountOkButton" onClick={()=>{setDeleteAccountModalOpen(false);}}>Ok</button>
                        </div>
        </Modal>

    </>
}