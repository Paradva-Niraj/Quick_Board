using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.DTOs;
using Quick_Board_Backend.Models;

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
        public async Task<ActionResult<AdminReadDto>> AddAdmin([FromBody] AdminCreateDto dto)
        {
            var admin = new Admin
            {
                AdminName = dto.AdminName,
                AdminMail = dto.AdminMail,
                AdminPassword = dto.AdminPassword
            };

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
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] AdminCreateDto dto)
        {
            var existingAdmin = await _context.Admins.FindAsync(id);
            if (existingAdmin == null)
                return NotFound(new { message = $"Admin with ID {id} not found" });

            existingAdmin.AdminName = dto.AdminName;
            existingAdmin.AdminMail = dto.AdminMail;
            existingAdmin.AdminPassword = dto.AdminPassword;

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