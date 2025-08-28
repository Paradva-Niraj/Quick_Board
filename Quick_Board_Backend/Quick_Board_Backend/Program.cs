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


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Register CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173") // no trailing slash
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
//jwt us 1st line
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
