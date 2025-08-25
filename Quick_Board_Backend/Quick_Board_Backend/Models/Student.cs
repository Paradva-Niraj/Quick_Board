using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Models
{
    public class Student
    {
        [Key]
        public int StudentId { get; set; }

        [Required]
        public string StudentName { get; set; }

        [Required]
        [ForeignKey("Course")]
        public int StudentCourseId { get; set; }

        [Required]
        public string StudentMail { get; set; }

        [Required]
        public string StudentPassword { get; set; }

        [ForeignKey("Faculty")]
        public int? ApprovedBy { get; set; } = null;

        [Required]
        public bool RequestStatus { get; set; } = false;

        // Navigation Properties
        public Course Course { get; set; }
        public Faculty Faculty { get; set; }
    }
}
