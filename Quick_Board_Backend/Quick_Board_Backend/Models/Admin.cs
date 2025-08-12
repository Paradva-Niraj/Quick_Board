using System.ComponentModel.DataAnnotations;

namespace Quick_Board_Backend.Models
{
    public class Admin
    {
        [Key]
        public int AdminId { get; set; }
        [Required]
        public string AdminName { get; set; }
        [Required]
        public string AdminMail { get; set; }
        [Required]
        public string AdminPassword { get; set; }
    }
}
