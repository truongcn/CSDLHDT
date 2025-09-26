namespace HospitalManagement.Models;

public class HospitalDatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;

    public string PatientsCollection { get; set; } = string.Empty;
    public string DoctorsCollection { get; set; } = string.Empty;
    public string RoomsCollection { get; set; } = string.Empty;
    public string AppointmentsCollection { get; set; } = string.Empty;

    public string MedicalRecordsCollection { get; set; } = string.Empty;
    public string PrescriptionsCollection { get; set; } = string.Empty;
    public string TestsCollection { get; set; } = string.Empty;
    public string MedicalImagesCollection { get; set; } = string.Empty;
}
