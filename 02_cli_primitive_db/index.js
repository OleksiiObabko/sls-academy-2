const inquirer = require("inquirer");
const fs = require("fs");

const startQuestion = [
	{
		type: "input",
		name: "name",
		message: "Enter the user's name. To cancel press ENTER:",
	}
];
const createUserQuestions = [
	{
		type: "list",
		name: "gender",
		message: "Choose your Gender:",
		choices: [
			"male",
			"female"
		]
	},
	{
		type: "number",
		name: "age",
		message: "Enter your age:"
	}
];
const searchUserQuestion = [
	{
		type: "input",
		name: "name",
		message: "Enter the user's name you wanna find in DB:"
	}
];
const isContinueQuestion = [
	{
		type: "confirm",
		name: "isContinue",
		message: "Would you to search values in DB?",
		default: false
	}
];

function createUser() {
	inquirer.prompt(startQuestion).then(({name}) => {
		if (name.trim() === "") {
			inquirer.prompt(isContinueQuestion).then(({isContinue}) => {
				isContinue ? searchUser() : console.log("Good Bye!");
			});
			return;
		}

		inquirer.prompt(createUserQuestions).then(({gender, age}) => {
			const newUser = {
				name,
				gender,
				age
			};

			const data = JSON.stringify(newUser);
			fs.appendFile("./db.txt", data + "\n", (err) => {
				if (err) throw err;
			});

			createUser();
		});
	});
}

function searchUser() {
	fs.readFile("./db.txt", "utf-8", (err, data) => {
		if (err) throw err;

		if (!data) {
			console.log("Database is empty");
			return;
		}

		const users = data.trim().split("\n");
		const jsonUsers = [];

		users.forEach(user => {
			const jsonUser = JSON.parse(user);
			jsonUsers.push(jsonUser);
		});
		console.log(jsonUsers);

		inquirer.prompt(searchUserQuestion).then(({name}) => {
			let isFound = false;

			for (const userData of jsonUsers) {
				if (userData.name.toUpperCase() === name.toUpperCase()) {
					isFound = true;
					console.log(`User ${name} was found.`);
					console.log(userData);
					break;
				}
			}

			if (!isFound) {
				console.log(`User ${name} does not exist.`);
			}
		});
	});
}

createUser();
