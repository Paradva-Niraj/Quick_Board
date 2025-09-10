using Microsoft.EntityFrameworkCore;
using Quick_Board_Backend.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using DotNetEnv;
Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .AddEnvironmentVariables();
// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var config = builder.Configuration;
var jwtKey = config["Jwt:Key"] ?? throw new Exception("Jwt:Key missing");
var jwtIssuer = config["Jwt:Issuer"] ?? "QuickBoardAPI";
var jwtAudience = config["Jwt:Audience"] ?? "QuickBoardClient";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

//for jwt auth

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true; // set false only for local dev if you must
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
        ClockSkew = TimeSpan.Zero // strict expiry handling
    };

    // Customize responses for expired/invalid/missing tokens so frontend can react
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = async context =>
        {
            context.NoResult(); // stop other handlers

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
            // When no token was provided or other challenge reasons
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

// Create a temporary certificate file
var tempCertPath = Path.Combine(Path.GetTempPath(), $"ca-cert-{Guid.NewGuid()}.pem");
await File.WriteAllTextAsync(tempCertPath, caCertContent);

var connectionString = $"server={dbHost};port={dbPort};database={dbName};user={dbUser};password={dbPassword};SslMode=Required;SslCa={tempCertPath};";

builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
// Register CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173") // no trailing slas
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS BEFORE Authorization & MapControllers
app.UseCors("AllowReactApp");
//jwt use 1st line
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
