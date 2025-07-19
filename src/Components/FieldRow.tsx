import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trash2, Plus } from "lucide-react";

// Schema field interface
export interface SchemaField {
  id: string;
  name: string;
  type:
    | "string"
    | "number"
    | "float"
    | "boolean"
    | "array"
    | "nested"
    | "object id";
  arrayItemType?: "string" | "number" | "float" | "boolean" | "nested";
  children?: SchemaField[];
}

interface FieldRowProps {
  field: SchemaField;
  onUpdate: (id: string, updates: Partial<SchemaField>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  depth: number;
  FieldListComponent?: React.FC<any>; // For recursion
}

// Component to render a single field row
export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  onUpdate,
  onDelete,
  onAddChild,
  depth,
  FieldListComponent,
}) => {
  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-3 border rounded-lg bg-card"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        {/* Field Name Input */}
        <Input
          placeholder="Field name"
          value={field.name}
          onChange={(e) => onUpdate(field.id, { name: e.target.value })}
          className="flex-1 min-w-0"
        />

        {/* Field Type Selector */}
        <Select
          value={field.type}
          onValueChange={(value) => {
            const updates: Partial<SchemaField> = {
              type: value as SchemaField["type"],
            };
            if (value === "nested") {
              updates.children = [];
              updates.arrayItemType = undefined;
            } else if (value === "array") {
              updates.children = undefined;
              updates.arrayItemType = "string";
            } else {
              updates.children = undefined;
              updates.arrayItemType = undefined;
            }
            onUpdate(field.id, updates);
          }}
        >
          <SelectTrigger className="w-24 sm:w-32" style={{ backgroundColor: "#f9f9f9", color: "#1a1a1a" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="float">Float</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="array">Array</SelectItem>
            <SelectItem value="nested">Nested</SelectItem>
            <SelectItem value="object id">Object ID</SelectItem>
          </SelectContent>
        </Select>

        {/* Array Item Type Selector */}
        {field.type === "array" && (
          <>
            <Select
              value={field.arrayItemType || "string"}
              onValueChange={(value) => {
                const updates: Partial<SchemaField> = {
                  arrayItemType: value as any,
                };
                if (value === "nested") updates.children = [];
                else updates.children = undefined;
                onUpdate(field.id, updates);
              }}
            >
              <SelectTrigger className="w-20 sm:w-24" style={{ backgroundColor: "#f9f9f9", color: "#1a1a1a" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="float">Float</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="nested">Nested</SelectItem>
              </SelectContent>
            </Select>

            {/* Add child button for nested arrays */}
            {field.arrayItemType === "nested" && (
              <Button
                style={{ backgroundColor: "#f9f9f9", color: "#1a1a1a" }}
                size="sm"
                variant="outline"
                onClick={() => onAddChild(field.id)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {/* Add child button for nested objects */}
        {field.type === "nested" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddChild(field.id)}
            className="h-8 w-8 p-0"
            style={{ backgroundColor: "#f9f9f9", color: "#1a1a1a" }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Delete field button */}
        <Button
          size="sm"
          onClick={() => onDelete(field.id)}
          style={{ backgroundColor: "#f9f9f9" }}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Render children recursively */}
      {(field.children?.length ?? 0) > 0 && FieldListComponent && (
        <FieldListComponent
          fields={field.children!}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild}
          depth={depth + 1}
        />
      )}
    </div>
  );
};
