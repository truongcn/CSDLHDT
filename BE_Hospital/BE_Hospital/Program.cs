using HospitalManagement.Models;
using HospitalManagement.Services;
using MongoDB.Driver;
using System.Numerics;

var builder = WebApplication.CreateBuilder(args);

// load config
var mongoSection = builder.Configuration.GetSection("HospitalDatabase");
var mongoSettings = mongoSection.Get<HospitalDatabaseSettings>() ?? throw new Exception("Missing MongoDB config");

// mongo services
builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoSettings.ConnectionString));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IMongoClient>().GetDatabase(mongoSettings.DatabaseName));

builder.Services.AddSingleton<UserService>(sp =>
    new UserService(sp.GetRequiredService<IMongoDatabase>()));
builder.Services.AddSingleton<MongoService<Doctor>>(sp =>
    new MongoService<Doctor>(sp.GetRequiredService<IMongoDatabase>(), mongoSettings.DoctorsCollection));
builder.Services.AddSingleton<MongoService<Patient>>(sp =>
    new MongoService<Patient>(sp.GetRequiredService<IMongoDatabase>(), mongoSettings.PatientsCollection));
builder.Services.AddSingleton<MongoService<Room>>(sp =>
    new MongoService<Room>(sp.GetRequiredService<IMongoDatabase>(), mongoSettings.RoomsCollection));
builder.Services.AddSingleton<MongoService<Appointment>>(sp =>
    new MongoService<Appointment>(sp.GetRequiredService<IMongoDatabase>(), mongoSettings.AppointmentsCollection));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthorization();
app.MapControllers();
app.Run();
