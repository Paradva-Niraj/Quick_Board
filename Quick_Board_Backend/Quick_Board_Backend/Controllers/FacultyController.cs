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
    public class FacultyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FacultyController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Faculty/register
        [HttpPost("register")]
        public async Task<ActionResult<FacultyReadDto>> RegisterFaculty([FromBody] FacultyRegisterDto dto)
        {
            var passwordHasher = new PasswordHasher<Faculty>();

            var faculty = new Faculty
            {
                FacultyName = dto.FacultyName,
                FacultyMail = dto.FacultyMail,
                RequestStatus = false,
                AddedBy = null
            };

            // ✅ Hash the password before saving
            faculty.FacultyPassword = passwordHasher.HashPassword(faculty, dto.FacultyPassword);

            try
            {
                _context.Faculties.Add(faculty);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Faculty registered successfully, waiting for admin approval",
                    faculty = new FacultyReadDto
                    {
                        FacultyId = faculty.FacultyId,
                        FacultyName = faculty.FacultyName,
                        FacultyMail = faculty.FacultyMail,
                        RequestStatus = faculty.RequestStatus,
                        AddedBy = faculty.AddedBy
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving faculty", error = ex.Message });
            }
        }

        // GET: api/Faculty
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<FacultyReadDto>>> GetAllFaculty()
        {
            var faculties = await _context.Faculties
                .Select(f => new FacultyReadDto
                {
                    FacultyId = f.FacultyId,
                    FacultyName = f.FacultyName,
                    FacultyMail = f.FacultyMail,
                    RequestStatus = f.RequestStatus,
                    AddedBy = f.AddedBy
                }).ToListAsync();

            if (faculties.Count == 0)
                return NoContent();

            return Ok(faculties);
        }

        // PUT: api/Faculty/approve/{facultyId}
        [HttpPut("approve/{facultyId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveFaculty(int facultyId, [FromBody] FacultyApprovalDto dto)
        {
            var faculty = await _context.Faculties.FindAsync(facultyId);
            if (faculty == null)
                return NotFound(new { message = $"Faculty with ID {facultyId} not found" });

            faculty.RequestStatus = true;
            faculty.AddedBy = dto.AdminId;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Faculty approved successfully", facultyId, approvedBy = dto.AdminId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error approving faculty", error = ex.Message });
            }
        }

        // DELETE: api/Faculty/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFaculty(int id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null)
                return NotFound(new { message = $"Faculty with ID {id} not found" });

            _context.Faculties.Remove(faculty);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Faculty deleted successfully" });
        }
    }
}
