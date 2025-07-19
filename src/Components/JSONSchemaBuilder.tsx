"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { FieldList } from "./FieldList"
import { type SchemaField } from "./FieldRow"

// Generate a random unique ID for each field
const generateId = () => Math.random().toString(36).substr(2, 9)

// Get default value based on type
const getDefaultValue = (type: string, arrayItemType?: string) => {
  switch (type) {
    case "string": return ""
    case "number": return 0
    case "float": return 0.0
    case "boolean": return false
    case "array":
      switch (arrayItemType) {
        case "string": return [""]
        case "number": return [0]
        case "float": return [0.0]
        case "boolean": return [false]
        case "nested": return [{}]
        default: return [""]
      }
    case "nested": return {}
    case "object id": return "ObjectId('')"
    default: return null
  }
}

// Recursively build JSON object from schema fields
const buildJsonFromSchema = (fields: SchemaField[]): any => {
  const result: any = {}
  fields.forEach((field) => {
    if (field.name.trim()) {
      if (field.type === "nested" && field.children) {
        result[field.name] = buildJsonFromSchema(field.children)
      } else if (field.type === "array") {
        if (field.arrayItemType === "nested" && field.children) {
          result[field.name] = [buildJsonFromSchema(field.children)]
        } else {
          result[field.name] = getDefaultValue(field.type, field.arrayItemType)
        }
      } else {
        result[field.name] = getDefaultValue(field.type)
      }
    }
  })
  return result
}

export default function JsonSchemaBuilder() {
  const [fields, setFields] = useState<SchemaField[]>([])

  // Update a field by ID (recursively)
  const updateField = useCallback((id: string, updates: Partial<SchemaField>) => {
    const updateFieldRecursive = (fields: SchemaField[]): SchemaField[] =>
      fields.map(field => {
        if (field.id === id) return { ...field, ...updates }
        if (field.children) return { ...field, children: updateFieldRecursive(field.children) }
        return field
      })
    setFields(updateFieldRecursive(fields))
  }, [fields])

  // Delete a field by ID (recursively)
  const deleteField = useCallback((id: string) => {
    const deleteFieldRecursive = (fields: SchemaField[]): SchemaField[] =>
      fields.filter(f => {
        if (f.id === id) return false
        if (f.children) f.children = deleteFieldRecursive(f.children)
        return true
      })
    setFields(deleteFieldRecursive(fields))
  }, [fields])

  // Add a child field to a nested or array (nested) field
  const addChildField = useCallback((parentId: string) => {
    const addChildRecursive = (fields: SchemaField[]): SchemaField[] =>
      fields.map(field => {
        if (
          field.id === parentId &&
          (field.type === "nested" || (field.type === "array" && field.arrayItemType === "nested"))
        ) {
          const newChild: SchemaField = { id: generateId(), name: "", type: "string" }
          return { ...field, children: [...(field.children || []), newChild] }
        }
        if (field.children) return { ...field, children: addChildRecursive(field.children) }
        return field
      })
    setFields(addChildRecursive(fields))
  }, [fields])

  // Add a new root-level field
  const addRootField = () => setFields([...fields, { id: generateId(), name: "", type: "string" }])

  const jsonOutput = buildJsonFromSchema(fields)

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">JSON Schema Builder</h1>
        <p className="text-muted-foreground mt-2">Create and edit JSON schemas visually with real-time preview</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Builder Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Schema Builder
              <Badge variant="secondary" className="text-xs">{fields.length} field{fields.length !== 1 ? "s" : ""}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <FieldList
                fields={fields}
                onUpdate={updateField}
                onDelete={deleteField}
                onAddChild={addChildField}
              />
            </div>
            <Button onClick={addRootField} className="w-full bg-[#1a1a1a] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </CardContent>
        </Card>

        {/* JSON Preview Panel */}
        <Card className="h-fit">
          <CardHeader><CardTitle>JSON Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              <pre className="text-sm"><code>{JSON.stringify(jsonOutput, null, 2)}</code></pre>
            </div>

            <Button
              className="mt-4 bg-[#1a1a1a] text-white"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2))
                alert("JSON copied to clipboard!")
              }}
            >
              Copy JSON to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}