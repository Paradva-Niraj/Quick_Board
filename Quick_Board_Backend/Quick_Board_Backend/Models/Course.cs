using System.ComponentModel.DataAnnotations;

namespace Quick_Board_Backend.Models
{
    public class Course
    {
        [Key]
        public int CourseId { get; set; }
        [Required]
        public string CourseName { get; set; }
    }
}
