import "./page.css" 
import {Link} from 'react-router-dom';
import {EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useState } from "react";

export default function LoginPage(){

    const [passwordVisible, setPasswordVisible] = useState(false);


    function togglePassword() {
        const passwordField = document.getElementById("login-password") as HTMLInputElement;

        if(!passwordField) return;

        if (passwordField.type === "password") {
            setPasswordVisible(true);
        } else {
            setPasswordVisible(false);
        }
    }

    return(
    <div className="page">
        <div className="login-window">
            <h1 className="login-header">Sign in</h1>
            
            <form action="/submit" method="post">

                <label><input className="login-text-field" type="email" name="email" id="login-email" placeholder="Email" required/></label><br></br>
                <div className = "login-password-wrapper">
                    <input className="login-text-field" type={passwordVisible? "text" : "password"} name="password" id="login-password" placeholder="Password" required/>
                    <span  className="toggle-password" onClick={()=>togglePassword()}>
                        {passwordVisible?
                        <EyeIcon id="login-password-icon" className="password-icon"/> :
                        <EyeSlashIcon id="login-password-icon" className="password-icon"/>}
                    </span>
                </div>
                
                
                <div className="login-remember-forgot">
                    <label><input className="login-checkbox" type="checkbox" name="remember-me" id="login-remember-me"/>Remember me</label>
                    <Link  className="remember-me-link" to="index" title='Simulation'>Forgot password?</Link>
                </div>

                
                <input className="login-button" type="submit" value="Sign in"/>
                <div className="login-signup">
                    <span>Don't have an account? <Link className="login-signup-link" to="/signup" title='SignUp'>Sign up</Link></span>
                </div>
            </form>
        </div>
    </div>
    );
}