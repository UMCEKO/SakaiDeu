import parse from 'node-html-parser'
import { LiveLesson } from './interfaces/liveLesson'
import { Recording } from './interfaces/recording'
import { Class } from './classes/class'

class Classes {
	constructor() {
		this.data = null
	}
	getById(id: string) {
		if (!this.data) throw new Error("Can't find lesson.")
		let data = this.data.find((value) => value.id === id)
		if (!data) throw new Error("Can't find lesson.")
		return data
	}
	getByShortCode(code: string) {
		if (!this.data) throw new Error("Can't find lesson.")
		let data = this.data.find((value) => value.shortCode === code)
		if (!data) throw new Error("Can't find lesson.")
		return data
	}
	data: Class[] | null
}
export class Sakai {
	constructor(email: string, password: string) {
		this.email = email
		this.password = password
		setInterval(async () => {
			if (!this.cookie) return
			await fetch('https://online.deu.edu.tr/portal', {
				headers: {
					cookie: this.cookie,
				},
				method: 'GET',
			})
		}, 60000)
	}
	private readonly email: string
	private readonly password: string
	cookie: string | null = null
	userId: string | undefined
	classes = new Classes()

	private async getNewCookie() {
		let data = await fetch('https://online.deu.edu.tr/portal/site', {
			referrerPolicy: 'strict-origin-when-cross-origin',
			method: 'GET',
		})
		let cookie = data.headers.get('set-cookie')
		if (!cookie) throw new Error('No cookies found.')
		this.cookie = cookie
		return cookie
	}
	async login() {
		await this.getNewCookie()
		let response = await fetch('https://online.deu.edu.tr/portal/xlogin', {
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				cookie: this.cookie as string,
			},
			body:
				`eid=${encodeURIComponent(this.email)}` +
				'&' +
				`pw=${encodeURIComponent(this.password)}` +
				'&' +
				`submit=${encodeURIComponent('Giriş')}`,
			method: 'POST',
		})
		let html = parse(await response.text())
		let scr = html.querySelector('script')
		if (!scr) throw new Error('No script tag.')
		this.userId = eval(`${scr.innerText}\nportal`).user.id
		let classEls =  html
			.querySelectorAll('ul.otherSitesCategorList li.fav-sites-entry')
		this.classes.data =  classEls.map((value) => {
				let title = value.querySelector('div.fav-title a')?.getAttribute('title')
				let id = value.querySelector('a.site-favorite-btn')?.getAttribute('data-site-id')
				if (!id || !title) return null

				return new Class(id, title, this)
			})
			.filter((value) => value) as Class[]

		if (response.status === 200 || response.status === 302) return
		else throw new Error(response.statusText)
	}
}
