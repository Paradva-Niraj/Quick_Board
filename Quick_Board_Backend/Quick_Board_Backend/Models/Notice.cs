using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Models
{
    [Table("notice")]
    public class Notice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("notice_id")]
        public long NoticeId { get; set; }

        [Required, MaxLength(200)]
        [Column("title")]
        public string NoticeTitle { get; set; }

        [Required]
        [Column("description", TypeName = "longtext")]
        public string NoticeDescription { get; set; }

        [Required]
        [Column("published_at")]
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        // who wrote it (id from Admin or Faculty)
        [Required]
        [Column("author_id")]
        public int NoticeWrittenBy { get; set; }

        // "Admin" or "Faculty"
        [Required]
        [Column("author_type")]
        public string AuthorType { get; set; }

        [Url, MaxLength(2048)]
        [Column("image_url")]
        public string? Image { get; set; }

        [Url, MaxLength(2048)]
        [Column("file_url")]
        public string? File { get; set; }

        [Required]
        [Column("is_pinned")]
        public bool IsPinned { get; set; } = false;

        // "low", "medium", "high" (optional)
        [Column("priority")]
        public string? Priority { get; set; }
    }
}
