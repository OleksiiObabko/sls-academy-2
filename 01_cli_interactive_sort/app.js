const readline = require("readline");

function sortAlphabetically(symbols) {
	const words = symbols.filter(symbol => isNaN(symbol));
	words.sort();
	console.log(words);
	dataInput();
}

function sortFromSmallest(symbols) {
	const digits = symbols.filter(symbol => !isNaN(symbol));
	digits.sort((a, b) => a - b);
	console.log(digits);
	dataInput();
}

function sortFromBiggest(symbols) {
	const digits = symbols.filter(symbol => !isNaN(symbol));
	digits.sort((a, b) => b - a);
	console.log(digits);
	dataInput();
}

function sortByLength(words) {
	words.sort((a, b) => a.length - b.length);
	console.log(words);
	dataInput();
}

function showUniqueWords(symbols) {
	const words = symbols.filter(symbol => isNaN(symbol));
	const uniqueWords = [...new Set(words)];
	console.log(uniqueWords);
	dataInput();
}

function showUniqueSymbols(symbols) {
	const uniqueSymbols = [...new Set(symbols)];
	console.log(uniqueSymbols);
	dataInput();
}

const rl = readline.createInterface(process.stdin, process.stdout);

function dataInput() {
	rl.question("Hello. Enter some words or digits dividing them in spaces: ", input => {
		console.log();
		sortTypeInput(input);
	});
}

function sortTypeInput(input) {
	const userData = input.split(" ");
	const prompt = "How would you like to sort values: \n 1. Words by name (from A to Z). \n 2. Show digits from the smallest. \n 3. Show digits from the biggest. \n 4. Show by quantity of letters. \n 5. Only unique words. \n 6. Show only unique values from the set of words and numbers \n \n Select (1 - 5) and press ENTER (exit to close program): ";

	rl.question(prompt, sortType => {
		if (sortType.toLowerCase() === "exit") {
			rl.close();
		} else {
			switch (sortType) {
				case "1":
					sortAlphabetically(userData);
					break;
				case "2":
					sortFromSmallest(userData);
					break;
				case "3":
					sortFromBiggest(userData);
					break;
				case "4":
					sortByLength(userData);
					break;
				case "5":
					showUniqueWords(userData);
					break;
				case "6":
					showUniqueSymbols(userData);
					break;
				default:
					console.log("Invalid choice. Please try again.");
					sortTypeInput(input);
			}
		}
	});
}

rl.on("close", () => {
	console.log("\n Good bye! Come back again!");
	process.exit();
});

dataInput();
