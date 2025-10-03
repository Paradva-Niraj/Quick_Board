using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using DotNetEnv;

// Only load .env file in development
if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Production")
{
    Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

// Configure Railway PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Configuration
    .AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var config = builder.Configuration;
// Fix: Use double underscore for Railway environment variables
var jwtKey = config["Jwt__Key"] ?? config["Jwt:Key"] ?? throw new Exception("Jwt__Key missing");
var jwtIssuer = config["Jwt__Issuer"] ?? config["Jwt:Issuer"] ?? "QuickBoardAPI";
var jwtAudience = config["Jwt__Audience"] ?? config["Jwt:Audience"] ?? "QuickBoardClient";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

//for jwt auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = async context =>
        {
            context.NoResult();

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";

            string code = "token_invalid";
            string message = "Invalid token.";

            if (context.Exception is SecurityTokenExpiredException)
            {
                code = "token_expired";
                message = "Token has expired.";
            }

            var payload = JsonSerializer.Serialize(new { code, message });
            await context.Response.WriteAsync(payload);
        },

        OnChallenge = async context =>
        {
            if (!context.Response.HasStarted)
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var payload = JsonSerializer.Serialize(new { code = "token_missing", message = "Authorization token required." });
                await context.Response.WriteAsync(payload);
            }
        }
    };
});

var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? throw new Exception("DB_HOST environment variable is missing");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? throw new Exception("DB_PORT environment variable is missing");
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new Exception("DB_NAME environment variable is missing");
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? throw new Exception("DB_USER environment variable is missing");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new Exception("DB_PASSWORD environment variable is missing");
var caCertContent = Environment.GetEnvironmentVariable("CA_CERT_CONTENT") ?? throw new Exception("CA_CERT_CONTENT environment variable is missing");

// Remove quotes from CA_CERT_CONTENT if present
caCertContent = caCertContent.Trim('"');

// Create a temporary certificate file
var tempCertPath = Path.Combine(Path.GetTempPath(), $"ca-cert-{Guid.NewGuid()}.pem");
await File.WriteAllTextAsync(tempCertPath, caCertContent);

var connectionString = $"server={dbHost};port={dbPort};database={dbName};user={dbUser};password={dbPassword};SslMode=Required;SslCa={tempCertPath};";

// Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Updated CORS to support both local and production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        var origins = new List<string> { "http://localhost:5173" };

        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            origins.Add(frontendUrl);
        }

        policy.WithOrigins(origins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();