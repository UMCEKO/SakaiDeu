import puppeteer, { ElementHandle } from 'puppeteer'
import { configDotenv } from 'dotenv'
import * as path from 'path'
configDotenv({
	path: path.join(__dirname, "../.env")
})


async function main(){
	const browser = await puppeteer.launch({
		executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		headless: false,
		args: [
			'--disable-web-security',
			'--disable-features=IsolateOrigins,site-per-process'
		]
	})
	let page = await browser.newPage()
	await page.goto("https://online.deu.edu.tr/portal")
	let mailBox = await page.waitForSelector("#eid")
	let passwordBox = await page.waitForSelector('#pw')
	let submitBtn = await page.waitForSelector('#submit')
	if (!mailBox || ! passwordBox || !submitBtn) return
	await mailBox.type(process.env["MAIL"] || "")
	await passwordBox.type(process.env["PASSWORD"] || "")
	await submitBtn.click()
	await page.waitForSelector('#loginLinks')
	await page.goto('https://online.deu.edu.tr/portal/site/e5126028-edf6-4007-8fe9-8546e8b20ed7/tool/8dedcbe4-5f2a-4e48-947d-915f40705c77')
	await page.waitForSelector('#bbb_meeting_table_paginate span a')
	let pageSelectorBar = await page.$$('#bbb_meeting_table_paginate span a')
	let allLiveClasses: {
		className: string,
		classStatus: string,
		joinOpenDate: string,
		joinClosedDate: string,
		createdBy: string,
		recordings: undefined
	}[] = []

	for (let pageIndex in pageSelectorBar){
		let pageSelectButton = await page.waitForSelector(`#bbb_meeting_table_paginate span a:nth-child(${Number(pageIndex)+1})`)
		await pageSelectButton?.click()
		let classesArrPtr = await page.$$('#bbb_meeting_table tbody tr')
		let onlineClass: ElementHandle<HTMLAnchorElement> | undefined =  undefined
		for (let ptr of classesArrPtr){
			let onlineElement = await ptr.$('td a')
			if (onlineElement) onlineClass = onlineElement
		}
		if (onlineClass){
			await onlineClass.click()
			// let statusEl = await page.waitForSelector('#bbb_meeting_info_table tbody:nth-child(5):nth-child(2)')
			let joinMeetingLink = await page.waitForSelector('#joinMeetingLink')
			await joinMeetingLink?.click()
		}
		// let classesArrPromise = classesArrPtr.map(async tr => {
		// 	let meetingsField = await tr.$('td:nth-child(1) span')
		// 	let statusField = await tr.$('td:nth-child(2)')
		// 	let jodField = await tr.$('td:nth-child(3)')
		// 	let jcdField = await tr.$('td:nth-child(4)')
		// 	let createdByField =  await tr.$('td:nth-child(5)')
		// 	let actionField = await tr.$('td:nth-child(6)')
		// 	if (meetingsField && statusField && jcdField && jodField && createdByField)
		// 	return {
		// 		className: await meetingsField.frame.content(),
		// 		classStatus: await statusField.frame.content(),
		// 		joinOpenDate: await jodField.frame.content(),
		// 		joinClosedDate: await jcdField.frame.content(),
		// 		createdBy: await createdByField.frame.content(),
		// 		recordings: undefined
		// 	}
		// 	else{
		// 		console.log({meetingsField, statusField, jcdField, jodField, createdByField})
		// 		throw 'e'
		// 	}
		// })
		// let classesArr = await Promise.all(classesArrPromise)
		// allLiveClasses.push(...classesArr)
	}
	// await browser.close()
}

main()