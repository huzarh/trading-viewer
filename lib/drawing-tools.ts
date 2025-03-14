export type DrawingToolType =
  | "trendline"
  | "horizontalline"
  | "verticalline"
  | "rectangle"
  | "fibonacci"
  | "buyposition"
  | "sellposition"
  | "text"
  | "measure"

export interface Point {
  x: number
  y: number
}

export interface BaseDrawing {
  id: string
  type: DrawingToolType
  color: string
}

export interface LineDrawing extends BaseDrawing {
  type: "trendline" | "horizontalline" | "verticalline"
  start: Point
  end: Point
}

export interface RectangleDrawing extends BaseDrawing {
  type: "rectangle"
  start: Point
  end: Point
}

export interface FibonacciDrawing extends BaseDrawing {
  type: "fibonacci"
  start: Point
  end: Point
  levels: number[]
}

export interface PositionDrawing extends BaseDrawing {
  type: "buyposition" | "sellposition"
  point: Point
  price: number
  size: number
  timestamp: number
}

export type Drawing = LineDrawing | RectangleDrawing | FibonacciDrawing | PositionDrawing

export const DEFAULT_FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

export const DRAWING_COLORS = {
  trendline: "#ff0000",
  horizontalline: "#3498db",
  verticalline: "#2ecc71",
  rectangle: "#9b59b6",
  fibonacci: "#f39c12",
  buyposition: "#2ecc71",
  sellposition: "#e74c3c",
  text: "#ffffff",
  measure: "#ffffff",
}

export function createDrawing(type: DrawingToolType, props: any): Drawing {
  const id = Math.random().toString(36).substr(2, 9)
  const color = DRAWING_COLORS[type]

  switch (type) {
    case "trendline":
    case "horizontalline":
    case "verticalline":
      return {
        id,
        type,
        color,
        start: props.start,
        end: props.end,
      }
    case "rectangle":
      return {
        id,
        type,
        color,
        start: props.start,
        end: props.end,
      }
    case "fibonacci":
      return {
        id,
        type,
        color,
        start: props.start,
        end: props.end,
        levels: DEFAULT_FIBONACCI_LEVELS,
      }
    case "buyposition":
    case "sellposition":
      return {
        id,
        type,
        color,
        point: props.point,
        price: props.price,
        size: props.size || 1,
        timestamp: props.timestamp,
      }
    default:
      throw new Error(`Unknown drawing tool type: ${type}`)
  }
}

