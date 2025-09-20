### Dockerfile
# Dùng hình ảnh chính thức của .NET SDK để build ứng dụng
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Sao chép file csproj và restore dependencies
COPY SocialNetwork.Core/*.csproj SocialNetwork.Core/
COPY SocialNetwork.Infrastructure/*.csproj SocialNetwork.Infrastructure/
COPY SocialNetwork.Api/*.csproj SocialNetwork.Api/
RUN dotnet restore SocialNetwork.Api/SocialNetwork.Api.csproj

# Sao chép toàn bộ source code và build ứng dụng
COPY . .
WORKDIR /app/SocialNetwork.Api
RUN dotnet publish -c Release -o /app/publish

# Dùng hình ảnh .NET Runtime để chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SocialNetwork.Api.dll"]
