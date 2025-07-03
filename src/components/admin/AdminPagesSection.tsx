
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Eye, Calendar, FileText } from "lucide-react";
import { useDynamicPages, useDeleteDynamicPage } from "@/hooks/useDynamicPages";
import DynamicPageForm from "./DynamicPageForm";

const AdminPagesSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPage, setEditingPage] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: pages, isLoading, error } = useDynamicPages();
  const deletePage = useDeleteDynamicPage();

  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      await deletePage.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isCreating || editingPage) {
    return (
      <DynamicPageForm
        page={editingPage}
        onClose={() => {
          setIsCreating(false);
          setEditingPage(null);
        }}
      />
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Error Loading Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading pages: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Pages Management
              </CardTitle>
              <p className="text-pink-100 mt-1">Create and manage dynamic pages for your platform</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)} 
              className="bg-white text-pink-600 hover:bg-pink-50 font-medium shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-6">
            <Input 
              placeholder="Search pages by title or slug..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="max-w-md border-gray-200 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          {/* Pages Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Slug</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Updated</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages && filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <TableRow key={page.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="font-medium text-gray-900">{page.title}</div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                            /{page.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          {page.published ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(page.updated_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingPage(page)}
                              className="border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(page.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No pages found</p>
                          <p className="text-sm">Create your first page to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {filteredPages && filteredPages.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
              <div>
                Total pages: <span className="font-medium text-gray-700">{filteredPages.length}</span>
              </div>
              <div className="flex gap-6">
                <span>Published: <span className="font-medium text-green-600">{filteredPages.filter(p => p.published).length}</span></span>
                <span>Drafts: <span className="font-medium text-gray-600">{filteredPages.filter(p => !p.published).length}</span></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPagesSection;
