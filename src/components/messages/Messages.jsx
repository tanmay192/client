import "./messages.css";
import { format } from "timeago.js";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

export default function Messages({ message, own, currentChat }) {
    const { user } = useContext(AuthContext);
    const [receiver, setReceiver] = useState(null);
    const PUBLIC_FOLDER = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        // console.log(currentChat);
        const friendId = currentChat.members.find(
            (member) => member !== user._id
        );

        const getReceiver = async () => {
            try {
                const res = await axios("/users?userId=" + friendId);
                // console.log(res);
                setReceiver(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        getReceiver();
    }, [currentChat, user]);

    return (
        <div className={own ? "messages own" : "messages"}>
            <div className="messagesAbove">
                <img
                    src={
                        own
                            ? user.profilePicture
                                ? user.profilePicture
                                : PUBLIC_FOLDER + "images/noAvatar.png"
                            : receiver?.profilePicture
                            ? receiver?.profilePicture
                            : PUBLIC_FOLDER + "images/noAvatar.png"
                    }
                    alt=""
                    className="messagesImg"
                />
                <p className="messagesText">{message.text}</p>
            </div>
            <div className="messagesBelow">{format(message.createdAt)}</div>
        </div>
    );
}
