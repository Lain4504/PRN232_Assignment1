'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post, PostAPI, PaginatedResponse, SearchParams } from '@/lib/api';
import { PostTable } from '@/components/posts/post-table';
import { PostSearch } from '@/components/posts/post-search';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (page: number = 1, searchParams?: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchParams && Object.keys(searchParams).length > 0) {
        // Use search API if search parameters are provided
        response = await PostAPI.searchPosts({ ...searchParams, page, pageSize: 10 });
        setIsSearching(true);
      } else {
        // Use regular get posts API
        response = await PostAPI.getPosts(page, 10);
        setIsSearching(false);
      }
      
      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Post>;
        setPosts(paginatedData.data);
        setCurrentPage(paginatedData.currentPage);
        setTotalPages(paginatedData.totalPages);
      } else {
        setError(response.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setPostToDelete(post);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async (postId: string) => {
    try {
      const response = await PostAPI.deletePost(postId);
      if (response.success) {
        // Close dialog immediately on success  
        setShowDeleteDialog(false);
        setPostToDelete(null);
        // Reset to page 1 and refresh the data
        setCurrentPage(1);
        await fetchPosts(1, isSearching ? searchParams : undefined);
      } else {
        setError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleEdit = (post: Post) => {
    router.push(`/posts/${post.id}/edit`);
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage(1);
    fetchPosts(1, params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, isSearching ? searchParams : undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">Posts</h1>
            <p className="text-base sm:text-lg text-muted-foreground">Manage all posts in the system</p>
          </div>
          <Button onClick={() => router.push('/posts/new')} className="flex items-center gap-2 w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Post</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Search Component */}
        <PostSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        <PostTable 
          data={posts} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Delete Confirmation Dialog */}
        <DeletePostDialog
          post={postToDelete}
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setPostToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
