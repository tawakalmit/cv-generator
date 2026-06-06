-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile (except is_verified)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Allow insert for authenticated users (during signup)
CREATE POLICY "Allow insert for authenticated users"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
    ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, is_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CV Documents table
-- ============================================
CREATE TABLE IF NOT EXISTS public.cv_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'CV Tanpa Judul',
    template TEXT NOT NULL DEFAULT 'modern',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.cv_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own CV documents
CREATE POLICY "Users can read own cv_documents"
    ON public.cv_documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own CV documents
CREATE POLICY "Users can insert own cv_documents"
    ON public.cv_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own CV documents
CREATE POLICY "Users can update own cv_documents"
    ON public.cv_documents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own CV documents
CREATE POLICY "Users can delete own cv_documents"
    ON public.cv_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_cv_documents_update
    BEFORE UPDATE ON public.cv_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Storage bucket for CV photos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-photos', 'cv-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own photos
CREATE POLICY "Users can upload own photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'cv-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photos"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'cv-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'cv-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Anyone can view photos (public bucket)
CREATE POLICY "Public can view photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'cv-photos');
