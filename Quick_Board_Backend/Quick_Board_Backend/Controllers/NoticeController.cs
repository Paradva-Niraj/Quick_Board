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

        // GET: api/Notice?isPinned=true&priority=high&authorType=Faculty&authorId=3
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoticeReadDto>>> GetAll(
            [FromQuery] bool? isPinned,
            [FromQuery] string? priority,
            [FromQuery] string? authorType,
            [FromQuery] int? authorId)
        {
            var query = _context.Notices.AsQueryable();

            if (isPinned.HasValue) query = query.Where(n => n.IsPinned == isPinned.Value);
            if (!string.IsNullOrWhiteSpace(priority)) query = query.Where(n => n.Priority == priority);
            if (!string.IsNullOrWhiteSpace(authorType)) query = query.Where(n => n.AuthorType == authorType);
            if (authorId.HasValue) query = query.Where(n => n.NoticeWrittenBy == authorId.Value);

            var items = await query
                .OrderByDescending(n => n.PublishedAt)
                .Select(n => new NoticeReadDto
                {
                    NoticeId = n.NoticeId,
                    NoticeTitle = n.NoticeTitle,
                    NoticeDescription = n.NoticeDescription,
                    PublishedAt = n.PublishedAt,
                    NoticeWrittenBy = n.NoticeWrittenBy,
                    AuthorType = n.AuthorType,
                    Image = n.Image,
                    File = n.File,
                    IsPinned = n.IsPinned,
                    Priority = n.Priority
                })
                .ToListAsync();

            if (items.Count == 0) return NoContent();
            return Ok(items);
        }

        // GET: api/Notice/123
        [HttpGet("{id:long}")]
        public async Task<ActionResult<NoticeReadDto>> GetOne(long id)
        {
            var n = await _context.Notices.FindAsync(id);
            if (n == null) return NotFound(new { message = $"Notice {id} not found" });

            return Ok(new NoticeReadDto
            {
                NoticeId = n.NoticeId,
                NoticeTitle = n.NoticeTitle,
                NoticeDescription = n.NoticeDescription,
                PublishedAt = n.PublishedAt,
                NoticeWrittenBy = n.NoticeWrittenBy,
                AuthorType = n.AuthorType,
                Image = n.Image,
                File = n.File,
                IsPinned = n.IsPinned,
                Priority = n.Priority
            });
        }

        // POST: api/Notice
        [HttpPost]
        public async Task<ActionResult<NoticeReadDto>> Create([FromBody] NoticeCreateDto dto)
        {
            // basic validation
            if (string.IsNullOrWhiteSpace(dto.NoticeTitle))
                return BadRequest(new { message = "NoticeTitle is required" });
            if (string.IsNullOrWhiteSpace(dto.NoticeDescription))
                return BadRequest(new { message = "NoticeDescription is required" });
            if (string.IsNullOrWhiteSpace(dto.AuthorType) ||
                !(dto.AuthorType == "Admin" || dto.AuthorType == "Faculty"))
                return BadRequest(new { message = "AuthorType must be 'Admin' or 'Faculty'" });

            // verify author exists in the correct table
            bool authorExists = dto.AuthorType == "Admin"
                ? await _context.Admins.AnyAsync(a => a.AdminId == dto.NoticeWrittenBy)
                : await _context.Faculties.AnyAsync(f => f.FacultyId == dto.NoticeWrittenBy);

            if (!authorExists)
                return NotFound(new { message = $"Author (type {dto.AuthorType}) with id {dto.NoticeWrittenBy} not found" });

            var entity = new Notice
            {
                NoticeTitle = dto.NoticeTitle.Trim(),
                NoticeDescription = dto.NoticeDescription,
                PublishedAt = DateTime.UtcNow,
                NoticeWrittenBy = dto.NoticeWrittenBy,
                AuthorType = dto.AuthorType,
                Image = dto.Image,
                File = dto.File,
                IsPinned = dto.IsPinned ?? false,
                Priority = dto.Priority
            };

            try
            {
                _context.Notices.Add(entity);
                await _context.SaveChangesAsync();

                var result = new NoticeReadDto
                {
                    NoticeId = entity.NoticeId,
                    NoticeTitle = entity.NoticeTitle,
                    NoticeDescription = entity.NoticeDescription,
                    PublishedAt = entity.PublishedAt,
                    NoticeWrittenBy = entity.NoticeWrittenBy,
                    AuthorType = entity.AuthorType,
                    Image = entity.Image,
                    File = entity.File,
                    IsPinned = entity.IsPinned,
                    Priority = entity.Priority
                };

                return CreatedAtAction(nameof(GetOne), new { id = result.NoticeId }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving notice", error = ex.Message });
            }
        }

        // PUT: api/Notice/123
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] NoticeUpdateDto dto)
        {
            var n = await _context.Notices.FindAsync(id);
            if (n == null) return NotFound(new { message = $"Notice {id} not found" });

            // Apply changes if provided
            if (!string.IsNullOrWhiteSpace(dto.NoticeTitle)) n.NoticeTitle = dto.NoticeTitle.Trim();
            if (!string.IsNullOrWhiteSpace(dto.NoticeDescription)) n.NoticeDescription = dto.NoticeDescription;
            if (dto.Image != null) n.Image = dto.Image;
            if (dto.File != null) n.File = dto.File;
            if (dto.IsPinned.HasValue) n.IsPinned = dto.IsPinned.Value;
            if (!string.IsNullOrWhiteSpace(dto.Priority)) n.Priority = dto.Priority;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Notice updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating notice", error = ex.Message });
            }
        }

        // PATCH: api/Notice/123/pin?value=true
        [HttpPatch("{id:long}/pin")]
        public async Task<IActionResult> SetPin(long id, [FromQuery] bool value = true)
        {
            var n = await _context.Notices.FindAsync(id);
            if (n == null) return NotFound(new { message = $"Notice {id} not found" });

            n.IsPinned = value;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = value ? "Pinned" : "Unpinned" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating pin", error = ex.Message });
            }
        }

        // DELETE: api/Notice/123
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var n = await _context.Notices.FindAsync(id);
            if (n == null) return NotFound(new { message = $"Notice {id} not found" });

            _context.Notices.Remove(n);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Notice deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting notice", error = ex.Message });
            }
        }
    }
}
