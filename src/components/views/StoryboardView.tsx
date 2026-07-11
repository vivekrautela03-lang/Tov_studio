"use client";

import React, { useState } from "react";
import { useProjectStore, StoryboardShot } from "@/store/useProjectStore";
import { Plus, MoveLeft, MoveRight, CheckCircle2, RotateCcw, AlertCircle, Camera, Lightbulb, Edit2, Trash2, UploadCloud, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { motion, LayoutGroup } from "framer-motion";

interface StoryboardViewProps {
  projectScope?: string;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({ projectScope }) => {
  const {
    activeProjectId,
    storyboards,
    addStoryboardShot,
    updateStoryboardOrder,
    updateStoryboardShotStatus,
    deleteStoryboardShot,
    updateStoryboardShot
  } = useProjectStore();

  const targetProjectId = projectScope || activeProjectId;
  const projectShots = storyboards[targetProjectId] || [];

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editShotData, setEditShotData] = useState<StoryboardShot | null>(null);

  const [newShot, setNewShot] = useState({
    shotNumber: "",
    previewImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
    shotType: "Medium Close Up (MCU)",
    lens: "50mm Prime",
    camera: "ARRI Alexa 35",
    lighting: "Ambient soft key",
    notes: "",
    status: "Draft" as StoryboardShot["status"]
  });

  const handleDeleteShot = async (shotId: string) => {
    if (!confirm("Are you sure you want to delete this storyboard shot block?")) return;
    await deleteStoryboardShot(targetProjectId, shotId);
  };

  const openEditModal = (shot: StoryboardShot) => {
    setEditShotData({ ...shot });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShotData) return;
    await updateStoryboardShot(targetProjectId, editShotData.id, editShotData);
    setIsEditOpen(false);
    setEditShotData(null);
  };

  const handleShotImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditShotData((prev) => prev ? { ...prev, previewImage: reader.result as string } : null);
      } else {
        setNewShot((prev) => ({ ...prev, previewImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShot.shotNumber.trim()) return;
    addStoryboardShot(targetProjectId, newShot);
    setIsAddOpen(false);
    // Reset
    setNewShot({
      shotNumber: "",
      previewImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
      shotType: "Medium Close Up (MCU)",
      lens: "50mm Prime",
      camera: "ARRI Alexa 35",
      lighting: "Ambient soft key",
      notes: "",
      status: "Draft"
    });
  };

  // Reorder simulation actions
  const moveShot = (index: number, direction: "left" | "right") => {
    const nextIndex = direction === "left" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= projectShots.length) return;

    const reorderedShots = [...projectShots];
    const temp = reorderedShots[index];
    reorderedShots[index] = reorderedShots[nextIndex];
    reorderedShots[nextIndex] = temp;

    updateStoryboardOrder(targetProjectId, reorderedShots);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white">Cinematic Storyboards</h3>
          <span className="text-[10px] text-text-secondary mt-0.5 block">
            {projectShots.length} shots defined for this sequence
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Storyboard Shot</span>
        </Button>
      </div>

      {/* Grid of Shots with LayoutGroup for smooth layout transitions */}
      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectShots.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
              No storyboard cards added yet. Click Add Storyboard Shot to start.
            </div>
          ) : (
            projectShots.map((shot, idx) => {
              return (
                <motion.div
                  key={shot.id}
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <Card className="group relative overflow-hidden border border-white/5 hover:border-primary/20 bg-[#111318] flex flex-col justify-between h-full">
                    {/* Sketch/Preview Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={shot.previewImage}
                        alt={`Shot ${shot.shotNumber}`}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      
                      {/* Shot code Tag */}
                      <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-white select-none">
                        Shot {shot.shotNumber}
                      </span>

                      {/* Edit/Delete Actions overlay */}
                      <div className="absolute top-3 right-3 flex gap-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(shot);
                          }}
                          className="p-1 bg-black/80 hover:bg-primary/20 border border-white/10 hover:border-primary/30 text-text-secondary hover:text-primary rounded cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShot(shot.id);
                          }}
                          className="p-1 bg-black/80 hover:bg-danger/20 border border-white/10 hover:border-danger/30 text-text-secondary hover:text-danger rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reordering Controls Overlaid */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => moveShot(idx, "left")}
                          className="h-8 w-8 rounded-full cursor-pointer disabled:opacity-30"
                        >
                          <MoveLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-[10px] font-mono text-white select-none bg-black/40 px-2 py-1 rounded">Shift Order</span>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={idx === projectShots.length - 1}
                          onClick={() => moveShot(idx, "right")}
                          className="h-8 w-8 rounded-full cursor-pointer disabled:opacity-30"
                        >
                          <MoveRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Metadata & Status */}
                    <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white tracking-tight">{shot.shotType}</span>
                          
                          {/* Quick Toggle Status */}
                          <button
                            onClick={() => {
                              const order: StoryboardShot["status"][] = ["Draft", "Approved", "Revision"];
                              const currIdx = order.indexOf(shot.status);
                              const nextStatus = order[(currIdx + 1) % order.length];
                              updateStoryboardShotStatus(targetProjectId, shot.id, nextStatus);
                            }}
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              shot.status === "Approved" ? "bg-success/20 text-success" :
                              shot.status === "Revision" ? "bg-danger/20 text-danger" : "bg-white/10 text-text-secondary"
                            }`}
                          >
                            {shot.status}
                          </button>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                          {shot.notes || "No production details specified for this storyboard block."}
                        </p>
                      </div>

                      {/* Technical Spec List */}
                      <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-[10px] text-text-secondary font-mono">
                        <div className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">{shot.lens}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0" />
                          <span className="truncate">{shot.lighting.split(",")[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </LayoutGroup>

      {/* ADD SHOT DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Storyboard Shot Block"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Shot Number</label>
              <input
                type="text"
                required
                placeholder="e.g., 2A"
                value={newShot.shotNumber}
                onChange={(e) => setNewShot({ ...newShot, shotNumber: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-white mb-1.5">Shot Type / Angle</label>
              <select
                value={newShot.shotType}
                onChange={(e) => setNewShot({ ...newShot, shotType: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              >
                <option value="Extreme Wide Shot (EWS)">Extreme Wide Shot (EWS)</option>
                <option value="Wide Shot (WS)">Wide Shot (WS)</option>
                <option value="Medium Shot (MS)">Medium Shot (MS)</option>
                <option value="Medium Close Up (MCU)">Medium Close Up (MCU)</option>
                <option value="Close Up (CU)">Close Up (CU)</option>
                <option value="Extreme Close Up (ECU)">Extreme Close Up (ECU)</option>
                <option value="Over the Shoulder (OTS)">Over the Shoulder (OTS)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Camera Focal Lens</label>
              <input
                type="text"
                value={newShot.lens}
                placeholder="e.g., 35mm Anamorphic"
                onChange={(e) => setNewShot({ ...newShot, lens: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Lighting Environment</label>
              <input
                type="text"
                value={newShot.lighting}
                placeholder="e.g., Cool fill, warm key rim"
                onChange={(e) => setNewShot({ ...newShot, lighting: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Storyboard Frame / Sketch File</label>
            <div className="flex items-center gap-3 py-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
              <img
                src={newShot.previewImage}
                className="w-16 h-10 object-cover border border-white/10 rounded shrink-0"
                alt="Frame Preview"
              />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleShotImageUpload(e, false)}
                  className="hidden"
                  id="shot-add-image"
                />
                <label
                  htmlFor="shot-add-image"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-primary" />
                  <span>Upload Drawing</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Production Notes</label>
            <textarea
              rows={3}
              placeholder="e.g., Track camera at eye level on dolly tracks..."
              value={newShot.notes}
              onChange={(e) => setNewShot({ ...newShot, notes: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Storyboard
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT SHOT DIALOG */}
      {isEditOpen && editShotData && (
        <Dialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditShotData(null);
          }}
          title={`Configure Storyboard Shot Block ${editShotData.shotNumber}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">Shot Number</label>
                <input
                  type="text"
                  required
                  value={editShotData.shotNumber}
                  onChange={(e) => setEditShotData({ ...editShotData, shotNumber: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-white mb-1.5">Shot Type / Angle</label>
                <select
                  value={editShotData.shotType}
                  onChange={(e) => setEditShotData({ ...editShotData, shotType: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                >
                  <option value="Extreme Wide Shot (EWS)">Extreme Wide Shot (EWS)</option>
                  <option value="Wide Shot (WS)">Wide Shot (WS)</option>
                  <option value="Medium Shot (MS)">Medium Shot (MS)</option>
                  <option value="Medium Close Up (MCU)">Medium Close Up (MCU)</option>
                  <option value="Close Up (CU)">Close Up (CU)</option>
                  <option value="Extreme Close Up (ECU)">Extreme Close Up (ECU)</option>
                  <option value="Over the Shoulder (OTS)">Over the Shoulder (OTS)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">Camera Focal Lens</label>
                <input
                  type="text"
                  value={editShotData.lens}
                  onChange={(e) => setEditShotData({ ...editShotData, lens: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">Lighting Environment</label>
                <input
                  type="text"
                  value={editShotData.lighting}
                  onChange={(e) => setEditShotData({ ...editShotData, lighting: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Storyboard Frame / Sketch File</label>
              <div className="flex items-center gap-3 py-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <img
                  src={editShotData.previewImage}
                  className="w-16 h-10 object-cover border border-white/10 rounded shrink-0"
                  alt="Frame Preview"
                />
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleShotImageUpload(e, true)}
                    className="hidden"
                    id="shot-edit-image"
                  />
                  <label
                    htmlFor="shot-edit-image"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                    <span>Upload Drawing</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Production Notes</label>
              <textarea
                rows={3}
                value={editShotData.notes}
                onChange={(e) => setEditShotData({ ...editShotData, notes: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditShotData(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog>
      )}

    </div>
  );
};
export default StoryboardView;
