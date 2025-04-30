"use client";

import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMinutes,
  uploadMinutes,
  updateMinutes,
  deleteMinutes,
} from "@/lib/supabase/server-extended/minutes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash,
  Upload,
  X,
  Info,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

interface Minutes {
  id: string;
  title: string;
  meeting_date: string;
  description: string | null;
  doc_url: string;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
}

type MinutesForm = {
  title: string;
  meeting_date: string;
  description: string;
  file: File | null;
};

type EditForm = {
  title: string;
  meeting_date: string;
  description: string;
};

export default function MinutesTable() {
  const { user } = useAuth() as any;
  const [minutes, setMinutes] = useState<Minutes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<MinutesForm>({
    title: "",
    meeting_date: "",
    description: "",
    file: null,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    meeting_date: "",
    description: "",
  });
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role check
  const isAdmin = user && ["secretary", "super-admin"].includes(user.role);

  useEffect(() => {
    fetchMinutes();
    // eslint-disable-next-line
  }, []);

  async function fetchMinutes() {
    setLoading(true);
    try {
      const data = await getMinutes();
      setMinutes((data || []) as Minutes[]);
    } catch (e: any) {
      setError("Failed to fetch minutes");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      if (!form.file) throw new Error("Please select a PDF file");
      if (!user) throw new Error("Not authenticated");
      await uploadMinutes({
        file: form.file,
        user_id: user.id,
        title: form.title,
        meeting_date: form.meeting_date,
        description: form.description,
      });
      setShowUpload(false);
      setForm({ title: "", meeting_date: "", description: "", file: null });
      fetchMinutes();
    } catch (e: any) {
      setError(e.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    setForm((f) => ({ ...f, file: file || null }));
  }

  function openEdit(minute: Minutes) {
    setEditId(minute.id);
    setEditForm({
      title: minute.title,
      meeting_date: minute.meeting_date,
      description: minute.description || "",
    });
  }

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    try {
      if (!user) throw new Error("Not authenticated");
      if (!editId) return;
      await updateMinutes({
        id: editId,
        user_id: user.id,
        updates: editForm,
      });
      setEditId(null);
      fetchMinutes();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    setDeleteLoading(true);
    setError("");
    try {
      if (!user) throw new Error("Not authenticated");
      await deleteMinutes({ id, user_id: user.id });
      setConfirmDelete(null);
      fetchMinutes();
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  }

  // PDF Viewer logic
  function handleViewPDF(url: string) {
    setPdfUrl(url);
  }

  function handleClosePDF() {
    setPdfUrl(null);
  }

  // Filter minutes based on search term and active tab
  const filteredMinutes = minutes
    .filter((minute) => {
      const matchesSearch =
        minute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (minute.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      if (activeTab === "all") return matchesSearch;

      const currentYear = new Date().getFullYear();
      const minuteYear = new Date(minute.meeting_date).getFullYear();

      if (activeTab === "current-year")
        return matchesSearch && minuteYear === currentYear;
      if (activeTab === "previous-years")
        return matchesSearch && minuteYear < currentYear;

      return matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
    );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Meeting Minutes
          </h2>
          <p className="text-muted-foreground">
            Access and manage meeting records and documentation
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Minutes
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search minutes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Minutes</TabsTrigger>
            <TabsTrigger value="current-year">Current Year</TabsTrigger>
            <TabsTrigger value="previous-years">Previous Years</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Minutes Records</CardTitle>
          <CardDescription>
            {filteredMinutes.length}{" "}
            {filteredMinutes.length === 1 ? "record" : "records"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm text-muted-foreground">
                  Loading minutes records...
                </p>
              </div>
            </div>
          ) : filteredMinutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No minutes records found</h3>
              <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                {searchTerm
                  ? `No results found for "${searchTerm}". Try a different search term.`
                  : "There are no meeting minutes records available at this time."}
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setShowUpload(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Minutes
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Title</TableHead>
                    <TableHead>Meeting Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMinutes.map((minute) => (
                    <TableRow key={minute.id} className="group">
                      <TableCell className="font-medium">
                        {minute.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          <span>
                            {minute.meeting_date
                              ? formatDate(minute.meeting_date)
                              : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {minute.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPDF(minute.doc_url)}
                          className="text-xs h-8"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> View PDF
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPDF(minute.doc_url)}
                            >
                              <FileText className="h-4 w-4 mr-2" /> View
                              Document
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={minute.doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" /> Open
                                in New Tab
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={minute.doc_url} download>
                                <Download className="h-4 w-4 mr-2" /> Download
                                PDF
                              </a>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <Separator className="my-1" />
                                <DropdownMenuItem
                                  onClick={() => openEdit(minute)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setConfirmDelete(minute.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {!loading && filteredMinutes.length > 0 && (
          <CardFooter className="flex justify-between py-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {filteredMinutes.length} of {minutes.length} records
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export All
              </a>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Inline PDF Viewer Dialog */}
      <Dialog open={!!pdfUrl} onOpenChange={handleClosePDF}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-2 flex flex-row items-center justify-between border-b">
            <DialogTitle className="text-lg">Document Viewer</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-8">
                <a href={pdfUrl || "#"} download>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePDF}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {pdfUrl && (
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                title="PDF Viewer"
                className="w-full h-full border-0"
              ></iframe>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog (Admins only) */}
      {isAdmin && (
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Meeting Minutes</DialogTitle>
              <DialogDescription>
                Add a new meeting minutes record with PDF document
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Board Meeting Minutes - January 2023"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_date">
                  Meeting Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meeting_date"
                  type="date"
                  value={form.meeting_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, meeting_date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Brief summary of the meeting content"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">
                  PDF Document <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    required
                    className={cn(
                      "flex-1",
                      form.file ? "border-emerald-500 border-dashed" : ""
                    )}
                  />
                  {form.file && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setForm((f) => ({ ...f, file: null }));
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {form.file && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {form.file.name} (
                    {(form.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Alert variant="destructive" className="bg-muted/50">
                <Info className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription className="text-xs">
                  Uploaded documents will be accessible to all members. Ensure
                  the PDF does not contain sensitive information.
                </AlertDescription>
              </Alert>

              <DialogFooter className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Minutes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog (Admins only) */}
      {isAdmin && (
        <Dialog
          open={!!editId}
          onOpenChange={(open) => {
            if (!open) setEditId(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Minutes Details</DialogTitle>
              <DialogDescription>
                Update the information for this meeting minutes record
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meeting-date">
                  Meeting Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-meeting-date"
                  type="date"
                  value={editForm.meeting_date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, meeting_date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <Alert
                variant="destructive"
                className="bg-amber-50 border-amber-200"
              >
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  Note: This will only update the metadata. To replace the PDF
                  document, please delete this record and upload a new one.
                </AlertDescription>
              </Alert>

              <DialogFooter className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <Dialog
          open={!!confirmDelete}
          onOpenChange={(open) => {
            if (!open) setConfirmDelete(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this minutes record? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 p-3 rounded-md border">
              {minutes.find((m) => m.id === confirmDelete)?.title}
            </div>
            <DialogFooter className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete && handleDelete(confirmDelete)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
