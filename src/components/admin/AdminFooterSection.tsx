
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useFooterManagement } from "@/hooks/useFooterManagement";
import { useHeaderLinks } from "@/hooks/useHeaderLinks";
import FooterColumnManager from "@/components/admin/FooterColumnManager";
import FooterLinkDialog from "@/components/admin/FooterLinkDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminFooterSection = () => {
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkCategory, setLinkCategory] = useState<'header' | 'footer'>('footer');

  const {
    footerColumns,
    footerLinks,
    isLoading,
    deleteColumn,
    deleteLink,
    isDeletingColumn,
    isDeletingLink
  } = useFooterManagement();

  const { headerLinks, isLoading: headerLoading } = useHeaderLinks();

  const handleEditColumn = (column: any) => {
    setSelectedColumn(column.id);
    setShowColumnManager(true);
  };

  const handleAddLink = (columnId: string, category: 'header' | 'footer' = 'footer') => {
    setSelectedColumn(columnId);
    setEditingLink(null);
    setLinkCategory(category);
    setShowLinkDialog(true);
  };

  const handleEditLink = (link: any) => {
    setSelectedColumn(link.footer_column_id);
    setEditingLink(link);
    setLinkCategory(link.link_category || 'footer');
    setShowLinkDialog(true);
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm("Are you sure you want to delete this column? This will also delete all links in this column.")) {
      try {
        deleteColumn(columnId);
      } catch (error) {
        console.error("Delete column error:", error);
        toast.error("Failed to delete column");
      }
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        deleteLink(linkId);
      } catch (error) {
        console.error("Delete link error:", error);
        toast.error("Failed to delete link");
      }
    }
  };

  if (isLoading || headerLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Navigation Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading navigation configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="footer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="header">Header Navigation</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="header" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Header Navigation Links</h3>
                <Button 
                  onClick={() => handleAddLink('', 'header')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Header Link
                </Button>
              </div>
              
              {headerLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No header navigation links found. Create your first link to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {headerLinks.map((link: any) => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{link.title}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({link.url})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLink(link)}
                          disabled={isDeletingLink}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={isDeletingLink}
                        >
                          {isDeletingLink ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="footer" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Footer Columns</h3>
                <Button 
                  onClick={() => {
                    setSelectedColumn(null);
                    setShowColumnManager(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Column
                </Button>
              </div>
              
              {!footerColumns || footerColumns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No footer columns found. Create your first column to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {footerColumns.map((column: any) => (
                    <div key={column.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{column.column_title}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditColumn(column)}
                            disabled={isDeletingColumn}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLink(column.id, 'footer')}
                            disabled={isDeletingColumn}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteColumn(column.id)}
                            disabled={isDeletingColumn}
                          >
                            {isDeletingColumn ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {footerLinks
                          ?.filter((link: any) => link.footer_column_id === column.id && link.link_category !== 'header')
                          ?.map((link: any) => (
                            <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{link.title}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({link.url})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLink(link)}
                                  disabled={isDeletingLink}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLink(link.id)}
                                  disabled={isDeletingLink}
                                >
                                  {isDeletingLink ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        {(!footerLinks || footerLinks.filter((link: any) => link.footer_column_id === column.id && link.link_category !== 'header').length === 0) && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No links in this column yet. Click the + button to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showColumnManager && (
        <FooterColumnManager
          columnId={selectedColumn}
          onClose={() => {
            setShowColumnManager(false);
            setSelectedColumn(null);
          }}
        />
      )}

      {showLinkDialog && (
        <FooterLinkDialog
          columnId={selectedColumn}
          link={editingLink}
          linkCategory={linkCategory}
          onClose={() => {
            setShowLinkDialog(false);
            setSelectedColumn(null);
            setEditingLink(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminFooterSection;
