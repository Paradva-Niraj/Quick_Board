using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using DotNetEnv;

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Production")
{
    Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var config = builder.Configuration;

// Use simple variable names without colons or double underscores
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new Exception("JWT_KEY missing");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "QuickBoardAPI";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "QuickBoardClient";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

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

var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? throw new Exception("DB_HOST missing");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? throw new Exception("DB_PORT missing");
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new Exception("DB_NAME missing");
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? throw new Exception("DB_USER missing");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new Exception("DB_PASSWORD missing");
var caCertContent = Environment.GetEnvironmentVariable("CA_CERT_CONTENT") ?? throw new Exception("CA_CERT_CONTENT missing");

caCertContent = caCertContent.Trim('"');

var tempCertPath = Path.Combine(Path.GetTempPath(), $"ca-cert-{Guid.NewGuid()}.pem");
await File.WriteAllTextAsync(tempCertPath, caCertContent);

var connectionString = $"server={dbHost};port={dbPort};database={dbName};user={dbUser};password={dbPassword};SslMode=Required;SslCa={tempCertPath};";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// CORS - Allow all origins for development/testing
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();