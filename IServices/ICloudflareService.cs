using Microsoft.AspNetCore.Http;

namespace SocialNetwork.Core.Modules.Images.Interfaces;

public interface ICloudflareService
{
    Task<string> UploadImage(IFormFile file);
    Task DeleteImageAsync(string hashedKey);
}