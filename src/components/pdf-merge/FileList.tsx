
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { FileWithPreview } from "@/types/file";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface FileListProps {
  files: FileWithPreview[];
  onDragEnd: (result: any) => void;
  moveFileUp: (index: number) => void;
  moveFileDown: (index: number) => void;
  removeFile: (index: number) => void;
  onMerge: () => void;
  isProcessing: boolean;
}

export function FileList({
  files,
  onDragEnd,
  moveFileUp,
  moveFileDown,
  removeFile,
  onMerge,
  isProcessing
}: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="pdf-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {files.map((file, index) => (
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
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveFileUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveFileDown(index)}
                          disabled={index === files.length - 1}
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
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {files.length > 0 && (
        <div className="mt-4">
          <Button
            className="w-full"
            disabled={isProcessing || files.length < 2}
            onClick={onMerge}
          >
            {isProcessing ? (
              "Processando..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Juntar PDFs e Baixar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Add the missing Download icon import
import { Download } from "lucide-react";
