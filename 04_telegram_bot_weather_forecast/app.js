#! /usr/bin/env node
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// Telegram bot userName: https://t.me/nodejs_weather_bot
const botToken = process.env.BOTTOKEN || "botToken";
const apiKey = process.env.APIKEY || "apiKey";
const city = "kyiv";
const baseURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

const bot = new TelegramBot(botToken, {polling: true});

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	try {
		if (text === "/start") {
			await bot.sendMessage(
				chatId,
				"Welcome!",
				{
					reply_markup: JSON.stringify({
						inline_keyboard: [
							[{text: "Forecast in Kyiv", callback_data: "kyiv"}]
						]
					}),
				}
			);
		}
	} catch (e) {
		console.log("ERROR", e);
	}
});

bot.on("callback_query", async (msg) => {
	const chatId = msg.message.chat.id;
	const messageId = msg.message.message_id;
	const callbackData = msg.data;

	try {
		if (callbackData === "kyiv") {
			await bot.editMessageText("Choose interval", {
				chat_id: chatId,
				message_id: messageId,
				reply_markup: JSON.stringify({
					inline_keyboard: [
						[{text: "3 hours", callback_data: "3"}],
						[{text: "6 hours", callback_data: "6"}]
					]
				})
			});
		} else if (callbackData === "3" || callbackData === "6") {
			const {data} = await axios.get(baseURL);
			let weatherList = data.list;

			if (callbackData === "6") {
				weatherList = weatherList.filter((_, index) => index % 2 === 0);
			}

			const message = getFormattedForecast(weatherList);

			await bot.editMessageText(message, {
				chat_id: chatId, message_id: messageId
			});
		}
	} catch (e) {
		console.log("ERROR", e);
	}
});

function getFormattedForecast(list) {
	let forecast = "Weather in Kyiv:";
	let prevDate;

	list.forEach(item => {
		const {dt, main, weather} = item;
		const date = new Date(dt * 1000);

		const formattedDay = date.toLocaleDateString("en-US", {
			weekday: "long",
			day: "numeric",
			month: "long"
		});
		const formattedTime = date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: false
		});
		const temp = Math.round(main.temp);
		const feelsLike = Math.round(main.feels_like);
		const overview = weather[0].main;

		const message = `\n   ${formattedTime}, ${temp}°C, feels like: ${feelsLike}°C, ${overview}`;

		if (formattedDay === prevDate) {
			forecast += message;
		} else {
			forecast += `\n\n${formattedDay}:${message}`;
		}

		prevDate = formattedDay;
	});

	return forecast;
}
