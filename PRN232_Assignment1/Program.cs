using MongoDB.Driver;
using PRN232_Assignment1.Data;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using PRN232_Assignment1.Repositories;
using PRN232_Assignment1.Services;
using DotNetEnv;
using SocialNetwork.Core.Modules.Images.Interfaces;
using SocialNetwork.Core.Modules.Images.Service;

// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// MongoDB Configuration
var mongoDbSettings = builder.Configuration.GetSection("MongoDB");
var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? mongoDbSettings["ConnectionString"];
var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME") ?? mongoDbSettings["DatabaseName"];
builder.Configuration["R2:AccessKey"] = Env.GetString("R2_ACCESS_KEY");
builder.Configuration["R2:SecretKey"] = Env.GetString("R2_SECRET_KEY");
builder.Configuration["R2:AccountId"] = Env.GetString("R2_ACCOUNT_ID");
builder.Configuration["R2:BucketName"] = Env.GetString("R2_BUCKET_NAME");
builder.Configuration["R2:PublicUrl"] = Env.GetString("R2_PUBLIC_URL");
builder.Services.AddSingleton<IMongoClient>(serviceProvider => 
    new MongoClient(connectionString));

builder.Services.AddSingleton<ProductContext>(serviceProvider =>
{
    var mongoClient = serviceProvider.GetRequiredService<IMongoClient>();
    return new ProductContext(mongoClient, databaseName);
});

// Register repositories and services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICloudflareService, CloudflareService>();

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

app.UseAuthorization();

app.MapControllers();

app.Run();
