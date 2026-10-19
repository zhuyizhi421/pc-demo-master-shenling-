export interface IRoleDialogProps {
  rowKey?: string
  multiple?: boolean
  selectedRoles?: { id: string; name: string }[]
  visible?: boolean
}

export interface IRoleDialogEmits {
  (event: "confirm", value: any[]): void
  (event: "update:visible", value: boolean): void
}
