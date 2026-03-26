import { useState, useEffect } from "react";
import { movieService } from "../../services/movie.service";
import type { MovieResponse, MovieRequest } from "../../types/movie";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Edit2, Trash2, Power, PowerOff, Loader2, Plus, Upload, X } from "lucide-react";
import { UploadService } from "../../services/upload.service";
import { TagInput } from "../../components/ui/tag-input";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { isUpcomingRelease } from "../../lib/utils";

export function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const initialFormState: MovieRequest = {
    title: "",
    description: "",
    director: "",
    cast: "",
    genre: "",
    durationMinutes: 120,
    releaseDate: new Date().toISOString().split("T")[0],
    posterUrl: "",
    trailerUrl: "",
    isActive: true,
  };

  const [formData, setFormData] = useState<MovieRequest>(initialFormState);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getAllMovies(false);
      setMovies(data || []);
    } catch (error) {
      console.error("Error fetching movies", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (movie?: MovieResponse) => {
    if (movie) {
      setEditingId(movie.id);
      setFormData({
        title: movie.title || "",
        description: movie.description || "",
        director: movie.director || "",
        cast: movie.cast || "",
        genre: movie.genre || "",
        durationMinutes: movie.durationMinutes || 120,
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        posterUrl: movie.posterUrl || "",
        trailerUrl: movie.trailerUrl || "",
        isActive: movie.isActive ?? true,
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const response = await UploadService.uploadImage(file);
      if (response && response.data) {
        setFormData(prev => ({ ...prev, posterUrl: response.data || "" }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Lỗi khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.posterUrl) return;
    try {
      // Option: await UploadService.removeImage(formData.posterUrl);
      setFormData(prev => ({ ...prev, posterUrl: "" }));
    } catch (error) {
      console.error("Error removing", error);
    }
  };

  const handleTagsChange = (field: keyof MovieRequest, tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: tags.join(", ")
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await movieService.updateMovie(editingId, formData);
      } else {
        await movieService.addMovie(formData);
      }
      await fetchMovies();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving movie", error);
      alert("Đã xảy ra lỗi khi lưu phim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeleting(true);
      await movieService.deleteMovie(confirmDeleteId);
      await fetchMovies();
    } catch (error) {
      console.error("Error deleting movie", error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleToggleStatus = async (movie: MovieResponse) => {
    try {
      if (movie.isActive) {
        await movieService.deactivateMovie(movie.id);
      } else {
        await movieService.activateMovie(movie.id);
      }
      await fetchMovies();
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản Lý Phim</h2>
          <p className="text-muted-foreground mt-1">Quản lý toàn bộ danh mục phim đang và sắp chiếu của hệ thống.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-md hover:shadow-lg">
          <Plus className="h-4 w-4" /> Thêm Phim Mới
        </Button>
      </div>

      <div className="border border-white/10 rounded-xl bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground border-b border-white/10 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Tên phim</th>
                  <th className="px-6 py-4 font-medium">Thời lượng</th>
                  <th className="px-6 py-4 font-medium">Khởi chiếu</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground truncate max-w-[200px]">{movie.title}</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {movie.genre?.split(",").slice(0, 2).map((g, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]">{g.trim()}</span>
                        ))}
                        {movie.genre?.split(",").length > 2 && <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]">+{movie.genre.split(",").length - 2}</span>}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {movie.director?.split(",").map((d, i) => (
                           <span key={i} className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 border border-violet-500/20 text-[10px]">{d.trim()}</span>
                        ))}
                      </div>
                    </td> */}
                    <td className="px-6 py-4">{movie.durationMinutes} phút</td>
                    <td className="px-6 py-4">{new Date(movie.releaseDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const upcoming = movie.isActive && isUpcomingRelease(movie.releaseDate);
                        if (!movie.isActive) {
                          return (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                              Ngừng chiếu
                            </span>
                          );
                        }

                        if (upcoming) {
                          return (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Sắp chiếu
                            </span>
                          );
                        }

                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            Đang chiếu
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(movie)} title={movie.isActive ? 'Ngừng chiếu' : 'Kích hoạt'}>
                          {movie.isActive ? <PowerOff className="h-4 w-4 text-amber-500" /> : <Power className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(movie)}>
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(movie.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {movies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Không có dữ liệu phim nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa thông tin phim" : "Thêm phim mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên phim <span className="text-red-500">*</span></Label>
                <Input id="title" name="title" required value={formData.title} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="director">Đạo diễn <span className="text-red-500">*</span></Label>
                <TagInput
                  id="director"
                  tags={formData.director ? formData.director.split(',').map(s => s.trim()).filter(Boolean) : []}
                  onTagsChange={(tags) => handleTagsChange('director', tags)}
                  placeholder="Thêm đạo diễn..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Thể loại <span className="text-red-500">*</span></Label>
                <TagInput
                  id="genre"
                  tags={formData.genre ? formData.genre.split(',').map(s => s.trim()).filter(Boolean) : []}
                  onTagsChange={(tags) => handleTagsChange('genre', tags)}
                  placeholder="Thêm thể loại..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cast">Diễn viên <span className="text-red-500">*</span></Label>
                <TagInput
                  id="cast"
                  tags={formData.cast ? formData.cast.split(',').map(s => s.trim()).filter(Boolean) : []}
                  onTagsChange={(tags) => handleTagsChange('cast', tags)}
                  placeholder="Thêm diễn viên..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Thời lượng (phút) <span className="text-red-500">*</span></Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" required min="1" value={formData.durationMinutes} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Ngày khởi chiếu <span className="text-red-500">*</span></Label>
                <Input id="releaseDate" name="releaseDate" type="date" required value={formData.releaseDate} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poster (Hình ảnh) <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-4">
                {formData.posterUrl ? (
                  <div className="relative h-24 w-16 rounded overflow-hidden shadow-sm border border-border group">
                    <img src={formData.posterUrl} alt="Poster" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title="Xóa poster"
                        aria-label="Xóa poster"
                        className="text-red-500 bg-red-500/10 p-1.5 rounded-full hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-16 bg-secondary/50 rounded flex items-center justify-center border border-dashed border-muted-foreground/30">
                    <Upload className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  {isUploading && <p className="text-xs text-primary mt-2 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Đang tải ảnh lên...</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailerUrl">Link Trailer (YouTube)</Label>
              <Input id="trailerUrl" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Mô tả phim</Label>
              <div className="[&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-base mb-4">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={handleCloseDialog} disabled={isSubmitting || isUploading}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting || isUploading || (!formData.posterUrl && formData.posterUrl === "")}>
                {isSubmitting || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Xóa phim"
        description="Bạn có chắc chắn muốn xóa phim này không? Hành động này không thể hoàn tác."
        confirmText="Xóa phim"
        variant="destructive"
        loading={isDeleting}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
