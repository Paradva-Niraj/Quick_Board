using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quick_Board_Backend.Data
{

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Notice> Notices { get; set; }
    } 
}
