
// ==============================
// 青梅の最新動画を自動取得
// ==============================

// Google Cloudで取得したAPIキーを入力
const API_KEY = "AIzaSyAHU6lMxhXtYyjEo8B1NnCPfJzduM-wyWQ";

// 青梅のアップロード動画一覧
const UPLOADS_PLAYLIST_ID = "UU3JdjHJ-Eyi-BrNZ4pxb1Kw";

// 最新動画を取得する
// 動画の再生時間を秒数に変換する
function durationToSeconds(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

// 最新の通常動画を取得する
async function loadLatestVideo() {
    const playlistUrl =
        "https://www.googleapis.com/youtube/v3/playlistItems" +
        "?part=snippet" +
        "&playlistId=" + UPLOADS_PLAYLIST_ID +
        "&maxResults=20" +
        "&key=" + encodeURIComponent(API_KEY);

    try {
        // 最新20件の動画を取得
        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (!playlistResponse.ok) {
            console.error("YouTube APIエラー:", playlistData);
            throw new Error("動画一覧を取得できませんでした");
        }

        const videoIds = playlistData.items
            .map(item => item.snippet.resourceId.videoId)
            .join(",");

        if (!videoIds) {
            throw new Error("動画が見つかりませんでした");
        }

        // 動画の再生時間を取得
        const videoUrl =
            "https://www.googleapis.com/youtube/v3/videos" +
            "?part=contentDetails" +
            "&id=" + videoIds +
            "&key=" + encodeURIComponent(API_KEY);

        const videoResponse = await fetch(videoUrl);
        const videoData = await videoResponse.json();

        if (!videoResponse.ok) {
            console.error("動画情報取得エラー:", videoData);
            throw new Error("動画情報を取得できませんでした");
        }

        // 3分を超える動画を通常動画として扱う
        const normalVideo = videoData.items.find(video =>
            durationToSeconds(video.contentDetails.duration) > 180
        );

        if (!normalVideo) {
            throw new Error("最新20件の中に通常動画が見つかりませんでした");
        }

        const videoId = normalVideo.id;

        // 動画のタイトルを取得
        const selectedItem = playlistData.items.find(item =>
            item.snippet.resourceId.videoId === videoId
        );

        document.getElementById("latest-video-player").src =
            "https://www.youtube.com/embed/" + videoId;

        document.getElementById("latest-video-title").textContent =
            selectedItem.snippet.title;

        document.getElementById("latest-video-link").href =
            "https://www.youtube.com/watch?v=" + videoId;

        console.log("最新の通常動画を取得しました:", selectedItem.snippet.title);

    } catch (error) {
        console.error("最新動画の取得エラー:", error);

        document.getElementById("latest-video-title").textContent =
            "最新動画を取得できませんでした";
    }
}
document.addEventListener("DOMContentLoaded", loadLatestVideo);
