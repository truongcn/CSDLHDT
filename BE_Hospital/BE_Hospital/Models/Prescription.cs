using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace HospitalManagement.Models
{
    public class Prescription
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("prescriptionCode")]
        public string PrescriptionCode { get; set; } = string.Empty; // ✅ thêm mã đơn thuốc

        [BsonElement("date")]
        public DateTime Date { get; set; }

        [BsonElement("note")]
        public string Note { get; set; } = string.Empty;

        [BsonElement("medicalRecordId")]
        public string MedicalRecordId { get; set; } = string.Empty;

        [BsonElement("drugs")]
        public List<Drug> Drugs { get; set; } = new List<Drug>();
    }
}
