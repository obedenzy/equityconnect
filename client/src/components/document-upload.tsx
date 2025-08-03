import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  X, 
  Eye,
  Download,
  Shield,
  AlertCircle 
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  isRedacted: boolean;
  uploadProgress: number;
}

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, DOC, or DOCX files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isRedacted: false,
        uploadProgress: 0,
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      // Simulate upload progress
      simulateUpload(fileId);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, uploadProgress: progress }
            : file
        )
      );
      
      if (progress >= 100) {
        clearInterval(interval);
        toast({
          title: "Upload complete",
          description: "Document uploaded successfully. You can now redact sensitive information.",
        });
      }
    }, 200);
  };

  const handleRedaction = (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, isRedacted: true }
          : file
      )
    );
    
    toast({
      title: "Redaction applied",
      description: "Sensitive information has been redacted. Document is ready for sharing.",
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? "border-financial-blue bg-blue-50" 
            : "border-slate-300 hover:border-financial-blue"
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <div className="text-sm text-slate-600">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-financial-blue hover:text-blue-800">
            <span>Upload LOI and Termsheet</span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              multiple 
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB each</p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <FileText className="h-8 w-8 text-red-500 mr-3" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatFileSize(file.size)} • {file.uploadProgress < 100 ? 'Uploading...' : 'Uploaded'}
                      </div>
                      {file.uploadProgress < 100 && (
                        <Progress value={file.uploadProgress} className="mt-2 h-2" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {file.uploadProgress === 100 && (
                      <>
                        {file.isRedacted ? (
                          <Badge className="bg-financial-success text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Redacted
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRedaction(file.id)}
                            className="text-financial-blue border-financial-blue hover:bg-blue-50"
                          >
                            Apply Redaction
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-financial-blue mr-2 mt-0.5" />
            <div className="text-sm text-financial-blue">
              <strong>Security Reminder:</strong> Please redact sensitive information such as company names, 
              addresses, and financial details before sharing documents with investors. You can grant 
              specific access permissions to individual investors after initial contact.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Types Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Letter of Intent (LOI)</h4>
            <p className="text-sm text-slate-600">
              Upload your LOI outlining the acquisition terms, purchase price, 
              and initial deal structure. This document will be shared with qualified investors.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Termsheet</h4>
            <p className="text-sm text-slate-600">
              Include your termsheet with detailed financial terms, equity structure, 
              and investment conditions for potential equity partners.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
