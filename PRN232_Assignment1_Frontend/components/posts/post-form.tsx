'use client';

import { useState, useEffect } from 'react';
import { Post, PostAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PostFormProps {
  post?: Post | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function PostForm({ post, onClose, onSubmit }: PostFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isEditing = !!post;

  useEffect(() => {
    if (post) {
      setFormData({
        name: post.name,
        description: post.description,
        imageUrl: post.image || '',
      });
    }
  }, [post]);

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
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL when file is selected
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
        setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL when file is selected
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const postData = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl.trim() || undefined,
        imageFile: imageFile || undefined,
      };

      let response;
      if (isEditing && post) {
        response = await PostAPI.updatePost({
          ...postData,
          id: post.id,
        });
      } else {
        response = await PostAPI.createPost(postData);
      }

      if (response.success) {
        toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
        onSubmit();
      } else {
        setError(response.message || 'Failed to save post');
        toast.error(response.message || 'Error saving post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update post information' : 'Fill in the post details'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Post Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
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
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Image Upload or URL */}
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL (Optional)
              </label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                disabled={!!imageFile}
              />
              <p className="text-xs text-gray-500">Or upload an image file below</p>
            </div>

            {/* Image File Upload */}
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Upload Image (Optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/10' 
                      : imageFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imageFile ? (
                      <>
                        <div className="w-8 h-8 mb-4 text-green-600 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="mb-2 text-sm text-green-700 font-medium">
                          ✓ {imageFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : isEditing && post?.image && !formData.imageUrl ? (
                      <>
                        <div className="w-8 h-8 mb-4 text-blue-600 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="mb-2 text-sm text-blue-700 font-medium text-center px-2">
                          📷 Current image in use
                        </p>
                        <p className="text-xs text-blue-600 text-center px-2">
                          Select new image to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 text-center px-2">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 text-center px-2">PNG, JPG or GIF (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

