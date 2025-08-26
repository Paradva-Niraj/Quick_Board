namespace Quick_Board_Backend.DTOs
{
    // Input when creating notice
    public class NoticeCreateDto
    {
        public string NoticeTitle { get; set; }
        public string NoticeDescription { get; set; }
        public int NoticeWrittenBy { get; set; } // Admin or Faculty ID
        public string AuthorType { get; set; } // "Admin" or "Faculty"
        public string? Image { get; set; } // Image URL
        public string? File { get; set; } // File URL
        public bool IsPinned { get; set; } = false;
        public int? Priority { get; set; } = 1; // "low", "medium", "high"
    }

    // Output for reading notice (don't show internal details)
    public class NoticeReadDto
    {
        public long NoticeId { get; set; }
        public string NoticeTitle { get; set; }
        public string NoticeDescription { get; set; }
        public DateTime PublishedAt { get; set; }
        public int NoticeWrittenBy { get; set; }
        public string AuthorType { get; set; }
        public string? AuthorName { get; set; } // Name of Admin or Faculty who wrote it
        public string? Image { get; set; }
        public string? File { get; set; }
        public bool IsPinned { get; set; }
        public int? Priority { get; set; }
    }
}