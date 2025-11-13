'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post, PostAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await PostAPI.getPostById(postId);
        
        if (response.success) {
          const postData = response.data;
          setPost(postData);
          setFormData({
            name: postData.name,
            description: postData.description,
          });
        } else {
          setError(response.message || 'Post not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const postData = {
        name: formData.name,
        description: formData.description,
        imageFile: imageFile || undefined,
      };

      const response = await PostAPI.updatePost({
        ...postData,
        id: postId,
      });

      if (response.success) {
        toast.success('Post updated successfully!');
        router.push('/');
      } else {
        setError(response.message || 'Failed to save post');
        toast.error(response.message || 'Error saving post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Error saving post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-xl" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="text-center py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-destructive mb-4">Error</h1>
          <p className="text-base text-muted-foreground mb-6">{error || 'Post not found'}</p>
          <Button onClick={() => router.push('/')} className="shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Button variant="outline" onClick={() => router.push(`/posts/${postId}`)} className="flex items-center gap-2 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Edit Post</h1>
            <p className="text-base text-muted-foreground">Update the post details</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
            <CardDescription>Update post details</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl shadow-sm">
                  {error}
                </div>
              )}

              {/* Post Name */}
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter post name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              {/* Post Description */}
              <div className="space-y-3">
                <label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter post description"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-3 border border-border/60 rounded-xl bg-background/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:border-ring resize-none transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md focus:bg-background text-sm"
                />
              </div>

              {/* Image File Upload */}
              <div className="space-y-3">
                <label htmlFor="image" className="text-sm font-semibold text-foreground">
                  Upload Image (Optional)
                </label>
                
                {imagePreview ? (
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-video w-full">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 border-t border-border/40 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {imageFile?.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(imageFile && (imageFile.size / 1024 / 1024).toFixed(2)) || '0'} MB
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : post.image ? (
                  <Card className="relative overflow-hidden group">
                    <CardContent className="p-0">
                      <label
                        htmlFor="image"
                        className="block cursor-pointer"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="relative aspect-video w-full">
                          <Image
                            src={post.image}
                            alt="Current image"
                            fill
                            className="object-cover transition-opacity group-hover:opacity-80"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border/60 shadow-lg">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-foreground" />
                                <span className="text-sm font-medium text-foreground">Click to replace</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-t border-border/40 bg-muted/20">
                          <p className="text-sm text-muted-foreground text-center">
                            Current image. Click to upload a new image to replace it.
                          </p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <label
                        htmlFor="image"
                        className={`flex flex-col items-center justify-center w-full min-h-[200px] cursor-pointer transition-all duration-200 ${
                          isDragOver 
                            ? 'bg-primary/5 border-2 border-dashed border-primary' 
                            : 'hover:bg-muted/30'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                          <div className={`rounded-full p-4 mb-4 ${
                            isDragOver ? 'bg-primary/10' : 'bg-muted/50'
                          }`}>
                            <Upload className={`h-8 w-8 ${
                              isDragOver ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <p className="mb-2 text-sm font-semibold text-foreground text-center">
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-muted-foreground text-center">
                            PNG, JPG, GIF or WEBP (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.push(`/posts/${postId}`)} className="shadow-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="shadow-sm">
                  {saving ? 'Updating...' : 'Update Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

