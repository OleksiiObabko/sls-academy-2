#! /usr/bin/env node
process.env["NTBA_FIX_350"] = 1;

const {Command} = require("commander");
const TelegramBot = require("node-telegram-bot-api");

const token = "5784820205:AAH-AqjGbG0uDyuexBB5aPE6Q45j9DmdPdo";
const chatId = "1031806045";

const program = new Command();
const bot = new TelegramBot(token);

program
	.name("telegram sender")
	.description("Simple telegram bot that can act as notes or notepad when you need to save something urgently from the console")
	.version("1.0.0");
program
	.command("message")
	.alias("m")
	.description("Send message to Telegram Bot")
	.argument("message", "Message")
	.action(sendMessage);
program
	.command("photo")
	.alias("p")
	.description("Send photo to Telegram Bot")
	.argument("path", "Path")
	.action(sendPhoto);

program.parse();

function sendMessage(message) {
	bot.sendMessage(chatId, message).then(() => {
		console.log("You successfully sent message to your bot");
		process.exit();
	});
}

function sendPhoto(path) {
	bot.sendPhoto(chatId, path).then(() => {
		console.log("You successfully sent photo to your bot");
		process.exit();
	});
}
