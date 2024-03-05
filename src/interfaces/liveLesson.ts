export interface LiveLesson {
	attendeePassword: any
	deleted: boolean
	endDate: number
	groupSessions: boolean
	hostUrl: string
	id: string
	joinUrl: any
	meta: Meta
	moderatorPassword: any
	multipleSessionsAllowed: boolean
	name: string
	ownerDisplayName: string
	ownerId: string
	participants: Participant[]
	presentation: any
	properties: any
	props: Props
	recording: boolean
	recordingDuration: number
	recordingEmail: any
	reference: string
	siteId: string
	startDate: number
	url: null | string
	voiceBridge: number
	waitForModerator: boolean
	entityReference: string
	entityURL: string
	entityId: string
}

export interface Meta {}

export interface Participant {
	role: string
	selectionId: string
	selectionType: string
	moderator: boolean
}

export interface Props {
	calendarEventId: string
	welcomeMessage: string
}
