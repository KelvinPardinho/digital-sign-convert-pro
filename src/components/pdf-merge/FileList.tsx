
import React from "react";
import { FileWithPreview } from "@/types/file";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { FileItem } from "./FileItem";
import { FilesActionButton } from "./FilesActionButton";

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
                <FileItem
                  key={file.name + index}
                  file={file}
                  index={index}
                  moveFileUp={moveFileUp}
                  moveFileDown={moveFileDown}
                  removeFile={removeFile}
                  totalFiles={files.length}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {files.length > 0 && (
        <FilesActionButton 
          onMerge={onMerge} 
          isProcessing={isProcessing} 
          disabled={files.length < 2}
        />
      )}
    </div>
  );
}
