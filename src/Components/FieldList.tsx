import React from "react"
import { FieldRow, type SchemaField } from "./FieldRow"

// Props for FieldList component
type FieldListProps = {
  fields: SchemaField[]                             // List of fields at current level
  onUpdate: (id: string, updates: Partial<SchemaField>) => void // Callback to update a field
  onDelete: (id: string) => void                    // Callback to delete a field
  onAddChild: (parentId: string) => void           // Callback to add a nested field
  depth?: number                                   // Current depth level for nesting (optional)
}

// Recursive field list renderer
export const FieldList: React.FC<FieldListProps> = ({
  fields,
  onUpdate,
  onDelete,
  onAddChild,
  depth = 0, // default to root level
}) => (
  <>
    {fields.map((field) => (
      <FieldRow
        key={field.id}
        field={field}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddChild={onAddChild}
        depth={depth}
        FieldListComponent={FieldList} // Pass self for recursive nesting
      />
    ))}
  </>
)
