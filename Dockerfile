# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution and project files
COPY Quick_Board_Backend/Quick_Board_Backend.sln ./
COPY Quick_Board_Backend/Quick_Board_Backend/Quick_Board_Backend.csproj ./Quick_Board_Backend/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the application code
COPY Quick_Board_Backend/ ./

# Build the application
WORKDIR /src/Quick_Board_Backend
RUN dotnet build -c Release -o /app/build

# Publish the application
RUN dotnet publish -c Release -o /app/publish

# Use the official .NET 8 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Expose the port (Railway will use PORT environment variable)
EXPOSE 8080

# Set environment variable for ASP.NET to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "Quick_Board_Backend.dll"]