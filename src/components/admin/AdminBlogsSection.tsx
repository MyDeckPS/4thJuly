
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { useBlogs } from '@/hooks/useBlogs';
import DebugConsole from './DebugConsole';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BlogForm from './BlogForm';

const AdminBlogsSection = () => {
  const { blogs, loading, createBlog, updateBlog, deleteBlog } = useBlogs();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog entry?')) {
      try {
        const logger = (window as any).debugLogger_Blogs;
        logger?.info('Deleting blog', { blogId: id });
        
        await deleteBlog(id);
        
        logger?.info('Blog deleted successfully', { blogId: id });
      } catch (error) {
        const logger = (window as any).debugLogger_Blogs;
        logger?.error('Failed to delete blog', { blogId: id, error });
      }
    }
  };

  const togglePublished = async (blog: any) => {
    try {
      const logger = (window as any).debugLogger_Blogs;
      logger?.info('Toggling blog published status', { 
        blogId: blog.id, 
        currentStatus: blog.published 
      });
      
      await updateBlog(blog.id, { published: !blog.published });
      
      logger?.info('Blog status toggled successfully', { 
        blogId: blog.id, 
        newStatus: !blog.published 
      });
    } catch (error) {
      const logger = (window as any).debugLogger_Blogs;
      logger?.error('Failed to toggle blog status', { 
        blogId: blog.id, 
        error 
      });
    }
  };

  const handleCreateBlog = async (data: any) => {
    await createBlog(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateBlog = async (data: any) => {
    if (editingBlog) {
      await updateBlog(editingBlog.id, data);
      setEditingBlog(null);
    }
  };

  if (loading) return <div>Loading blogs...</div>;

  return (
    <div className="space-y-6">
      <DebugConsole module="Blogs" />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blogs Management</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Entry</DialogTitle>
              </DialogHeader>
              <BlogForm
                blog={null}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateBlog}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <img
                      src={blog.hero_image}
                      alt={blog.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>
                    <Badge variant={blog.published ? "default" : "secondary"}>
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.publish_date ? new Date(blog.publish_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/blogs/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBlog(blog)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={blog.published ? "secondary" : "default"}
                        onClick={() => togglePublished(blog)}
                      >
                        {blog.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingBlog && (
            <Dialog open={!!editingBlog} onOpenChange={() => setEditingBlog(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Blog Entry</DialogTitle>
                </DialogHeader>
                <BlogForm
                  blog={editingBlog}
                  onClose={() => setEditingBlog(null)}
                  onSubmit={handleUpdateBlog}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBlogsSection;
