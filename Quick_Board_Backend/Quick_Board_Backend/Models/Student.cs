using System.ComponentModel.DataAnnotations;

namespace Quick_Board_Backend.Models
{
    public class Student
    {
        [Key]
        public int StudentId { get; set; }
        [Required]
        public string StudentName { get; set; }
        [Required]
        public int StudentCourseId { get; set; }
        [Required]
        public string StudentMail { get; set; }
        [Required]
        public string StudentPassword { get; set; }
        [Required]
        public int ApprovedBy { get; set; }
        [Required]
        public bool RequestStatus { get; set; }
    }
}
