"use client";

import React, { useState } from "react";
import { useProjectStore, FileItem } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { Search, Plus, Folder, File, ArrowLeft, Trash2, Calendar, HardDrive, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilesViewProps {
  projectScope?: string;
}

export const FilesView: React.FC<FilesViewProps> = ({ projectScope }) => {
  const { activeProjectId, files, fetchWorkspaceData } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const projectFiles = files[targetProjectId] || [];
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Load environment database helper
  const getDbProductionId = (projectId: string) => {
    if (projectId === "proj-1") return "d3b07384-d113-4ec6-a558-7e289bf449f1";
    if (projectId === "proj-2") return "44b6c33c-35cd-43ff-90a6-c956b7cdb10d";
    if (projectId === "proj-3") return "5c84a861-26be-45a2-9ad6-2ea8fb60a5ad";
    return projectId;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const prodId = getDbProductionId(targetProjectId);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("files")
        .insert({
          production_id: prodId,
          name: file.name,
          type: "file",
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          user_id: user?.id
        });

      if (error) throw error;

      await fetchWorkspaceData();
      alert(`File "${file.name}" uploaded successfully!`);
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      const { error } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;
      await fetchWorkspaceData();
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    }
  };

  // Simple file filter logic:
  const displayedFiles = projectFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    
    if (currentFolder) {
      if (currentFolder === "Scripts") {
        return matchesSearch && (file.extension === "pdf" || file.name.includes("script") || file.name.includes("screenplay"));
      }
      if (currentFolder === "RAW Footage" || currentFolder === "Moodboards & Concept Art") {
        return matchesSearch && (file.extension === "mp4" || file.name.includes("teaser") || file.extension === "jpg");
      }
      return matchesSearch && file.type === "file";
    }
    
    if (file.type === "folder") return matchesSearch;
    return matchesSearch && !file.name.includes("script") && !file.name.includes("teaser");
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* File Vault Stats Banner */}
      <Card className="bg-white/[0.01] border-white/5">
        <CardContent className="p-4 flex justify-between items-center text-xs text-text-secondary font-mono">
          <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-primary" /> Active Vault Volume</span>
          <span className="text-white font-semibold">1.4 TB of 5 TB used</span>
        </CardContent>
      </Card>

      {/* Breadcrumb / Search row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {currentFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentFolder(null)}
              className="h-8 px-2.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          )}
          <span className="text-sm font-semibold text-white">
            {currentFolder ? `Files / ${currentFolder}` : "Root Directory"}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search filenames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
            />
          </div>

          <Button
            variant="primary"
            className="h-9 text-xs flex items-center gap-1.5 cursor-pointer relative shrink-0"
            disabled={isUploading}
          >
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <Plus className="w-4 h-4 text-black font-bold" />
            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          </Button>
        </div>
      </div>

      {/* Grid of files and folders */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedFiles.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            This directory folder is empty.
          </div>
        ) : (
          displayedFiles.map((file) => {
            const isFolder = file.type === "folder";
            return (
              <Card
                key={file.id}
                onClick={() => {
                  if (isFolder) setCurrentFolder(file.name);
                }}
                className="group border border-white/5 hover:border-white/10 bg-[#111318] p-4 flex flex-col justify-between items-center text-center cursor-pointer hover:shadow-xl transition-all h-40 select-none relative"
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  {isFolder ? (
                    <Folder className="w-10 h-10 text-secondary group-hover:scale-105 transition-transform" />
                  ) : (
                    <File className="w-10 h-10 text-primary group-hover:scale-105 transition-transform" />
                  )}
                  
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block max-w-[130px] truncate">
                      {file.name}
                    </span>
                    {!isFolder && file.size && (
                      <span className="text-[10px] text-text-secondary block font-mono">{file.size}</span>
                    )}
                  </div>
                </div>

                {/* Hover Delete Action for Files */}
                {!isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.name);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 border border-white/5 rounded hover:bg-danger/10 hover:text-danger text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </Card>
            );
          })
        )}
      </div>
      
    </div>
  );
};
export default FilesView;
