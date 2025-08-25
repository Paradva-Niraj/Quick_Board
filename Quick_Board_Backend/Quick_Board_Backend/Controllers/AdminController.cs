using Microsoft.AspNetCore.Mvc;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.Models;
using Quick_Board_Backend.DTOs;
using Microsoft.EntityFrameworkCore;

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

            if (!admins.Any())
                return NoContent();

            return Ok(admins);
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

            _context.Admins.Add(admin);
            await _context.SaveChangesAsync(); // ✅ DB generates AdminId

            var result = new AdminReadDto
            {
                AdminId = admin.AdminId,
                AdminName = admin.AdminName,
                AdminMail = admin.AdminMail
            };

            return CreatedAtAction(nameof(GetAdmin), new { id = result.AdminId }, result);
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

            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin updated successfully" });
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
