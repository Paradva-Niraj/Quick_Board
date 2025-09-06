using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.DTOs;
using Quick_Board_Backend.Models;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles = "Faculty")]
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
        // Optional query params:
        //   before - ISO date/time string; load notices published strictly before this timestamp
        //   limit  - number of items to return (default 20, max 100)
        // GET: api/Notice
        // Optional query params:
        //   before - ISO date/time string; load notices published strictly before this timestamp
        //   limit  - number of items to return (default 20, max 100)
        // GET: api/Notice
        // Optional query params:
        //   before - ISO date/time string; load notices published strictly before this timestamp
        //   limit  - number of items to return (default 20, max 100)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoticeReadDto>>> GetAllNotices([FromQuery] DateTime? before, [FromQuery] int? limit)
        {
            try
            {
                int pageSize = Math.Clamp(limit ?? 20, 1, 100);

                IQueryable<Notice> query = _context.Notices;

                if (before.HasValue)
                    query = query.Where(n => n.PublishedAt < before.Value);

                // Order pinned first, then newest
                var notices = await query
                    .OrderByDescending(n => n.IsPinned)
                    .ThenByDescending(n => n.PublishedAt)
                    .Take(pageSize)
                    .ToListAsync();

                if (notices.Count == 0)
                    return NoContent();

                // Collect faculty ids from the current page
                var facultyIds = notices.Select(n => n.NoticeWrittenBy).Where(id => id != 0).Distinct().ToList();

                var facultyMap = new Dictionary<int, string>();
                if (facultyIds.Count > 0)
                {
                    facultyMap = await _context.Faculties
                                               .Where(f => facultyIds.Contains(f.FacultyId))
                                               .ToDictionaryAsync(f => f.FacultyId, f => f.FacultyName);
                }

                var result = notices.Select(notice => new NoticeReadDto
                {
                    NoticeId = notice.NoticeId,
                    NoticeTitle = notice.NoticeTitle,
                    NoticeDescription = notice.NoticeDescription,
                    PublishedAt = notice.PublishedAt,
                    NoticeWrittenBy = notice.NoticeWrittenBy,
                    AuthorType = notice.AuthorType,
                    AuthorName = facultyMap.TryGetValue(notice.NoticeWrittenBy, out var name) ? name : "Unknown Faculty",
                    Image = notice.Image,
                    File = notice.File,
                    IsPinned = notice.IsPinned,
                    Priority = notice.Priority
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching notices", error = ex.Message });
            }
        }

        // GET: api/Notice/count
        [HttpGet("count")]
        public async Task<ActionResult> GetNoticeCount()
        {
            var total = await _context.Notices.CountAsync();
            return Ok(new { total });
        }

        // GET: api/Notice/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Faculty,Admin")]
        public async Task<ActionResult<NoticeReadDto>> GetNotice(long id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = $"Notice with ID {id} not found" });

            string authorName = "Unknown Faculty";
            if (notice.NoticeWrittenBy != 0)
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
        [Authorize(Roles = "Faculty,Admin")]
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