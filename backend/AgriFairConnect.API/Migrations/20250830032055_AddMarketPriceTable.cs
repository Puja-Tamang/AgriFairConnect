using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgriFairConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketPriceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(310));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(319));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(321));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(323));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(325));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(326));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(328));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(330));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(333));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(335));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(336));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(337));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(339));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(340));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(341));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(840));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 3, 20, 52, 507, DateTimeKind.Utc).AddTicks(846));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(650));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(659));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(662));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(663));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(665));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(666));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(667));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(669));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(670));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(671));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(672));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(673));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(675));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(676));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(677));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(1119));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 29, 20, 41, 56, 540, DateTimeKind.Utc).AddTicks(1122));
        }
    }
}
