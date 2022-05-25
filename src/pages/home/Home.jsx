import "./home.css";
import Conversation from "../../components/conversation/Conversation";
import Messages from "../../components/messages/Messages";
import Topbar from "../../components/topbar/Topbar";
import SearchResult from "../../components/searchResult/SearchResult";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import SendIcon from "@mui/icons-material/Send";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import { scheduleJob } from "node-schedule";

export default function Login() {
    const PUBLIC_FOLDER = process.env.REACT_APP_PUBLIC_FOLDER;
    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");
    const [searchRes, setSearchRes] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [newConversation, setNewConversation] = useState(null);
    const [popover, setPopover] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(new Date());
    const socket = useRef();
    const { user } = useContext(AuthContext);
    const textInput = useRef(null);
    const scrollRef = useRef();
    const history = useHistory();

    useEffect(() => {
        socket.current = io(process.env.REACT_APP_SOCKET_URL);
        socket.current.on("getMessage", (data) => {
            console.log("payload", data);
            setArrivalMessage({
                senderId: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });

        socket.current.on("acceptConversation", (data) => {
            console.log("converse", data);
            setNewConversation({
                members: [data.senderId, data.receiverId],
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members.includes(arrivalMessage.senderId) &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        newConversation &&
            setConversations((prev) => [...prev, newConversation]);
    }, [newConversation]);

    useEffect(() => {
        socket.current.emit("addUser", user._id);
        socket.current.on("getUsers", (users) => {
            console.log(users);
        });
    }, [socket, user]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await axios.get("/conversations/" + user._id);
                setConversations(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        getConversations();
    }, [user._id]);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const res = await axios.get("/messages/" + currentChat?._id);
                setMessages(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getMessages();
    }, [currentChat]);

    const handleClickSend = async (event) => {
        event.preventDefault();

        const message = {
            conversationId: currentChat._id,
            senderId: user._id,
            text: newMessage,
        };

        // get receiver id
        const receiverId = currentChat.members.find(
            (member) => member !== user._id
        );

        socket.current.emit("sendMessage", {
            senderId: user._id,
            receiverId,
            text: newMessage,
        });

        textInput.current.value = "";

        try {
            const res = await axios.post("/messages", message);
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.log(err);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickScheduleSend = async (event) => {
        event.preventDefault();

        if (
            value instanceof Date &&
            !isNaN(value.valueOf()) &&
            value > Date.now()
        ) {
            const message = {
                conversationId: currentChat._id,
                senderId: user._id,
                text: newMessage,
            };

            // get receiver id
            const receiverId = currentChat.members.find(
                (member) => member !== user._id
            );

            textInput.current.value = "";
            setOpen(false);

            scheduleJob(value, () => {
                socket.current.emit("sendMessage", {
                    senderId: user._id,
                    receiverId,
                    text: newMessage,
                });
            });

            try {
                const res = await axios.post("/messages/" + value, message);
                setMessages([...messages, res.data]);
                setNewMessage("");
            } catch (err) {
                console.log(err);
            }
        } else {
            alert("Select a valid date.");
        }
    };

    const handleClickSearch = async (event) => {
        event.preventDefault();

        if (search) {
            const res = await axios.get("/users?email=" + search);
            // res.data ? console.log(res.data) : console.log("User not found");
            res.data && res.data._id !== user._id
                ? setSearchRes([...searchRes, res.data])
                : setSearchRes([]);
        }

        setPopover(true);
    };

    const handlePopClose = () => {
        setSearchRes([]);
        setPopover(false);
    };

    const handleClickStartConversation = async (event) => {
        event.preventDefault();

        setPopover(false);
        const receiver = searchRes.at(0);
        let isDuplicate = false;

        // avoid duplicate conversation
        conversations.forEach((conversation) => {
            const receiverId = conversation.members.find(
                (member) => member !== user._id
            );

            if (receiverId === receiver._id) {
                isDuplicate = true;
                return;
            }
        });

        if (!isDuplicate) {
            const newConversation = {
                senderId: user._id,
                receiverId: receiver._id,
            };

            try {
                const res = await axios.post("/conversations", newConversation);
                // console.log(res.data);
                setConversations([...conversations, res.data]);
                setSearch("");
                socket.current.emit("startConversation", {
                    senderId: user._id,
                    receiverId: receiver._id,
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            alert("Conversation already started");
        }
    };

    const handleClickLogout = () => {
        localStorage.clear();
        history.push("/login");
        window.location.reload();
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // console.log(user);
    // console.log(currentChat);
    // console.log(messages);
    return (
        <div className="home">
            <div className="chatMenu">
                <div className="chatMenuWrapper">
                    <div className="chatMenuSearch">
                        <div className="searchBar">
                            <input
                                placeholder="Search for friends"
                                className="searchInput"
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />

                            <Popover
                                open={popover}
                                anchorReference="anchorPosition"
                                anchorPosition={{ top: 60, left: 30 }}
                                onClose={handlePopClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                            >
                                {searchRes.length ? (
                                    searchRes.map((sRes) => (
                                        <div
                                            onClick={
                                                handleClickStartConversation
                                            }
                                        >
                                            <SearchResult searchResult={sRes} />
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        style={{
                                            padding: "10px",
                                            width: "350px",
                                        }}
                                    >
                                        No result found
                                    </div>
                                )}
                            </Popover>

                            <SearchIcon
                                style={{
                                    height: "100%",
                                    justifySelf: "center",
                                    color: "#808080",
                                    cursor: "pointer",
                                    paddingRight: "4px",
                                    marginRight: "6px",
                                }}
                                onClick={handleClickSearch}
                            />
                        </div>
                        <div className="chatMenuUserImg">
                            <img
                                src={
                                    user.profilePicture
                                        ? user.profilePicture
                                        : PUBLIC_FOLDER + "images/noAvatar.png"
                                }
                                alt=""
                                className="userImg"
                            />
                        </div>
                    </div>
                    <div className="chatConversations">
                        {conversations.map((conversation) => (
                            <div onClick={() => setCurrentChat(conversation)}>
                                <Conversation
                                    conversation={conversation}
                                    currentUser={user}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="chatLogout" onClick={handleClickLogout}>
                        <LogoutIcon style={{ color: "#fff" }} />
                        <div className="logout">Logout</div>
                    </div>
                </div>
            </div>
            <div className="chatBox">
                {currentChat ? (
                    <>
                        <Topbar conversation={currentChat} currentUser={user} />
                        <div className="chatBoxWrapper">
                            <div className="chatBoxAbove">
                                <div className="chatBoxMessages">
                                    {messages.map((message) => (
                                        <div ref={scrollRef}>
                                            <Messages
                                                message={message}
                                                own={
                                                    message.senderId ===
                                                    user._id
                                                }
                                                currentChat={currentChat}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="chatBoxBelow">
                                <TextareaAutosize
                                    required
                                    aria-label="message textarea"
                                    placeholder="Type your messages..."
                                    minRows={2}
                                    onChange={(event) =>
                                        setNewMessage(event.target.value)
                                    }
                                    ref={textInput}
                                    spellCheck={false}
                                    style={{
                                        width: "100%",
                                        fontSize: "15px",
                                        padding: "10px",
                                        marginRight: "12px",
                                    }}
                                />
                                <div>
                                    <button
                                        className="chatSubmitButton"
                                        onClick={handleClickSend}
                                        style={{ marginRight: "6px" }}
                                    >
                                        <SendIcon />
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className="chatSubmitButton"
                                        onClick={handleClickOpen}
                                    >
                                        <ScheduleSendIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Schedule Message</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Select the date and time you want to send
                                    the message.
                                </DialogContentText>
                                <br />
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DateTimePicker
                                        renderInput={(props) => (
                                            <TextField {...props} />
                                        )}
                                        value={value}
                                        onChange={(newValue) => {
                                            setValue(newValue);
                                        }}
                                        minDate={Date.now()}
                                        minTime={new Date()}
                                    />
                                </LocalizationProvider>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    style={{ color: "red" }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleClickScheduleSend}>
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                ) : (
                    <span className="noConversationText">
                        Open an conversation to start chatting.
                    </span>
                )}
            </div>
        </div>
    );
}
