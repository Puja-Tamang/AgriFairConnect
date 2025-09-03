using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgriFairConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class RecreateMarketPricesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8280));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8284));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8285));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8287));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8288));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8289));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8290));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8291));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8292));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8293));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8294));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8295));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8296));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8297));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8298));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8496));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 9, 3, 6, 1, 42, 104, DateTimeKind.Utc).AddTicks(8498));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                column: "UpdatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6959));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 9, 3, 3, 38, 37, 276, DateTimeKind.Utc).AddTicks(6962));
        }
    }
}
