// src/pages/admin/NoticeCard.jsx
import React, { useState } from "react";
import Lightbox from "../../components/ui/Lightbox";

/* helper to get filename from URL */
// function filenameFromUrl(url) {
//   try {
//     const u = new URL(url);
//     const p = u.pathname;
//     return decodeURIComponent(p.substring(p.lastIndexOf("/") + 1)) || url;
//   } catch {
//     return url;
//   }
// }

export default function NoticeCard({ notice, onDelete, canDelete }) {
    const NoticeId = notice.NoticeId ?? notice.noticeId ?? notice.id ?? null;
    const NoticeTitle = notice.NoticeTitle ?? notice.noticeTitle ?? "";
    const NoticeDescription = notice.NoticeDescription ?? notice.noticeDescription ?? "";
    const PublishedAt = notice.PublishedAt ?? notice.publishedAt ?? null;
    const AuthorName = notice.AuthorName ?? notice.authorName ?? "";
    const Image = notice.Image ?? notice.image ?? null;
    const File = notice.File ?? notice.file ?? null;
    const IsPinned = notice.IsPinned ?? notice.isPinned ?? false;
    const Priority = notice.Priority ?? notice.priority ?? null;
    const AuthorType = notice.AuthorType ?? notice.authorType ?? "";

    const time = PublishedAt ? new Date(PublishedAt) : null;
    const timeAgo = (d) => {
        if (!d) return "";
        const diff = Date.now() - new Date(d).getTime();
        const sec = Math.floor(diff / 1000);
        if (sec < 60) return `${sec}s`;
        const min = Math.floor(sec / 60);
        if (min < 60) return `${min}m`;
        const hr = Math.floor(min / 60);
        if (hr < 24) return `${hr}h`;
        const days = Math.floor(hr / 24);
        return `${days}d`;
    };

    // Lightbox state
    const [openImage, setOpenImage] = useState(null);

    return (
        <>
            <article className={`bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 ${IsPinned ? "border-2 border-yellow-200" : ""}`}>
                {Image ? (
                    <div className="w-full md:w-40 flex-shrink-0">
                        <img
                            src={Image}
                            alt={NoticeTitle}
                            className="w-full h-40 object-cover rounded-lg cursor-zoom-in"
                            onClick={() => setOpenImage(Image)}
                        />
                    </div>
                ) : null}

                <div className="flex-1">
                    <header className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{NoticeTitle}</h3>
                            <div className="text-xs text-gray-500 mt-1">
                                <span className="font-medium text-gray-700">{AuthorName || "Unknown"}</span>
                                <span className="mx-2">•</span>
                                <time title={time ? time.toLocaleString() : ""}>{time ? `${timeAgo(time)} ago` : ""}</time>
                                {IsPinned && <span className="ml-3 inline-block px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Pinned</span>}
                                {Priority ? <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">P{Priority}</span> : null}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-gray-400">{AuthorType}</div>
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(NoticeId)}
                                    className="mt-2 inline-flex items-center gap-2 text-red-600 hover:underline text-sm"
                                    title="Delete notice"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="mt-3 text-gray-700">
                        <p className="whitespace-pre-wrap">{NoticeDescription}</p>
                    </div>

                    <footer className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        {File && (
                            <a
                                href={File}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-lg 
               bg-gradient-to-r from-blue-50 to-blue-100 
               border border-blue-200 shadow-sm 
               hover:from-blue-100 hover:to-blue-200 
               hover:shadow-md transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <div className="text-sm font-medium text-gray-800 truncate max-w-xs">
                                    {filenameFromUrl(File)}
                                </div>
                                <span className="ml-2 text-xs font-semibold text-blue-700 underline">
                                    Open
                                </span>
                            </a>
                        )}

                        <div className="text-xs text-gray-400">ID: #{NoticeId ?? "N/A"}</div>
                    </footer>
                </div>
            </article>

            <Lightbox src={openImage} alt={NoticeTitle} isOpen={!!openImage} onClose={() => setOpenImage(null)} />
        </>
    );
}

/* helper function outside component */
function filenameFromUrl(url) {
    try {
        const u = new URL(url);
        const p = u.pathname;
        return decodeURIComponent(p.substring(p.lastIndexOf("/") + 1)) || url;
    } catch {
        return url;
    }
}