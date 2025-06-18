"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Subtitle } from "@/lib/types";
import { toast } from "sonner";

import Scrollbars from "react-scrollbars-custom";

interface SubtitlePreviewModalProps {
  subtitle: Subtitle | null;
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
}

export function SubtitlePreviewModal({
  subtitle,
  isOpen,
  onClose,
  jobTitle,
}: SubtitlePreviewModalProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const minLineLength = 31;
  const maxLineLength = 100;

  const handleShowMore = () => {
    setShowFullContent(true);
  };

  const handleShowLess = () => {
    setShowFullContent(false);
  };

  const handleDownload = () => {
    if (!subtitle) return;

    const filename = `${jobTitle}_${
      subtitle.language
    }.${subtitle.format.toLowerCase()}`;
    const blob = new Blob([subtitle.content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Subtitle downloaded");
  };

  if (!subtitle) return null;

  // Parse SRT content for better display
  const formatSubtitleContent = (content: string) => {
    const lines =
      content.split("\n").length > maxLineLength
        ? content.split("\n").slice(0, maxLineLength)
        : content.split("\n");

    console.log("Formatted lines:", lines.length);
    const displayMin = lines.slice(0, minLineLength);
    const displayMax = lines;

    return (
      <div className="space-y-3">
        {/* Botões de controle acima da caixa */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {content.split("\n").length} lines total
          </span>
          <div className="flex items-center space-x-2">
            {!showFullContent && (
              <Button variant="outline" size="sm" onClick={handleShowMore}>
                Show More ({maxLineLength} more lines for preview)
              </Button>
            )}
            {showFullContent && (
              <Button variant="outline" size="sm" onClick={handleShowLess}>
                Show Less
              </Button>
            )}
          </div>
        </div>

        {/* Caixa de texto com altura fixa */}
        <div className="border rounded-lg bg-muted/30">
          <Scrollbars style={{ width: "100%", height: 600 }}>
            <div className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {showFullContent
                  ? displayMax.join("\n")
                  : displayMin.join("\n")}
              </pre>
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <span>Subtitle Preview</span>
                <Badge variant="secondary">
                  {subtitle.language.toUpperCase()} - {subtitle.format}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {jobTitle} • {subtitle.content.split("\n").length} lines
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 mt-4">
          {formatSubtitleContent(subtitle.content)}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            File size:{" "}
            {subtitle.fileSize
              ? `${(subtitle.fileSize / 1024).toFixed(1)} KB`
              : "Unknown"}{" "}
            • Downloads: {subtitle.downloadCount}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubtitlePreviewModal;
