using System.ComponentModel.DataAnnotations;

namespace AgriFairConnect.API.ViewModels.MarketPrice
{
    public class CreateMarketPriceRequest
    {
        [Required]
        [StringLength(100)]
        public string CropName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;
    }

    public class UpdateMarketPriceRequest
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }

    public class MarketPriceResponse
    {
        public int Id { get; set; }
        public string CropName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class MarketPriceFilterRequest
    {
        public string? CropName { get; set; }
        public string? Location { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class BulkUpdateMarketPriceRequest
    {
        [Required]
        public List<BulkMarketPriceItem> Prices { get; set; } = new List<BulkMarketPriceItem>();
    }

    public class BulkMarketPriceItem
    {
        [Required]
        public string CropName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required]
        public string Unit { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;
    }
}
