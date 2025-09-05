//this whole code is for login and admin, faculty and student check number wise and give authorization

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quick_Board_Backend.Data;
using Quick_Board_Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, IConfiguration config, ILogger<AuthController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        try
        {
            object user = null;
            string role = null;
            int userId = 0;
            string userName = "";
            string userMail = "";

            // Try Admin
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.AdminMail.ToLower() == dto.Email.Trim().ToLower());
            if (admin != null)
            {
                var hasher = new PasswordHasher<Admin>();
                var v = hasher.VerifyHashedPassword(admin, admin.AdminPassword, dto.Password);
                if (v == PasswordVerificationResult.Success)
                {
                    user = admin; role = "Admin"; userId = admin.AdminId; userName = admin.AdminName; userMail = admin.AdminMail;
                }
            }

            // Try Faculty
            if (user == null)
            {
                var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.FacultyMail.ToLower() == dto.Email.Trim().ToLower());
                if (faculty != null)
                {
                    // check approval
                    if (faculty.AddedBy == null || !faculty.RequestStatus)
                    {
                        return Unauthorized(new { message = "Your account has not been approved yet. Please wait for admin approval." });
                    }

                    var hasher = new PasswordHasher<Faculty>();
                    var v = hasher.VerifyHashedPassword(faculty, faculty.FacultyPassword, dto.Password);
                    if (v == PasswordVerificationResult.Success)
                    {
                        user = faculty; role = "Faculty"; userId = faculty.FacultyId; userName = faculty.FacultyName; userMail = faculty.FacultyMail;
                    }
                }
            }

            // Try Student
            if (user == null)
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentMail.ToLower() == dto.Email.Trim().ToLower());
                if (student != null)
                {
                    // check approval
                    if (student.ApprovedBy == null || !student.RequestStatus)
                    {
                        return Unauthorized(new { message = "Your account has not been approved yet. Please wait for faculty approval." });
                    }

                    var hasher = new PasswordHasher<Student>();
                    var v = hasher.VerifyHashedPassword(student, student.StudentPassword, dto.Password);
                    if (v == PasswordVerificationResult.Success)
                    {
                        user = student; role = "Student"; userId = student.StudentId; userName = student.StudentName; userMail = student.StudentMail;
                    }
                }
            }

            if (user == null)
            {
                // Generic message to prevent user enumeration
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Build token
            var jwtKey = _config["Jwt:Key"] ?? throw new Exception("Jwt:Key missing");
            var jwtIssuer = _config["Jwt:Issuer"] ?? "QuickBoardAPI";
            var jwtAudience = _config["Jwt:Audience"] ?? "QuickBoardClient";
            var expiresMinutes = int.TryParse(_config["Jwt:ExpiresInMinutes"], out var m) ? m : 1440;
            var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, userName ?? string.Empty),
            new Claim(ClaimTypes.Email, dto.Email),
            new Claim(ClaimTypes.Role, role)
        };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expiresMinutes),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
            };

            var handler = new JwtSecurityTokenHandler();
            var securityToken = handler.CreateToken(tokenDescriptor);
            var jwt = handler.WriteToken(securityToken);

            // Respond with token and minimal user info
            return Ok(new
            {
                message = "Login successful.",
                token = jwt,
                user = new { id = userId, name = userName, role, mail = userMail }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for {Email}", dto?.Email);
            return StatusCode(500, new { message = "An error occurred while processing your request." });
        }
    }

}
