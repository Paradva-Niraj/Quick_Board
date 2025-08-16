using Microsoft.AspNetCore.Mvc;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.Models;
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
        public async Task<ActionResult<Admin>> GetAdmin(int id)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(id);
                if (admin == null)
                {
                    return NotFound(new { message = $"Admin with ID {id} not found" });
                }
                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Admin>>> GetAllAdmin()
        {
            try
            {
                var admins = await _context.Admins.ToListAsync();
                if (admins.Count == 0)
                {
                    return NoContent(); // 204 - no data
                }
                return Ok(admins); // 200 - return list
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.Message });
            }
        }

        // POST: api/Admin
        [HttpPost]
        public async Task<ActionResult<Admin>> AddAdmin([FromBody] Admin admin)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid admin data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminId }, admin);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error saving admin to database", error = ex.Message });
            }
        }

        // PUT: api/Admin/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] Admin updateAdmin)
        {
            if (id != updateAdmin.AdminId)
            {
                return BadRequest(new { message = "Admin ID in URL does not match ID in body" });
            }

            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid admin data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // First check if the admin exists
                var existingAdmin = await _context.Admins.FindAsync(id);
                if (existingAdmin == null)
                    return NotFound(new { message = $"Admin with ID {id} not found" });

                // Update properties safely
                _context.Entry(existingAdmin).CurrentValues.SetValues(updateAdmin);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Admin updated successfully", admin = existingAdmin });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                if (!_context.Admins.Any(a => a.AdminId == id))
                    return NotFound(new { message = $"Admin with ID {id} not found" });

                return Conflict(new { message = "The admin was modified by another process. Please reload and try again." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Database error occurred while updating", error = ex.Message });
            }
        }

        // DELETE: api/Admin/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var admin = await _context.Admins.FindAsync(id);
                if (admin == null)
                    return NotFound(new { message = $"Admin with ID {id} not found" });

                _context.Admins.Remove(admin);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Admin deleted successfully" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error deleting admin from database", error = ex.Message });
            }
        }
    }
}