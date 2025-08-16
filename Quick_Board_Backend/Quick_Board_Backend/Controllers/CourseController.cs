using Microsoft.AspNetCore.Mvc;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Quick_Board_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Course
        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            try
            {
                var courses = await _context.Courses.ToListAsync();
                if (courses.Count == 0)
                    return NotFound(new { message = "No courses found" });

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.Message });
            }
        }

        // GET: api/Course/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null)
                    return NotFound(new { message = $"Course with ID {id} not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error occurred", error = ex.Message });
            }
        }

        // POST: api/Course
        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody] Course course)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid course data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Courses.Add(course);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error saving course to database", error = ex.Message });
            }
        }

        // PUT: api/Course/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] Course updatedCourse)
        {
            if (id != updatedCourse.CourseId)
                return BadRequest(new { message = "Course ID in URL does not match ID in body" });

            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid course data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // First check if the course exists
                var existingCourse = await _context.Courses.FindAsync(id);
                if (existingCourse == null)
                    return NotFound(new { message = $"Course with ID {id} not found" });

                // Update properties manually (safer than EntityState.Modified)
                _context.Entry(existingCourse).CurrentValues.SetValues(updatedCourse);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Course updated successfully", course = existingCourse });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                if (!_context.Courses.Any(c => c.CourseId == id))
                    return NotFound(new { message = $"Course with ID {id} not found" });

                return Conflict(new { message = "The course was modified by another process. Please reload and try again." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Database error occurred while updating", error = ex.Message });
            }
        }

        // DELETE: api/Course/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null)
                    return NotFound(new { message = $"Course with ID {id} not found" });

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error deleting course from database", error = ex.Message });
            }
        }
    }
}