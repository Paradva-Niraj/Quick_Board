using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.DTOs;
using Quick_Board_Backend.Models;

namespace Quick_Board_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoticeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NoticeController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Notice
        [HttpPost]
        public async Task<ActionResult<NoticeReadDto>> CreateNotice([FromBody] NoticeCreateDto dto)
        {
            // Validate Author exists
            if (dto.AuthorType == "Admin")
            {
                var adminExists = await _context.Admins.AnyAsync(a => a.AdminId == dto.NoticeWrittenBy);
                if (!adminExists)
                    return BadRequest(new { message = "Admin not found" });
            }
            else if (dto.AuthorType == "Faculty")
            {
                var facultyExists = await _context.Faculties.AnyAsync(f => f.FacultyId == dto.NoticeWrittenBy);
                if (!facultyExists)
                    return BadRequest(new { message = "Faculty not found" });
            }
            else
            {
                return BadRequest(new { message = "AuthorType must be 'Admin' or 'Faculty'" });
            }

            var notice = new Notice
            {
                NoticeTitle = dto.NoticeTitle,
                NoticeDescription = dto.NoticeDescription,
                NoticeWrittenBy = dto.NoticeWrittenBy,
                AuthorType = dto.AuthorType,
                Image = dto.Image,
                File = dto.File,
                IsPinned = dto.IsPinned,
                Priority = dto.Priority,
                PublishedAt = DateTime.UtcNow
            };

            try
            {
                _context.Notices.Add(notice);
                await _context.SaveChangesAsync();

                // Get author name for response
                string authorName = "";
                if (dto.AuthorType == "Admin")
                {
                    var admin = await _context.Admins.FindAsync(dto.NoticeWrittenBy);
                    authorName = admin?.AdminName ?? "Unknown Admin";
                }
                else
                {
                    var faculty = await _context.Faculties.FindAsync(dto.NoticeWrittenBy);
                    authorName = faculty?.FacultyName ?? "Unknown Faculty";
                }

                return Ok(new
                {
                    message = "Notice created successfully",
                    notice = new NoticeReadDto
                    {
                        NoticeId = notice.NoticeId,
                        NoticeTitle = notice.NoticeTitle,
                        NoticeDescription = notice.NoticeDescription,
                        PublishedAt = notice.PublishedAt,
                        NoticeWrittenBy = notice.NoticeWrittenBy,
                        AuthorType = notice.AuthorType,
                        AuthorName = authorName,
                        Image = notice.Image,
                        File = notice.File,
                        IsPinned = notice.IsPinned,
                        Priority = notice.Priority
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating notice", error = ex.Message });
            }
        }

        // GET: api/Notice
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoticeReadDto>>> GetAllNotices()
        {
            var notices = await _context.Notices
                .OrderByDescending(n => n.IsPinned)  // Pinned first
                .ThenByDescending(n => n.PublishedAt) // Then by newest
                .ToListAsync();

            if (notices.Count == 0)
                return NoContent();

            var result = new List<NoticeReadDto>();

            foreach (var notice in notices)
            {
                string authorName = "";
                if (notice.AuthorType == "Admin")
                {
                    var admin = await _context.Admins.FindAsync(notice.NoticeWrittenBy);
                    authorName = admin?.AdminName ?? "Unknown Admin";
                }
                else if (notice.AuthorType == "Faculty")
                {
                    var faculty = await _context.Faculties.FindAsync(notice.NoticeWrittenBy);
                    authorName = faculty?.FacultyName ?? "Unknown Faculty";
                }

                result.Add(new NoticeReadDto
                {
                    NoticeId = notice.NoticeId,
                    NoticeTitle = notice.NoticeTitle,
                    NoticeDescription = notice.NoticeDescription,
                    PublishedAt = notice.PublishedAt,
                    NoticeWrittenBy = notice.NoticeWrittenBy,
                    AuthorType = notice.AuthorType,
                    AuthorName = authorName,
                    Image = notice.Image,
                    File = notice.File,
                    IsPinned = notice.IsPinned,
                    Priority = notice.Priority
                });
            }

            return Ok(result);
        }

        // GET: api/Notice/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<NoticeReadDto>> GetNotice(long id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = $"Notice with ID {id} not found" });

            string authorName = "";
            if (notice.AuthorType == "Admin")
            {
                var admin = await _context.Admins.FindAsync(notice.NoticeWrittenBy);
                authorName = admin?.AdminName ?? "Unknown Admin";
            }
            else if (notice.AuthorType == "Faculty")
            {
                var faculty = await _context.Faculties.FindAsync(notice.NoticeWrittenBy);
                authorName = faculty?.FacultyName ?? "Unknown Faculty";
            }

            return Ok(new NoticeReadDto
            {
                NoticeId = notice.NoticeId,
                NoticeTitle = notice.NoticeTitle,
                NoticeDescription = notice.NoticeDescription,
                PublishedAt = notice.PublishedAt,
                NoticeWrittenBy = notice.NoticeWrittenBy,
                AuthorType = notice.AuthorType,
                AuthorName = authorName,
                Image = notice.Image,
                File = notice.File,
                IsPinned = notice.IsPinned,
                Priority = notice.Priority
            });
        }

        // DELETE: api/Notice/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotice(long id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = $"Notice with ID {id} not found" });

            try
            {
                _context.Notices.Remove(notice);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Notice deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting notice", error = ex.Message });
            }
        }
    }
}