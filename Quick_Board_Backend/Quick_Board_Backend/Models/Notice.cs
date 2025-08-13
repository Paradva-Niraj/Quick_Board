using System.ComponentModel.DataAnnotations;

namespace Quick_Board_Backend.Models
{
    public class Notice
    {
        [Key]
        public long NoticeId { get; set; }

        public string NoticeTitle { get; set; }
        public string NoticeDescription { get; set; }
        public DateTime DateTime { get; set; }
        public int NoticeWrittenBy { get; set; }
        public String Image { get; set; }
        public String File { get; set; }
        public bool IsPinned { get; set; }
        public string? Priority { get; set; }
    }
}
