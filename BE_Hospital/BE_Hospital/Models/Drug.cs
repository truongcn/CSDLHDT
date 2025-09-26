using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Models;

public class Drug
{
    [BsonElement("drugCode")]
    public string DrugCode { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("dosage")]
    public string Dosage { get; set; } = string.Empty;

    [BsonElement("frequency")]
    public string Frequency { get; set; } = string.Empty;

    [BsonElement("days")]
    public int Days { get; set; }
}

