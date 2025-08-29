using AgriFairConnect.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AgriFairConnect.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<FarmerProfile> FarmerProfiles { get; set; }
        public DbSet<FarmerCrop> FarmerCrops { get; set; }
        public DbSet<Crop> Crops { get; set; }
        public DbSet<FarmerDocument> FarmerDocuments { get; set; }
        public DbSet<Grant> Grants { get; set; }
        public DbSet<GrantTargetArea> GrantTargetAreas { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<ApplicationDocument> ApplicationDocuments { get; set; }
        public DbSet<MarketPrice> MarketPrices { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships
            builder.Entity<FarmerProfile>()
                .HasOne(fp => fp.AppUser)
                .WithOne(u => u.FarmerProfile)
                .HasForeignKey<FarmerProfile>(fp => fp.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FarmerCrop>()
                .HasOne(fc => fc.FarmerProfile)
                .WithMany(fp => fp.FarmerCrops)
                .HasForeignKey(fc => fc.FarmerProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FarmerCrop>()
                .HasOne(fc => fc.Crop)
                .WithMany(c => c.FarmerCrops)
                .HasForeignKey(fc => fc.CropId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<FarmerDocument>()
                .HasOne(fd => fd.FarmerProfile)
                .WithMany(fp => fp.FarmerDocuments)
                .HasForeignKey(fd => fd.FarmerProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<GrantTargetArea>()
                .HasOne(gta => gta.Grant)
                .WithMany(g => g.GrantTargetAreas)
                .HasForeignKey(gta => gta.GrantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Application>()
                .HasOne(a => a.Farmer)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Application>()
                .HasOne(a => a.Grant)
                .WithMany(g => g.Applications)
                .HasForeignKey(a => a.GrantId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ApplicationDocument>()
                .HasOne(ad => ad.Application)
                .WithMany(a => a.ApplicationDocuments)
                .HasForeignKey(ad => ad.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed data for crops
            builder.Entity<Crop>().HasData(
                new Crop { Id = 1, Name = "Rice", NameNepali = "धान", Description = "Staple food crop" },
                new Crop { Id = 2, Name = "Corn", NameNepali = "मकै", Description = "Maize crop" },
                new Crop { Id = 3, Name = "Wheat", NameNepali = "गहुँ", Description = "Wheat crop" },
                new Crop { Id = 4, Name = "Barley", NameNepali = "जौ", Description = "Barley crop" },
                new Crop { Id = 5, Name = "Potato", NameNepali = "आलु", Description = "Potato crop" },
                new Crop { Id = 6, Name = "Onion", NameNepali = "प्याज", Description = "Onion crop" },
                new Crop { Id = 7, Name = "Garlic", NameNepali = "लसुन", Description = "Garlic crop" },
                new Crop { Id = 8, Name = "Cabbage", NameNepali = "बन्दाकोबी", Description = "Cabbage crop" },
                new Crop { Id = 9, Name = "Cauliflower", NameNepali = "काउली", Description = "Cauliflower crop" },
                new Crop { Id = 10, Name = "Tomato", NameNepali = "टमाटर", Description = "Tomato crop" },
                new Crop { Id = 11, Name = "Chili", NameNepali = "खुर्सानी", Description = "Chili crop" },
                new Crop { Id = 12, Name = "Eggplant", NameNepali = "भन्टा", Description = "Eggplant crop" },
                new Crop { Id = 13, Name = "Bitter Gourd", NameNepali = "करेला", Description = "Bitter gourd crop" },
                new Crop { Id = 14, Name = "Bottle Gourd", NameNepali = "लौका", Description = "Bottle gourd crop" },
                new Crop { Id = 15, Name = "Okra", NameNepali = "फर्सी", Description = "Okra crop" }
            );

            // Seed data for market prices
            builder.Entity<MarketPrice>().HasData(
                new MarketPrice 
                { 
                    Id = 1, 
                    CropName = "Rice", 
                    Price = 2500, 
                    Unit = "प्रति मुरी", 
                    Location = "काठमाडौं", 
                    UpdatedAt = DateTime.UtcNow, 
                    UpdatedBy = "system",
                    IsActive = true
                },
                new MarketPrice 
                { 
                    Id = 2, 
                    CropName = "Corn", 
                    Price = 2200, 
                    Unit = "प्रति मुरी", 
                    Location = "काठमाडौं", 
                    UpdatedAt = DateTime.UtcNow, 
                    UpdatedBy = "system",
                    IsActive = true
                }
            );
        }
    }
}
