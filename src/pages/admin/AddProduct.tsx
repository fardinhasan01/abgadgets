import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import BottomNav from '@/components/BottomNav';
// Cloudinary config (use your own .env or config file)
const CLOUDINARY_CLOUD_NAME = 'ddepldnwo';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_upload';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

const TAGS = ["Hot", "Exclusive", "Trending"];

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileWithPreview {
  file: File;
  preview: string;
  url?: string;
  status: UploadStatus;
  error?: string;
}

const uploadToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void,
  retryCount = 0
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_UPLOAD_URL);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else if (retryCount < 2) {
        // Retry up to 2 times
        setTimeout(() => {
          uploadToCloudinary(file, onProgress, retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => {
      if (retryCount < 2) {
        setTimeout(() => {
          uploadToCloudinary(file, onProgress, retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    };

    xhr.send(formData);
  });
};

const AddProduct: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [mainPrice, setMainPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState<FileWithPreview | null>(null);
  const [additionalImages, setAdditionalImages] = useState<FileWithPreview[]>([]);
  const [video, setVideo] = useState<FileWithPreview | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for file selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Invalid File Type', 
          description: 'Please select an image file (JPEG, PNG, GIF, etc.)', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: 'File Too Large', 
          description: 'Please select an image smaller than 5MB', 
          variant: 'destructive' 
        });
        return;
      }
      
      setMainImage({
        file,
        preview: URL.createObjectURL(file),
        status: "idle",
      });
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles: FileWithPreview[] = [];
      
      for (const file of filesArray) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({ 
            title: 'Invalid File Type', 
            description: `${file.name} is not an image file. Please select image files only.`, 
            variant: 'destructive' 
          });
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({ 
            title: 'File Too Large', 
            description: `${file.name} is too large. Please select images smaller than 5MB.`, 
            variant: 'destructive' 
          });
          continue;
        }
        
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          status: "idle" as UploadStatus,
        });
      }
      
      // Limit to 5 additional images
      if (validFiles.length + additionalImages.length > 5) {
        toast({ 
          title: 'Too Many Images', 
          description: 'You can upload a maximum of 5 additional images', 
          variant: 'destructive' 
        });
        return;
      }
      
      setAdditionalImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({ 
          title: 'Invalid File Type', 
          description: 'Please select a video file (MP4, MOV, etc.)', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({ 
          title: 'File Too Large', 
          description: 'Please select a video smaller than 50MB', 
          variant: 'destructive' 
        });
        return;
      }
      
      setVideo({
        file,
        preview: URL.createObjectURL(file),
        status: "idle",
      });
    }
  };

  // Tag checkbox handler
  const handleTagChange = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Validation
  const validate = () => {
    if (!name.trim()) {
      toast({ title: 'Validation Error', description: 'Product name is required', variant: 'destructive' });
      return false;
    }
    if (!mainPrice.trim() || isNaN(Number(mainPrice)) || Number(mainPrice) <= 0) {
      toast({ title: 'Validation Error', description: 'Main price must be a positive number', variant: 'destructive' });
      return false;
    }
    if (!mainImage || !mainImage.file) {
      toast({ title: 'Validation Error', description: 'Main image is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  // Upload all files to Cloudinary and return URLs
  const uploadAllFiles = async (): Promise<{
    mainImageUrl: string;
    additionalImageUrls: string[];
    videoUrl: string | null;
  }> => {
    // Main image
    let mainImageUrl = "";
    if (mainImage && mainImage.file) {
      setMainImage((prev) => prev && { ...prev, status: "uploading" });
      try {
        mainImageUrl = await uploadToCloudinary(mainImage.file);
        setMainImage((prev) => prev && { ...prev, url: mainImageUrl, status: "success" });
      } catch (err) {
        setMainImage((prev) => prev && { ...prev, status: "error", error: (err as Error).message });
        throw err;
      }
    }

    // Additional images
    const additionalImageUrls: string[] = [];
    for (let i = 0; i < additionalImages.length; i++) {
      setAdditionalImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: "uploading" } : img
        )
      );
      try {
        const url = await uploadToCloudinary(additionalImages[i].file);
        additionalImageUrls.push(url);
        setAdditionalImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, url, status: "success" } : img
          )
        );
      } catch (err) {
        setAdditionalImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: "error", error: (err as Error).message } : img
          )
        );
        throw err;
      }
    }

    // Video
    let videoUrl: string | null = null;
    if (video && video.file) {
      setVideo((prev) => prev && { ...prev, status: "uploading" });
      try {
        videoUrl = await uploadToCloudinary(video.file);
        setVideo((prev) => prev && { ...prev, url: videoUrl, status: "success" });
      } catch (err) {
        setVideo((prev) => prev && { ...prev, status: "error", error: (err as Error).message });
        throw err;
      }
    }

    return { mainImageUrl, additionalImageUrls, videoUrl };
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // 1. Upload files to Cloudinary
      const { mainImageUrl, additionalImageUrls, videoUrl } = await uploadAllFiles();

      // 2. Save product data to Firestore
      const productData = {
        name: name.trim(),
        mainPrice: Number(mainPrice),
        offerPrice: offerPrice.trim() ? Number(offerPrice) : null,
        description: description.trim(),
        mainImageUrl,
        additionalImageUrls,
        videoUrl,
        inStock,
        tags,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "products"), productData);
      toast({ title: '✅ Success', description: 'Product added successfully!' });

      // 3. Reset form
      setName('');
      setMainPrice('');
      setOfferPrice('');
      setDescription('');
      setMainImage(null);
      setAdditionalImages([]);
      setVideo(null);
      setTags([]);
      setInStock(true);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: '❌ Error', description: 'Failed to add product. Check console for details.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => {
      const newImages = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Remove video
  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };

  // Clear main image
  const clearMainImage = () => {
    if (mainImage) {
      URL.revokeObjectURL(mainImage.preview);
      setMainImage(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white/80 p-8 rounded-lg border border-blue-200/30 backdrop-blur-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-700">Product Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" required className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700">Main Price (৳)</Label>
            <Input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              value={mainPrice}
              onChange={(e) => setMainPrice(e.target.value)}
              placeholder="e.g., 1200"
              required
              className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-700">Offer Price (৳)</Label>
            <Input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="Optional offer price"
              className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-700">In Stock</Label>
            <div className="flex items-center gap-2 mt-2 text-gray-700">
              <input type="checkbox" id="inStock" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 rounded border-blue-200 bg-white text-blue-500 focus:ring-blue-400" />
              <label htmlFor="inStock" className="cursor-pointer">{inStock ? 'In Stock' : 'Out of Stock'}</label>
            </div>
          </div>
        </div>
        <div>
          <Label className="text-gray-700">Description</Label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" rows={3} className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 mt-1 rounded p-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-700">Main Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              required
              className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1"
              disabled={isSubmitting}
            />
            {mainImage && (
              <div className="mt-4">
                <img
                  src={mainImage.url || mainImage.preview}
                  alt="Main Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-blue-200"
                />
                <div className="text-xs mt-1 text-gray-500">
                  {mainImage.status === "uploading" && "Uploading..."}
                  {mainImage.status === "success" && "Uploaded"}
                  {mainImage.status === "error" && (
                    <span className="text-red-500">Upload failed</span>
                  )}
                  {mainImage.url && (
                    <a
                      href={mainImage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 underline"
                    >
                      View on Cloudinary
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <Label className="text-gray-700">Additional Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1"
              disabled={isSubmitting}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {additionalImages.map((img, i) => (
                <div key={i} className="flex flex-col items-center">
                  <img
                    src={img.url || img.preview}
                    className="w-16 h-16 object-cover rounded border border-blue-200"
                    alt={`Additional preview ${i + 1}`}
                  />
                  <div className="text-xs text-gray-500">
                    {img.status === "uploading" && "Uploading..."}
                    {img.status === "success" && "Uploaded"}
                    {img.status === "error" && (
                      <span className="text-red-500">Upload failed</span>
                    )}
                    {img.url && (
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-500 underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-700">Video (optional)</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full bg-white border-blue-200 text-[#222] focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1"
              disabled={isSubmitting}
            />
            {video && (
              <div className="mt-4">
                <video
                  src={video.url || video.preview}
                  controls
                  className="w-48 rounded border border-blue-200"
                />
                <div className="text-xs mt-1 text-gray-500">
                  {video.status === "uploading" && "Uploading..."}
                  {video.status === "success" && "Uploaded"}
                  {video.status === "error" && (
                    <span className="text-red-500">Upload failed</span>
                  )}
                  {video.url && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 underline"
                    >
                      View on Cloudinary
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <Label className="text-gray-700">Tags</Label>
            <div className="flex gap-4 flex-wrap mt-2 text-gray-700">
              {TAGS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={tag}
                    checked={tags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="h-4 w-4 rounded border-blue-200 bg-white text-blue-500 focus:ring-blue-400"
                    disabled={isSubmitting}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-200 to-cyan-200 hover:from-blue-300 hover:to-cyan-300 text-[#222] py-3 rounded-lg font-semibold transition-all duration-300"
        >
          {isSubmitting ? "Uploading..." : "Add Product"}
        </Button>
      </form>
      <BottomNav />
    </>
  );
};

export default AddProduct;
