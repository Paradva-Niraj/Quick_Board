using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Permissions;

namespace Quick_Board_Backend.Models
{
    [Table("faculty")]
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
        public int? AddedBy { get; set; }
        public Boolean RequestStatus { get; set; } = false;

    }
}
