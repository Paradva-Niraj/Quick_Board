using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Models
{
    [Table("admins")]   // ✅ use plural table name (EF convention, but optional)
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]   // ✅ DB generates the value
        public int AdminId { get; set; }

        [Required]
        [MaxLength(100)]   // ✅ small constraint for safety
        public string AdminName { get; set; }

        [Required]
        [EmailAddress]     // ✅ validates email format
        [MaxLength(150)]
        public string AdminMail { get; set; }

        [Required]
        [MaxLength(255)]   // ✅ password length restriction
        public string AdminPassword { get; set; }
    }
}
