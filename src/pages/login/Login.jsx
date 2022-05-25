import { useContext, useRef } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { useHistory } from "react-router-dom";

export default function Login() {
    // We can use state hook also but if we do
    // it will rerender the page if we type anything
    // so we will prevent it
    const email = useRef();
    const password = useRef();

    const { user, isFetching, error, dispatch } = useContext(AuthContext);
    const history = useHistory();

    const handleClick = (event) => {
        event.preventDefault(); // prevent page reloading
        loginCall(
            { email: email.current.value, password: password.current.value },
            dispatch
        );
    };

    console.log(user);
    console.log(error);
    return (
        <div className="login">
            <div className="loginWrapper">
                <div className="loginLeft">
                    <h3 className="loginLogo">Let's Talk</h3>
                    <span className="loginDesc">
                        to the your friends and loved once.
                    </span>
                </div>
                <div className="loginRight">
                    <form className="loginBox" onSubmit={handleClick}>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="loginInput"
                            ref={email}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="loginInput"
                            ref={password}
                            required
                            minLength={6}
                        />
                        <button
                            className="loginButton"
                            type="submit"
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <CircularProgress
                                    style={{ color: "#fff" }}
                                    size="18px"
                                />
                            ) : (
                                "Log In"
                            )}
                        </button>
                        <span className="loginForget">Forgetten Password?</span>
                        <span className="loginSeperator"></span>
                        <button
                            className="loginRegisterButton"
                            disabled={isFetching}
                            onClick={() => {
                                history.push("/register");
                            }}
                        >
                            Create New Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
