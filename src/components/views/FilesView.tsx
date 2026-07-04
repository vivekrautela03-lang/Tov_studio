"use client";

import React, { useState } from "react";
import { useProjectStore, FileItem } from "@/store/useProjectStore";
import { Search, Plus, Folder, File, ArrowLeft, Trash2, Calendar, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilesViewProps {
  projectScope?: string;
}

export const FilesView: React.FC<FilesViewProps> = ({ projectScope }) => {
  const { activeProjectId, files } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const projectFiles = files[targetProjectId] || [];
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Simple file filter logic:
  // If currentFolder is active, we list files that belong to that folder type, otherwise we show root folders + files.
  const displayedFiles = projectFiles.filter((file) => {
    // Basic search filtering
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    
    if (currentFolder) {
      // In a mock subfolder, display files (e.g. if currentFolder is "Scripts", show pdf/doc files)
      if (currentFolder === "Scripts") {
        return matchesSearch && (file.extension === "pdf" || file.name.includes("script") || file.name.includes("screenplay"));
      }
      if (currentFolder === "RAW Footage" || currentFolder === "Moodboards & Concept Art") {
        return matchesSearch && (file.extension === "mp4" || file.name.includes("teaser") || file.extension === "jpg");
      }
      return matchesSearch && file.type === "file";
    }
    
    // Root level: show folders and files that are not categorized inside subfolders
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
                className="group border border-white/5 hover:border-white/10 bg-[#111318] p-4 flex flex-col justify-between items-center text-center cursor-pointer hover:shadow-xl transition-all h-40 select-none"
              >
                <div className="w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                  {isFolder ? (
                    <Folder className="w-7 h-7 text-secondary group-hover:text-primary" />
                  ) : (
                    <File className="w-7 h-7 text-primary/70 group-hover:text-primary" />
                  )}
                </div>

                <div className="space-y-1 w-full">
                  <h4 className="text-[11px] font-bold text-white truncate max-w-full leading-tight">
                    {file.name}
                  </h4>
                  <p className="text-[9px] text-text-secondary">
                    {isFolder ? `Folder` : `${file.size || "120 KB"}`}
                  </p>
                </div>

                <div className="w-full flex items-center justify-between text-[9px] text-text-secondary border-t border-white/5 pt-2 font-mono">
                  <span>v{file.version}.0</span>
                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {file.modified}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
};
export default FilesView;
