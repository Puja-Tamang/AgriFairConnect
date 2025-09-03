using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgriFairConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCropPhotoToMarketPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CropPhoto",
                table: "MarketPrices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MonthlyIncome",
                table: "FarmerProfiles",
                type: "numeric(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "LandSize",
                table: "FarmerProfiles",
                type: "numeric(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)");

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6655));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6664));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6665));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6666));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6668));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6669));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6670));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6671));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6672));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6673));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6674));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6675));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6677));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6678));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6679));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CropPhoto", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6959) });

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CropPhoto", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6962) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CropPhoto",
                table: "MarketPrices");

            migrationBuilder.AlterColumn<decimal>(
                name: "MonthlyIncome",
                table: "FarmerProfiles",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "LandSize",
                table: "FarmerProfiles",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6108));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6112));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6113));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6114));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6115));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6116));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6117));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6118));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6119));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6120));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6120));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6121));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6122));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6123));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6124));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6298));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 11, 52, 23, 847, DateTimeKind.Utc).AddTicks(6300));
        }
    }
}
