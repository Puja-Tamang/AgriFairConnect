using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgriFairConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateApplicationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiScore",
                table: "Applications");

            migrationBuilder.RenameColumn(
                name: "AppliedAt",
                table: "Applications",
                newName: "SubmittedAt");

            migrationBuilder.AlterColumn<string>(
                name: "AdminRemarks",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdditionalNotes",
                table: "Applications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CitizenImageUrl",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CropDetails",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExpectedBenefits",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerAddress",
                table: "Applications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerEmail",
                table: "Applications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerMunicipality",
                table: "Applications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerName",
                table: "Applications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerPhone",
                table: "Applications",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FarmerWard",
                table: "Applications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasReceivedGrantBefore",
                table: "Applications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LandOwnershipUrl",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "LandSize",
                table: "Applications",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "LandSizeUnit",
                table: "Applications",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LandTaxUrl",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyIncome",
                table: "Applications",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PreviousGrantDetails",
                table: "Applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Applications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(575));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(581));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(582));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(583));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(584));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(585));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(586));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(587));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(588));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(589));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(590));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(590));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(591));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(592));

            migrationBuilder.UpdateData(
                table: "Crops",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(594));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(769));

            migrationBuilder.UpdateData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 8, 30, 5, 8, 6, 36, DateTimeKind.Utc).AddTicks(772));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalNotes",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "CitizenImageUrl",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "CropDetails",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "ExpectedBenefits",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerAddress",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerEmail",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerMunicipality",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerName",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerPhone",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FarmerWard",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "HasReceivedGrantBefore",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "LandOwnershipUrl",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "LandSize",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "LandSizeUnit",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "LandTaxUrl",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "MonthlyIncome",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "PreviousGrantDetails",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Applications");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "Applications",
                newName: "AppliedAt");

            migrationBuilder.AlterColumn<string>(
                name: "AdminRemarks",
                table: "Applications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<decimal>(
                name: "AiScore",
                table: "Applications",
                type: "numeric(5,2)",
                nullable: true);

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
    }
}
