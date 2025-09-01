using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.DTOs;
using Quick_Board_Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace Quick_Board_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Admin
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminReadDto>> AddAdmin([FromBody] AdminCreateDto dto)
        {
            // Check if email already exists
            bool emailExists = await _context.Admins.AnyAsync(a => a.AdminMail == dto.AdminMail);
            if (emailExists)
            {
                return Conflict(new { message = "Admin with this email already exists" });
            }

            var passwordHasher = new PasswordHasher<Admin>();
            var admin = new Admin
            {
                AdminName = dto.AdminName,
                AdminMail = dto.AdminMail
            };

            admin.AdminPassword = passwordHasher.HashPassword(admin, dto.AdminPassword);

            try
            {
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Admin added successfully",
                    admin = new AdminReadDto
                    {
                        AdminId = admin.AdminId,
                        AdminName = admin.AdminName,
                        AdminMail = admin.AdminMail
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving admin", error = ex.Message });
            }
        }

        // GET: api/Admin/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminReadDto>> GetAdmin(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
                return NotFound(new { message = $"Admin with ID {id} not found" });

            return Ok(new AdminReadDto
            {
                AdminId = admin.AdminId,
                AdminName = admin.AdminName,
                AdminMail = admin.AdminMail
            });
        }

        // GET: api/Admin
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AdminReadDto>>> GetAllAdmin()
        {
            var admins = await _context.Admins
                .Select(a => new AdminReadDto
                {
                    AdminId = a.AdminId,
                    AdminName = a.AdminName,
                    AdminMail = a.AdminMail
                })
                .ToListAsync();

            if (admins.Count == 0)
                return NoContent();

            return Ok(admins);
        }

        // PUT: api/Admin/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] AdminUpdateDto dto)
        {
            var existingAdmin = await _context.Admins.FindAsync(id);
            if (existingAdmin == null)
                return NotFound(new { message = $"Admin with ID {id} not found" });

            // Check if email already exists for another admin
            bool emailExists = await _context.Admins.AnyAsync(a => a.AdminMail == dto.AdminMail && a.AdminId != id);
            if (emailExists)
            {
                return Conflict(new { message = "Another admin with this email already exists" });
            }

            existingAdmin.AdminName = dto.AdminName;
            existingAdmin.AdminMail = dto.AdminMail;

            if (!string.IsNullOrWhiteSpace(dto.AdminPassword))
            {
                var passwordHasher = new PasswordHasher<Admin>();
                existingAdmin.AdminPassword = passwordHasher.HashPassword(existingAdmin, dto.AdminPassword);
            }
            // else: keep the old password

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Admin updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating admin", error = ex.Message });
            }
        }

        // DELETE: api/Admin/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
                return NotFound(new { message = $"Admin with ID {id} not found" });

            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin deleted successfully" });
        }
    }
}