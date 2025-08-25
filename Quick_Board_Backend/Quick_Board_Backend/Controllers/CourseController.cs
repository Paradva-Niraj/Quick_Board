using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.Models;
using Quick_Board_Backend.DTOs;

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
        public async Task<ActionResult<IEnumerable<CourseReadDto>>> GetAllCourses()
        {
            var courses = await _context.Courses
                .Select(c => new CourseReadDto
                {
                    CourseId = c.CourseId,
                    CourseName = c.CourseName
                })
                .ToListAsync();

            if (courses.Count == 0)
                return NotFound(new { message = "No courses found" });

            return Ok(courses);
        }

        // GET: api/Course/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseReadDto>> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
                return NotFound(new { message = $"Course with ID {id} not found" });

            return Ok(new CourseReadDto
            {
                CourseId = course.CourseId,
                CourseName = course.CourseName
            });
        }

        // POST: api/Course
        [HttpPost]
        public async Task<ActionResult<CourseReadDto>> AddCourse([FromBody] CourseCreateDto courseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid course data" });

            var course = new Course
            {
                CourseName = courseDto.CourseName
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var result = new CourseReadDto
            {
                CourseId = course.CourseId,
                CourseName = course.CourseName
            };

            return CreatedAtAction(nameof(GetCourse), new { id = result.CourseId }, result);
        }

        // PUT: api/Course/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseCreateDto courseDto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound(new { message = $"Course with ID {id} not found" });

            course.CourseName = courseDto.CourseName;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Course updated successfully" });
        }

        // DELETE: api/Course/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound(new { message = $"Course with ID {id} not found" });

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Course deleted successfully" });
        }
    }
}
