-- PostgreSQL Setup Script for AgriFairConnect
-- Run this script as a PostgreSQL superuser (usually 'postgres')

-- Create the database (if it doesn't exist)
-- Note: You may need to run this manually if you don't have permission to create databases
-- CREATE DATABASE "AgriFairConnect";

-- Connect to the AgriFairConnect database
-- \c "AgriFairConnect";

-- Create a dedicated user for the application (optional but recommended for production)
-- CREATE USER agrifair_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE "AgriFairConnect" TO agrifair_user;

-- Grant necessary permissions (if using dedicated user)
-- GRANT CONNECT ON DATABASE "AgriFairConnect" TO agrifair_user;
-- GRANT USAGE ON SCHEMA public TO agrifair_user;
-- GRANT CREATE ON SCHEMA public TO agrifair_user;

-- Note: The Entity Framework Core will automatically create all tables when the application runs
-- This script is mainly for initial database setup

-- To verify the setup, you can run:
-- \l  -- List all databases
-- \dt -- List all tables (after running the application)
-- \du -- List all users
