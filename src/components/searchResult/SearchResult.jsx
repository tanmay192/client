import "./searchResult.css";

export default function SearchResult({ searchResult }) {
    const PUBLIC_FOLDER = process.env.REACT_APP_PUBLIC_FOLDER;

    return (
        <div className="searchResult">
            <div className="searchResultImgContainer">
                <img
                    src={
                        searchResult?.profilePicture
                            ? searchResult.profilePicture
                            : PUBLIC_FOLDER + "images/noAvatar.png"
                    }
                    alt=""
                    className="searchResultImg"
                />
            </div>

            <div className="searchResultText">
                <div className="searchResultName">{searchResult?.username}</div>
                <div className="searchResultPadding"></div>
            </div>
        </div>
    );
}
