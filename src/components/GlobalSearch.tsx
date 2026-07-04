"use client";

import React, { useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Search, Film, Users, Camera, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const GlobalSearch: React.FC = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    projects,
    activeProjectId,
    crew,
    equipment,
    files,
    setActiveView,
    setActiveProjectId,
    setActiveProjectTab
  } = useProjectStore();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  // Focus Input on Open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Search Logic
  const activeCrew = crew[activeProjectId] || [];
  const activeEquip = equipment[activeProjectId] || [];
  const activeFiles = files[activeProjectId] || [];

  const searchProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tagline.toLowerCase().includes(query.toLowerCase())
  );

  const searchCrew = activeCrew.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.role.toLowerCase().includes(query.toLowerCase())
  );

  const searchEquip = activeEquip.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase())
  );

  const searchFiles = activeFiles.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults =
    query.trim() !== "" &&
    (searchProjects.length > 0 ||
      searchCrew.length > 0 ||
      searchEquip.length > 0 ||
      searchFiles.length > 0);

  const handleResultClick = (action: () => void) => {
    action();
    setSearchOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Search Modal Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-card border border-white/5 shadow-2xl rounded-xl z-10 overflow-hidden flex flex-col max-h-[500px]"
        >
          {/* Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-white/[0.01]">
            <Search className="w-4 h-4 text-text-secondary" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search productions, crew, inventory, files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-text-secondary focus:outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-md text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Results Lists */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {!query.trim() ? (
              <div className="px-4 py-6 text-center text-xs text-text-secondary">
                Type something to search globally in <span className="text-white font-medium">TOV Studio</span>...
              </div>
            ) : !hasResults ? (
              <div className="px-4 py-8 text-center text-xs text-text-secondary">
                No matching results found for "{query}"
              </div>
            ) : (
              <div className="space-y-4">
                {/* Projects Category */}
                {searchProjects.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] font-semibold text-text-secondary uppercase tracking-widest">
                      Productions / Projects
                    </div>
                    {searchProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          handleResultClick(() => {
                            setActiveProjectId(p.id);
                            setActiveView("projects");
                          })
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left cursor-pointer transition-all"
                      >
                        <Film className="w-3.5 h-3.5 text-primary" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{p.title}</div>
                          <div className="text-[10px] text-text-secondary truncate">{p.tagline}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                          {p.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Crew Category */}
                {searchCrew.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] font-semibold text-text-secondary uppercase tracking-widest">
                      Crew Directory
                    </div>
                    {searchCrew.map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          handleResultClick(() => {
                            setActiveView("crew");
                          })
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left cursor-pointer transition-all"
                      >
                        <Users className="w-3.5 h-3.5 text-secondary" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{c.name}</div>
                          <div className="text-[10px] text-text-secondary">{c.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Equipment Category */}
                {searchEquip.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] font-semibold text-text-secondary uppercase tracking-widest">
                      Equipment Inventory
                    </div>
                    {searchEquip.map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() =>
                          handleResultClick(() => {
                            setActiveView("equipment");
                          })
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left cursor-pointer transition-all"
                      >
                        <Camera className="w-3.5 h-3.5 text-warning" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{eq.name}</div>
                          <div className="text-[10px] text-text-secondary">{eq.category} • {eq.location}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-secondary font-medium">
                          {eq.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Files Category */}
                {searchFiles.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] font-semibold text-text-secondary uppercase tracking-widest">
                      Production Files
                    </div>
                    {searchFiles.map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          handleResultClick(() => {
                            setActiveView("files");
                          })
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-success" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{f.name}</div>
                          <div className="text-[10px] text-text-secondary">{f.type === "folder" ? "Folder" : `File • ${f.size}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default GlobalSearch;
