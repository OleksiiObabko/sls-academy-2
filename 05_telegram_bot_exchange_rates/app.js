#! /usr/bin/env node
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const NodeCache = require("node-cache");

const botToken = process.env.BOTTOKEN || "botToken";

const bot = new TelegramBot(botToken, {polling: true});
const cache = new NodeCache();

const privateBankUrl = "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5";
const monoBankUrl = "https://api.monobank.ua/bank/currency";

bot.on("message", async msg => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === "/start") {
		await bot.sendMessage(
			chatId,
			"Wellcome",
			{
				reply_markup: {
					inline_keyboard: [
						[{text: "Exchange Rates", callback_data: "exchange rates"}]
					]
				},
			}
		);
	}
});

bot.on("callback_query", async (msg) => {
	const chatId = msg.message.chat.id;
	const messageId = msg.message.message_id;
	const callbackData = msg.data;
	const callbackId = msg.id;

	if (callbackData === "exchange rates") {
		await bot.editMessageText("Choose currency", {
			message_id: messageId,
			chat_id: chatId,
			reply_markup: {
				inline_keyboard: [
					[{text: "USD", callback_data: "USD"}, {text: "EUR", callback_data: "EUR"}],
					[{text: "back", callback_data: "back"}]
				]
			}
		});

	} else if (callbackData === "USD" || callbackData === "EUR") {
		const [privateRate, monoRate] = await Promise.all([
			getPrivateUsdRate(callbackData),
			getMonoRate(callbackData)
		]);

		const message = formateMessage(privateRate, monoRate, callbackData);

		await bot.answerCallbackQuery(callbackId);
		await bot.editMessageText(message, {chat_id: chatId, message_id: messageId});

	} else if (callbackData === "back") {
		await bot.editMessageText("Wellcome", {
			message_id: messageId,
			chat_id: chatId,
			reply_markup: {
				inline_keyboard: [
					[{text: "Exchange Rates", callback_data: "exchange rates"}]
				]
			}
		});
	}
});

async function getPrivateUsdRate(currency) {
	try {
		const {data} = await axios.get(privateBankUrl);

		const rates = {};
		for (const rate of data) {
			const {ccy, buy, sale} = rate;
			rates[ccy] = {buy, sale};
		}

		return rates[currency];
	} catch (e) {
		throw new Error(`Failed to fetch PrivateBank exchange rates: ${e.response.data.errorDescription}`);
	}
}

async function getMonoRate(currency) {
	try {
		const {data} = await axios.get(monoBankUrl);

		const rates = data.reduce((accum, rate) => {
			if (rate.currencyCodeA === 840 && rate.currencyCodeB === 980) {
				accum.usdRate = {
					buy: rate.rateBuy,
					sale: rate.rateSell
				};
			} else if (rate.currencyCodeA === 978 && rate.currencyCodeB === 980) {
				accum.eurRate = {
					buy: rate.rateBuy,
					sale: rate.rateSell
				};
			}

			return accum;
		}, {});

		cache.set("monoRates", rates);

		if (currency === "USD") {
			return rates.usdRate;
		} else if (currency === "EUR") {
			return rates.eurRate;
		}
	} catch (e) {
		if (e.response.status === 429) {
			const cachedMonoUsd = cache.get("monoRates");

			if (cachedMonoUsd && currency === "USD") {
				return cachedMonoUsd.usdRate;
			} else if (cachedMonoUsd && currency === "EUR") {
				return cachedMonoUsd.eurRate;
			} else {
				return {
					buy: 0,
					sale: 0
				};
			}
		} else {
			throw new Error(`Failed to fetch MonoBank exchange rates: ${e.response.data.errorDescription}`);
		}
	}
}

function formateMessage(privateRate, monoRate, currency) {
	const formatPrice = price => Math.round(price * 100) / 100;

	return `${currency} exchange rates
	Private Bank:
	  Buy: ${formatPrice(privateRate.buy)}, Sale: ${formatPrice(privateRate.sale)}
	Mono Bank:
	  Buy: ${formatPrice(monoRate.buy)}, Sale: ${formatPrice(monoRate.sale)}`;
}
