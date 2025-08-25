namespace Quick_Board_Backend.DTOs
{
    public class NoticeCreateDto
    {
        public string NoticeTitle { get; set; }
        public string NoticeDescription { get; set; }

        // Who wrote it:
        public int NoticeWrittenBy { get; set; }     // id from Admin or Faculty
        public string AuthorType { get; set; }       // "Admin" or "Faculty"

        // optional
        public string? Image { get; set; }
        public string? File { get; set; }
        public bool? IsPinned { get; set; }
        public string? Priority { get; set; }        // "low" | "medium" | "high"
    }

    public class NoticeUpdateDto
    {
        public string? NoticeTitle { get; set; }
        public string? NoticeDescription { get; set; }
        public string? Image { get; set; }
        public string? File { get; set; }
        public bool? IsPinned { get; set; }
        public string? Priority { get; set; }
    }

    public class NoticeReadDto
    {
        public long NoticeId { get; set; }
        public string NoticeTitle { get; set; }
        public string NoticeDescription { get; set; }
        public DateTime PublishedAt { get; set; }
        public int NoticeWrittenBy { get; set; }
        public string AuthorType { get; set; }
        public string? Image { get; set; }
        public string? File { get; set; }
        public bool IsPinned { get; set; }
        public string? Priority { get; set; }
    }
}
