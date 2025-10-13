using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using PRN232_Assignment1.Repositories;
using PRN232_Assignment1.Services;
using PRN232_Assignment1.Models;
using DotNetEnv;
using SocialNetwork.Core.Modules.Images.Interfaces;
using SocialNetwork.Core.Modules.Images.Service;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Protocols;
using System.Security.Claims;

// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Supabase Configuration
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");

if (!string.IsNullOrWhiteSpace(supabaseUrl) && !string.IsNullOrWhiteSpace(supabaseKey))
{
    builder.Services.AddSingleton(_ =>
    {
        var opts = new SupabaseOptions
        {
            AutoConnectRealtime = true
        };
        var client = new Client(supabaseUrl, supabaseKey, opts);
        client.InitializeAsync().GetAwaiter().GetResult();
        return client;
    });
}

var jwksUri = $"{supabaseUrl!.TrimEnd('/')}/auth/v1/.well-known/jwks.json";

// Fetch JWKS 1 lần khi app start
using var http = new HttpClient();
var jwksJson = await http.GetStringAsync(jwksUri);
var jwks = new JsonWebKeySet(jwksJson);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.IncludeErrorDetails = true;
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl.TrimEnd('/')}/auth/v1",

            ValidateAudience = true,
            ValidAudience = "authenticated",

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5),

            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = jwks.Keys,
            ValidAlgorithms = new[] { SecurityAlgorithms.EcdsaSha256 } // Supabase use ES256 (ECDSA with SHA-256)
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine("Auth failed: " + ctx.Exception);
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                Console.WriteLine("Token OK for user: " +
                                  ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier));
                return Task.CompletedTask;
            }
        };
    });

builder.Configuration["R2:AccessKey"] = Env.GetString("R2_ACCESS_KEY");
builder.Configuration["R2:SecretKey"] = Env.GetString("R2_SECRET_KEY");
builder.Configuration["R2:AccountId"] = Env.GetString("R2_ACCOUNT_ID");
builder.Configuration["R2:BucketName"] = Env.GetString("R2_BUCKET_NAME");
builder.Configuration["R2:PublicUrl"] = Env.GetString("R2_PUBLIC_URL");

// VNPay Configuration
builder.Services.Configure<VNPayConfig>(options =>
{
    options.TmnCode = Env.GetString("VNPAY_TMN_CODE");
    options.HashSecret = Env.GetString("VNPAY_HASH_SECRET");
    options.PaymentUrl = Env.GetString("VNPAY_PAYMENT_URL");
    options.ReturnUrl = Env.GetString("VNPAY_RETURN_URL");
});

// Register repositories and services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICloudflareService, CloudflareService>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IVNPayService, VNPayService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') 
                           ?? new[] { "http://localhost:3000" };
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
