import parse from "node-html-parser";
import { LiveLesson } from './interfaces/liveLesson'
import { Recording } from './interfaces/recording'
import { ifError } from 'node:assert'
import { Class, ClassTool, PopulatedClass } from './interfaces/populatedClass'


class Classes {
	constructor() {
		this.data = null
	}
	getById(id: string){
		if (!this.data) throw new Error("Can't find lesson.")
		let data = this.data.find(value => value.id === id)
		if (!data) throw new Error("Can't find lesson.")
		return data
	}
	getByShortCode(code: string){
		if (!this.data) throw new Error("Can't find lesson.")
		let data = this.data.find(value => value.shortCode === code)
		if (!data) throw new Error("Can't find lesson.")
		return data
	}
	data: Class[] | null
}
export class Sakai {
	constructor(email: string, password: string) {
		this.email = email
		this.password = password
		setInterval(async ()=>{
			if (!this.cookie) return
			await fetch("https://online.deu.edu.tr/portal", {
				"headers": {
					"cookie": this.cookie,
				},
				"method": "GET"
			})
		}, 60000)
	}
	private readonly email: string
	private readonly password: string
	cookie: string | null = null
	userId: string | undefined
	classes = new Classes()
	private async getNewCookie(){
		let data = await fetch("https://online.deu.edu.tr/portal/site", {
			"referrerPolicy": "strict-origin-when-cross-origin",
			"method": "GET"
		});
		let cookie = data.headers.get("set-cookie")
		if(!cookie) throw new Error("No cookies found.")
		this.cookie = cookie
		return cookie
	}
	async getUserId(){
		let data = await fetch("https://online.deu.edu.tr/direct/session/current.json?auto=true", {
			"headers": {
				"accept": "application/json, text/javascript, */*; q=0.01",
				"accept-language": "en-US,en;q=0.9",
				"sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Opera GX\";v=\"107\", \"Chromium\";v=\"121\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": this.cookie as string,
				"Referer": "https://online.deu.edu.tr/portal",
				"Referrer-Policy": "no-referrer-when-downgrade"
			},
			"body": null,
			"method": "GET"
		});
		console.log(await data.json())
	}
	async login(){
		await this.getNewCookie()
		let response = await fetch("https://online.deu.edu.tr/portal/xlogin", {
			"headers": {
				"content-type": "application/x-www-form-urlencoded",
				"cookie": this.cookie as string,
			},
			"body": `eid=${encodeURIComponent(this.email)}` +
				"&" +
				`pw=${encodeURIComponent(this.password)}` +
				"&" +
				`submit=${encodeURIComponent("Giriş")}`,
			"method": "POST"
		});
		let html = parse(await response.text())
		let scr = html.querySelector("script")
		if(!scr) throw new Error("No script tag.")
		this.userId = eval(`${scr.innerText}\nportal`).user.id
		this.classes.data = html.querySelectorAll("ul.otherSitesCategorList li.fav-sites-entry").map(value => {
			let title = value.querySelector("div.fav-title a")?.getAttribute("title")
			let id = value.querySelector("a.site-favorite-btn")?.getAttribute("data-site-id")
			if (!id || !title) return null
			let shortCode = title.match(/[A-ZİĞÇŞ]{3} [0-9]{1,4}/)
			if (!shortCode) throw new Error(`Cannot parse ${title}`)
			return {
				id,
				title,
				shortCode: shortCode[0]
			}
		}).filter(value => value) as {id: string, title: string, shortCode: string}[]

		if (response.status === 200 || response.status === 302) return
		else throw new Error(response.statusText)
	}
	async getLiveLessons(targetClass: Class): Promise<LiveLesson[]>{
		if (!this.cookie) throw new Error("Not logged in.")
		let data = await fetch(`https://online.deu.edu.tr/direct/bbb-tool.json?siteId=${targetClass.id}`, {
			"headers": {
				"cookie": this.cookie,
			},
			"method": "GET"
		});
		let result = await data.json()
		if (result['bbb-tool_collection'] === undefined) throw new Error("Could not get a proper response.")
		return result['bbb-tool_collection']
	}
	async getRecordings(targetLesson: LiveLesson){
		if (!this.cookie) throw new Error("Not logged in.")
		let data = await fetch(`https://online.deu.edu.tr/direct/bbb-tool/${targetLesson.id}/getRecordings.json`, {
			"headers": {
				"cookie": this.cookie,
			},
			"method": "GET"
		});
		let jsonData = await data.json() as {returncode: string, recordings: Recording[]}
		if (jsonData.returncode !== "SUCCESS") throw new Error("Error occured while getting recordings.")
		return jsonData.recordings
	}
	async populateClass(targetClass: Class): Promise<PopulatedClass>{
		if (!this.cookie) throw new Error("Not logged in.")
		let data = await fetch(`https://online.deu.edu.tr/direct/site/${targetClass.id}/pages.json`, {
			headers: {
				cookie: this.cookie
			},
			method: "GET"
		})
		let tools = JSON.parse(await data.text()) as ClassTool[]
		return {
			tools,...targetClass
		}
	}
}