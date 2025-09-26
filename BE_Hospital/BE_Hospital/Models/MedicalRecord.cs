using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Models;

//extend

public class MedicalRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("appointmentId")]
    public string AppointmentId { get; set; } = string.Empty;

    [BsonElement("patientId")]
    public string PatientId { get; set; } = string.Empty;

    [BsonElement("doctorId")]
    public string DoctorId { get; set; } = string.Empty;

    [BsonElement("visitDate")]
    public DateTime VisitDate { get; set; }

    [BsonElement("symptoms")]
    public string Symptoms { get; set; } = string.Empty;

    [BsonElement("diagnosis")]
    public string Diagnosis { get; set; } = string.Empty;

    [BsonElement("notes")]
    public string Notes { get; set; } = string.Empty;

    [BsonElement("roomId")]
    public string RoomId { get; set; } = string.Empty;
}
