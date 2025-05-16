
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { FileWithPreview } from "@/types/file";
import { Draggable } from "@hello-pangea/dnd";

interface FileItemProps {
  file: FileWithPreview;
  index: number;
  moveFileUp: (index: number) => void;
  moveFileDown: (index: number) => void;
  removeFile: (index: number) => void;
  totalFiles: number;
}

export function FileItem({
  file,
  index,
  moveFileUp,
  moveFileDown,
  removeFile,
  totalFiles
}: FileItemProps) {
  return (
    <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center gap-3 bg-muted/50 p-3 rounded-md"
        >
          <div {...provided.dragHandleProps} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <FileItemControls 
            index={index}
            moveFileUp={moveFileUp}
            moveFileDown={moveFileDown}
            isFirst={index === 0}
            isLast={index === totalFiles - 1}
            removeFile={removeFile}
          />
        </div>
      )}
    </Draggable>
  );
}

interface FileItemControlsProps {
  index: number;
  moveFileUp: (index: number) => void;
  moveFileDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  removeFile: (index: number) => void;
}

function FileItemControls({
  index,
  moveFileUp,
  moveFileDown,
  isFirst,
  isLast,
  removeFile
}: FileItemControlsProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => moveFileUp(index)}
          disabled={isFirst}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => moveFileDown(index)}
          disabled={isLast}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => removeFile(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  );
}
