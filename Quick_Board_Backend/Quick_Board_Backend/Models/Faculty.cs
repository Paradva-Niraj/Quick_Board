using System.ComponentModel.DataAnnotations;
using System.Security.Permissions;

namespace Quick_Board_Backend.Models
{
    public class Faculty
    {
        [Key]
        public int FacultyId { get; set; }
        [Required]
        public string FacultyName { get; set; }
        [Required]
        public string FacultyMail { get; set; }
        [Required]
        public string FacultyPassword { get; set; }
        [Required]
        public int AddedBy { get; set; }
        [Required]
        public Boolean RequestStatus { get; set; }

    }
}
