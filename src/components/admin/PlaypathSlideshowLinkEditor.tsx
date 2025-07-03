
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlaypathSlideshow } from "@/hooks/usePlaypathSlideshows";

interface PlaypathSlideshowLinkEditorProps {
  slide: PlaypathSlideshow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: { link_type: 'external' | 'internal' | 'none'; link_url?: string; internal_path?: string }) => void;
}

const PlaypathSlideshowLinkEditor = ({ slide, isOpen, onClose, onSave }: PlaypathSlideshowLinkEditorProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PlayPath Slideshow Deprecated</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            PlayPath slideshows are no longer supported. Please use the Hero Slideshow section in Shop Sections instead.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaypathSlideshowLinkEditor;
