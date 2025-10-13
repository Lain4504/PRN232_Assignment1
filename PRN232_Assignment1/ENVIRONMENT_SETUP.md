# Environment Setup Guide

## Backend Environment Variables

Create a `.env` file in the `PRN232_Assignment1` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# PayOS Configuration (for payment integration)
PAYOS_CLIENT_ID=your_payos_client_id_here
PAYOS_API_KEY=your_payos_api_key_here
PAYOS_CHECKSUM_KEY=your_payos_checksum_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# R2 Configuration (for image storage)
R2_ACCESS_KEY=your_r2_access_key_here
R2_SECRET_KEY=your_r2_secret_key_here
R2_ACCOUNT_ID=your_r2_account_id_here
R2_BUCKET_NAME=your_r2_bucket_name_here
R2_PUBLIC_URL=your_r2_public_url_here
```

## Frontend Environment Variables

Create a `.env.local` file in the `PRN232_Assignment1_Frontend` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Database Setup

1. Run the SQL commands in `database_setup.sql` in your Supabase SQL editor to create the necessary tables and policies.

2. Make sure Row Level Security (RLS) is enabled and the policies are correctly set up.

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key

## Getting PayOS Credentials

1. Go to [PayOS Dashboard](https://my.payos.vn)
2. Create an application
3. Get your Client ID, API Key, and Checksum Key from the dashboard

## Running the Application

### Backend
```bash
cd PRN232_Assignment1
dotnet run
```

### Frontend
```bash
cd PRN232_Assignment1_Frontend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.
