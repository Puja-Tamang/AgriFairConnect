namespace AgriFairConnect.API.ViewModels.Farmer
{
    public class FarmerProfileResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int WardNumber { get; set; }
        public string Municipality { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
        public decimal LandSize { get; set; }
        public string LandSizeUnit { get; set; } = string.Empty;
        public bool HasReceivedGrantBefore { get; set; }
        public List<CropInfo> Crops { get; set; } = new List<CropInfo>();
        public List<DocumentInfo> Documents { get; set; } = new List<DocumentInfo>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CropInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string NameNepali { get; set; } = string.Empty;
    }

    public class DocumentInfo
    {
        public int Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
