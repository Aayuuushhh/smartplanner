'use client'

import { useEffect, useRef, useState } from "react"
import { Event } from "../app/types/types"

interface DescriptionProps {
  event: Partial<Event>
  setEvent: (
    event: Partial<Event> | ((prevEvent: Partial<Event>) => Partial<Event>)
  ) => void
}

const Description = ({ event, setEvent }: DescriptionProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const editorRef = useRef<any>(null)
  const instanceRef = useRef<any>(null)

  const parseDescriptionToOutputData = (
    description: string | undefined
  ): any => {
    if (description) {
      const isHTML = /<\/?[a-z][\s\S]*>/i.test(description)

      if (isHTML) {
        return description
      }

      try {
        const parsedData = JSON.parse(description)
        if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
          return parsedData
        }
      } catch (error) {
        console.error("Invalid JSON format:", error)
      }

      return {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: description,
            },
          },
        ],
      }
    }

    return { blocks: [] }
  }

  const initEditor = async (initialData: any) => {
    try {
      const EditorJS = (await import("@editorjs/editorjs")).default
      const Header = (await import("@editorjs/header")).default
      const List = (await import("@editorjs/list")).default
      const ChangeCase = (await import("editorjs-change-case")).default
      const Underline = (await import("@editorjs/underline")).default
      const Strikethrough = (await import("@sotaproject/strikethrough")).default
      const TextVariantTune = (await import("@editorjs/text-variant-tune")).default
      const AlignmentTuneTool = (await import("editorjs-text-alignment-blocktune")).default
      const Marker = (await import("@editorjs/marker")).default
      const InlineCode = (await import("@editorjs/inline-code")).default
      const Title = (await import("title-editorjs")).default
      const Checklist = (await import("@editorjs/checklist")).default
      const NestedList = (await import("@editorjs/nested-list")).default
      const Paragraph = (await import("@editorjs/paragraph")).default
      const Quote = (await import("@editorjs/quote")).default
      const Delimiter = (await import("@editorjs/delimiter")).default
      const Alert = (await import("editorjs-alert")).default
      const InlineImage = (await import("editorjs-inline-image")).default
      const Table = (await import("@editorjs/table")).default
      const Tooltip = (await import("editorjs-tooltip")).default

      if (instanceRef.current) {
        await instanceRef.current.destroy();
        instanceRef.current = null;
      }

      instanceRef.current = new EditorJS({
        holder: editorRef.current,
        tools: {
          header: Header,
          changeCase: {
            class: ChangeCase,
            config: {
              showLocaleOption: true,
              locale: "tr",
            },
          },
          marker: Marker,
          inlineCode: InlineCode,
          underline: Underline,
          strikethrough: Strikethrough,
          list: List,
          textVariant: TextVariantTune,
          alignmentTool: AlignmentTuneTool,
          title: Title,
          checklist: Checklist,
          nestedList: NestedList,
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          delimiter: Delimiter,
          alert: Alert,
          image: {
            class: InlineImage,
            inlineToolbar: true,
          },
          table: Table,
          tooltip: {
            class: Tooltip,
          },
        },
        tunes: ["textVariant", "alignmentTool"],
        data: typeof initialData === "object" ? initialData : undefined,
        onChange: async () => {
          await save()
        },
        onReady: () => {
          setIsEditorReady(true)
        },
      })
    } catch (error) {
      console.error('Editor initialization failed:', error)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    const initialData = parseDescriptionToOutputData(event.description)
    
    if (isMounted) {
      initEditor(initialData)
    }

    return () => {
      const cleanup = async () => {
        if (instanceRef.current && typeof instanceRef.current.destroy === 'function') {
          try {
            await instanceRef.current.destroy()
            instanceRef.current = null
          } catch (error) {
            console.error('Editor cleanup failed:', error)
          }
        }
      }
      cleanup()
    }
  }, [isMounted, event.description])

  const save = async () => {
    if (instanceRef.current) {
      try {
        const outputData = await instanceRef.current.save()
        setEvent((prevEvent) => ({
          ...prevEvent,
          description: JSON.stringify(outputData),
        }))
      } catch (error) {
        console.error("Failed to save editor data:", error)
      }
    }
  }

  return (
    <div className="relative">
      <div 
        ref={editorRef}
        className="border border-gray-300 rounded p-2 overflow-auto"
        style={{ minHeight: '200px', maxHeight: '400px' }}
      ></div>
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default Description