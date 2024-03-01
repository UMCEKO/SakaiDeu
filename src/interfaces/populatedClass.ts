export interface PopulatedClass extends Class{
	tools: ClassTool[]
}
export interface Class {
	id: string,
	title: string,
	shortCode: string
}
export interface ClassTool {
	layout: number
	toolpopupurl?: string
	toolpopup: boolean
	layoutTitle: string
	skin: string
	siteId: string
	id: string
	position: number
	title: string
	tools: Tool[]
	url: string
}

export interface Tool {
	toolId: string
	pageOrder: number
	placementId: string
	context: string
	description: string
	siteId: string
	id: string
	title: string
	pageId: string
	url: string
	home: any
}
