using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.DTOs;
using Quick_Board_Backend.Models;

namespace Quick_Board_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Student/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<StudentReadDto>> RegisterStudent([FromBody] StudentRegisterDto dto)
        {
            // ✅ Check if course exists
            var course = await _context.Courses.FindAsync(dto.StudentCourseId);
            if (course == null)
                return NotFound(new { message = $"Course with ID {dto.StudentCourseId} not found" });

            // ✅ Check if email already exists in Student table
            var existingStudent = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentMail.ToLower() == dto.StudentMail.ToLower());

            if (existingStudent != null)
            {
                return BadRequest(new
                {
                    message = "Email already registered as Student. Please try to login or use a different email."
                });
            }

            // ✅ Optional: Check if email exists in other tables (Admin/Faculty)
            var existingAdmin = await _context.Admins
                .FirstOrDefaultAsync(a => a.AdminMail.ToLower() == dto.StudentMail.ToLower());

            if (existingAdmin != null)
            {
                return BadRequest(new
                {
                    message = "Email already registered as Admin. Please use a different email."
                });
            }

            var existingFaculty = await _context.Faculties
                .FirstOrDefaultAsync(f => f.FacultyMail.ToLower() == dto.StudentMail.ToLower());

            if (existingFaculty != null)
            {
                return BadRequest(new
                {
                    message = "Email already registered as Faculty. Please use a different email."
                });
            }

            // ✅ Hash password using Identity's PasswordHasher
            var passwordHasher = new PasswordHasher<Student>();
            var student = new Student
            {
                StudentName = dto.StudentName,
                StudentMail = dto.StudentMail,
                StudentCourseId = dto.StudentCourseId,
                RequestStatus = false,
                ApprovedBy = null
            };

            student.StudentPassword = passwordHasher.HashPassword(student, dto.StudentPassword);

            try
            {
                _context.Students.Add(student);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Student registered successfully, waiting for faculty approval",
                    student = new StudentReadDto
                    {
                        StudentId = student.StudentId,
                        StudentName = student.StudentName,
                        StudentMail = student.StudentMail,
                        RequestStatus = student.RequestStatus,
                        ApprovedBy = student.ApprovedBy,
                        StudentCourseId = student.StudentCourseId,
                        CourseName = course.CourseName,
                        ApprovedByFaculty = null
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving student", error = ex.Message });
            }
        }

        // GET: api/Student
        [HttpGet]
        [Authorize(Roles = "Faculty,Admin")]
        public async Task<ActionResult<IEnumerable<StudentReadDto>>> GetAllStudents()
        {
            var students = await _context.Students
                .Include(s => s.Course)
                .Include(s => s.Faculty)
                .Select(s => new StudentReadDto
                {
                    StudentId = s.StudentId,
                    StudentName = s.StudentName,
                    StudentMail = s.StudentMail,
                    RequestStatus = s.RequestStatus,
                    ApprovedBy = s.ApprovedBy,
                    StudentCourseId = s.StudentCourseId,
                    CourseName = s.Course.CourseName,
                    ApprovedByFaculty = s.Faculty != null ? s.Faculty.FacultyName : null
                })
                .ToListAsync();

            if (students.Count == 0)
                return NoContent();

            return Ok(students);
        }

        // PUT: api/Student/approve/{studentId}
        [HttpPut("approve/{studentId}")]
        [Authorize(Roles = "Faculty")]
        public async Task<IActionResult> ApproveStudent(int studentId, [FromBody] StudentApprovalDto dto)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = $"Student with ID {studentId} not found" });

            var faculty = await _context.Faculties.FindAsync(dto.FacultyId);
            if (faculty == null)
                return NotFound(new { message = $"Faculty with ID {dto.FacultyId} not found" });

            student.RequestStatus = true;
            student.ApprovedBy = dto.FacultyId;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Student approved successfully", studentId, approvedBy = dto.FacultyId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error approving student", error = ex.Message });
            }
        }

        // inside Quick_Board_Backend.Controllers.StudentController

        // PUT: api/Student/{id}
        // Allow authenticated users to update their own profile (or admins if you add role checks).
        [HttpPut("{id}")]   
        [Authorize(Roles = "Student")]// keep this, you can tighten role checks if desired
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] StudentUpdateDto dto)
        {
            // Find student
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { message = $"Student with ID {id} not found" });

            // Optional: Enforce that only the same student or admins can update.
            // If you use JWT with user id claim, you can compare and reject unauthorized updates.
            // Example commented code:
            // var claimId = User.FindFirst("id")?.Value;
            // if (!User.IsInRole("Admin") && (claimId == null || !int.TryParse(claimId, out var cid) || cid != id))
            //     return Forbid();

            // Validate course if passed
            if (dto.StudentCourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(dto.StudentCourseId.Value);
                if (course == null)
                    return BadRequest(new { message = $"Course with ID {dto.StudentCourseId.Value} not found" });
                student.StudentCourseId = dto.StudentCourseId.Value;
            }

            // Update name if provided
            if (!string.IsNullOrWhiteSpace(dto.StudentName))
                student.StudentName = dto.StudentName.Trim();

            // Update email if provided and unique across students/admins/faculty
            if (!string.IsNullOrWhiteSpace(dto.StudentMail))
            {
                var emailLower = dto.StudentMail.Trim().ToLower();
                var exists = await _context.Students.AnyAsync(s => s.StudentId != id && s.StudentMail.ToLower() == emailLower);
                if (exists)
                    return BadRequest(new { message = "Email already used by another student." });

                var adminExists = await _context.Admins.AnyAsync(a => a.AdminMail.ToLower() == emailLower);
                if (adminExists)
                    return BadRequest(new { message = "Email already registered as Admin. Choose a different email." });

                var facultyExists = await _context.Faculties.AnyAsync(f => f.FacultyMail.ToLower() == emailLower);
                if (facultyExists)
                    return BadRequest(new { message = "Email already registered as Faculty. Choose a different email." });

                student.StudentMail = dto.StudentMail.Trim();
            }

            // Update password only when provided and non-empty
            if (!string.IsNullOrWhiteSpace(dto.StudentPassword))
            {
                var hasher = new PasswordHasher<Student>();
                student.StudentPassword = hasher.HashPassword(student, dto.StudentPassword);
            }

            try
            {
                await _context.SaveChangesAsync();

                // Build StudentReadDto to return
                var courseObj = await _context.Courses.FindAsync(student.StudentCourseId);
                var resultDto = new StudentReadDto
                {
                    StudentId = student.StudentId,
                    StudentName = student.StudentName,
                    StudentMail = student.StudentMail,
                    RequestStatus = student.RequestStatus,
                    ApprovedBy = student.ApprovedBy,
                    StudentCourseId = student.StudentCourseId,
                    CourseName = courseObj?.CourseName,
                    ApprovedByFaculty = student.Faculty != null ? student.Faculty.FacultyName : null
                };

                return Ok(resultDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating student", error = ex.Message });
            }
        }

        // DELETE: api/Student/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Faculty,Admin")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { message = $"Student with ID {id} not found" });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student deleted successfully" });
        }
    }
}