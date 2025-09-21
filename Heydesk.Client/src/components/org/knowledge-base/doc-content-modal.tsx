import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  GlobeIcon,
  TypeIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { type Document, DocumentType } from "@/lib/types/document";

interface DocContentModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getDocumentTypeIcon = (type: DocumentType) => {
  switch (type) {
    case DocumentType.Url:
      return <GlobeIcon size={16} />;
    case DocumentType.Document:
      return <FileTextIcon size={16} />;
    case DocumentType.Text:
      return <TypeIcon size={16} />;
    default:
      return null;
  }
};

const extractWebsiteName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function DocContentModal({
  document,
  open,
  onOpenChange,
}: DocContentModalProps) {
  if (!document) return null;

  const displayName =
    document.type === DocumentType.Url && document.sourceUrl
      ? extractWebsiteName(document.sourceUrl)
      : document.name;

  const hasContent = document.content && document.content.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            {getDocumentTypeIcon(document.type)}
            <DialogTitle className="text-lg font-semibold truncate">
              {displayName}
            </DialogTitle>
            <Badge variant="outline">{document.type}</Badge>
          </div>

          {document.sourceUrl && document.type === DocumentType.Url && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Source:</span>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-600 hover:text-blue-800"
                onClick={() => window.open(document.sourceUrl!, "_blank")}
              >
                {document.sourceUrl}
                <ExternalLinkIcon size={14} className="ml-1" />
              </Button>
            </div>
          )}

          <DialogDescription className="text-sm text-muted-foreground">
            {hasContent
              ? "Extracted content from the document"
              : "No content available for this document"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {hasContent ? (
            <div className="h-full overflow-y-auto pr-2">
              <div className="prose prose-sm max-w-none">
                <Streamdown>{document.content}</Streamdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-center">
              <div className="text-muted-foreground">
                <FileTextIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No content available</p>
                <p className="text-xs mt-1">
                  {document.type === DocumentType.Url
                    ? "Content may not have been extracted yet or the URL may not be accessible"
                    : "Document content is not available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
