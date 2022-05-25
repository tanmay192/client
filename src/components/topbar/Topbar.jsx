import "./topbar.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Topbar({ conversation, currentUser }) {
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
        <div className="topbar">
            <div className="topbarLeft">
                <div className="topbarImg">
                    <img
                        src={
                            user?.profilePicture
                                ? user.profilePicture
                                : PUBLIC_FOLDER + "images/noAvatar.png"
                        }
                        alt=""
                        className="topbarImg"
                    />
                </div>
                <div className="topbarText">
                    <div className="topbarName">{user?.username}</div>
                    <div className="topbarLastSeen">last seen 1 hr ago</div>
                </div>
            </div>
            <div className="topbarRight">
                <div className="topbarLinks">
                    <span className="topbarLink"></span>
                    <span className="topbarLink"></span>
                </div>
            </div>
        </div>
    );
}
