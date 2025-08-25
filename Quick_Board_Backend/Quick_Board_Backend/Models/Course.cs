using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Models
{
    [Table("course")]
    public class Course
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // 👈 prevents auto increment
        public int CourseId { get; set; }

        [Required]
        public string CourseName { get; set; }
    }
}
