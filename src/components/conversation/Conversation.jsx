import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";

export default function Conversation({ conversation, currentUser }) {
    const [user, setUser] = useState(null);
    const PUBLIC_FOLDER = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        const friendId = conversation.members.find(
            (m) => m !== currentUser._id
        );

        const getUser = async () => {
            try {
                const res = await axios("/users?userId=" + friendId);
                // console.log(res);
                setUser(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        getUser();
    }, [conversation, currentUser]);

    return (
        <div className="conversation">
            <div className="conversationImgContainer">
                <img
                    src={
                        user?.profilePicture
                            ? user.profilePicture
                            : PUBLIC_FOLDER + "images/noAvatar.png"
                    }
                    alt=""
                    className="conversationImg"
                />
            </div>

            <div className="conversationText">
                <div className="conversationName">{user?.username}</div>
                <div className="conversationRecent">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Repellat rerum delectus animi, amet unde tempore aliquid
                    beatae ad, repellendus facere vitae est tempora error
                    accusantium officia exercitationem ipsa voluptatem
                    veritatis!
                </div>
            </div>
        </div>
    );
}
