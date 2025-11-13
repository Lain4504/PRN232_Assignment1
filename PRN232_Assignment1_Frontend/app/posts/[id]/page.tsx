'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post, PostAPI } from '@/lib/api';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await PostAPI.getPostById(postId);
        
        if (response.success) {
          setPost(response.data);
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (postId: string) => {
    try {
      const response = await PostAPI.deletePost(postId);
      if (response.success) {
        // Close dialog first
        setShowDeleteDialog(false);
        // Navigate to posts list page
        router.push('/');
      } else {
        setError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-48 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="h-64 sm:h-80 lg:h-96 w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/2 rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="text-center py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-destructive mb-4">Error</h1>
          <p className="text-base text-muted-foreground mb-6 px-4">{error || 'Post not found'}</p>
          <Button onClick={() => router.push('/')} className="w-full sm:w-auto shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 lg:space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Button>
          </div>

          {/* Post Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Post Image */}
            <div className="space-y-6">
              <div className="relative">
                <div className="aspect-video bg-muted/50 rounded-2xl overflow-hidden shadow-lg border border-border/40">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.name}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                      width={800}
                      height={450}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-lg font-medium">No image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Information */}
            <div className="space-y-6 sm:space-y-8">
              {/* Post Title */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground flex-1 tracking-tight leading-tight">{post.name}</h1>
                </div>
                
                <div className="text-sm text-muted-foreground/70 font-mono">
                  ID: {post.id}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Description</h3>
                <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">{post.description}</p>
              </div>

              {/* Admin Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/posts/${postId}/edit`)}
                  className="flex items-center justify-center gap-2 shadow-sm border-border/60 hover:bg-blue-50/50 hover:border-blue-300/50 hover:text-blue-700 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Post
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="flex items-center justify-center gap-2 shadow-sm border-border/60 hover:bg-red-50/50 hover:border-red-300/50 hover:text-red-700 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeletePostDialog
        post={post}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

