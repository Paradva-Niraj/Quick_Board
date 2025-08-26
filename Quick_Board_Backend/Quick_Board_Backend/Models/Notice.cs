using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Models
{
    [Table("notice")]
    public class Notice
    {
        [Key]
        public long NoticeId { get; set; }

        [Required]
        public string NoticeTitle { get; set; }

        [Required]
        public string NoticeDescription { get; set; }

        [Required]
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int NoticeWrittenBy { get; set; }

        [Required]
        public string AuthorType { get; set; } // "Admin" or "Faculty"

        public string? Image { get; set; } = null; // Image URL

        public string? File { get; set; } = null; // File URL

        [Required]
        public bool IsPinned { get; set; } = false;

        public int? Priority { get; set; } = 1;
    }
}