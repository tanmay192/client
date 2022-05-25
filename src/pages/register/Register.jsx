import "./register.css";
import { useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const username = useRef();
    const email = useRef();
    const password = useRef();
    const passwordConfirm = useRef();
    const history = useHistory();

    const handleClick = async (event) => {
        event.preventDefault(); // prevent page reloading
        if (password.current.value !== passwordConfirm.current.value) {
            passwordConfirm.current.setCustomValidity("Passwords don't match");
        } else {
            const newUser = {
                username: username.current.value,
                email: email.current.value,
                password: password.current.value,
            };

            try {
                await axios.post("/auth/register", newUser);
                alert(
                    "User signed up successfully.\nGo to Login page to access your account"
                );
            } catch (err) {
                console.log(err);
                alert(
                    "User already exists.\nGo to Login page to access your account"
                );
            }
        }
    };

    return (
        <div className="register">
            <div className="registerWrapper">
                <div className="registerLeft">
                    <h3 className="registerLogo">Let's Talk</h3>
                    <span className="registerDesc">
                        to the your friends and loved once.
                    </span>
                </div>
                <div className="registerRight">
                    <form className="registerBox" onSubmit={handleClick}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="registerInput"
                            ref={username}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            className="registerInput"
                            ref={email}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="registerInput"
                            ref={password}
                            required
                            minLength={6}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="registerInput"
                            ref={passwordConfirm}
                            required
                            minLength={6}
                        />
                        <button className="registerButton" type="submit">
                            Sign Up
                        </button>
                        <span className="registerSeperator"></span>

                        <button
                            className="registerLoginButton"
                            onClick={() => {
                                history.push("/login");
                            }}
                        >
                            Login to Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
