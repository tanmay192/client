import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";

// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
    const { user } = useContext(AuthContext);

    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    {user ? <Home /> : <Login />}
                </Route>
                <Route path="/login">
                    {user ? <Redirect to="/" /> : <Login />}
                </Route>
                <Route path="/register">
                    {user ? <Redirect to="/" /> : <Register />}
                </Route>
            </Switch>
        </Router>
        // <Router>
        //     <Routes>
        //         <Route exact path="/" element={user ? <Home /> : <Login />} />

        //         <Route
        //             path="/login"
        //             element={user ? <Link to="/" /> : <Login />}
        //         />

        //         <Route
        //             path="/register"
        //             element={user ? <Link to="/" /> : <Register />}
        //         />
        //     </Routes>
        // </Router>
    );
}

export default App;
