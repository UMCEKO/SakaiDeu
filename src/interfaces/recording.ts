export interface Recording {
	recordID: string
	meetingID: string
	internalMeetingID: string
	name: string
	published: string
	protected: string
	state: string
	startTime: string
	endTime: string
	participants: string
	metadata: Metadata
	playback: Playback[]
	ownerId: string
}

export interface Metadata {
	context: string
	contextactivity: string
	contextid: string
	origin: string
	originservercommonname: string
	originserverurl: string
	origintag: string
	originversion: string
}

export interface Playback {
	type: string
	url: string
	length: string
}
