const axios = require("axios");

const urls = {
	url1: "https://jsonbase.com/sls-team/json-793",
	url2: "https://jsonbase.com/sls-team/json-955",
	url3: "https://jsonbase.com/sls-team/json-231",
	url4: "https://jsonbase.com/sls-team/json-931",
	url5: "https://jsonbase.com/sls-team/json-93",
	url6: "https://jsonbase.com/sls-team/json-342",
	url7: "https://jsonbase.com/sls-team/json-770",
	url8: "https://jsonbase.com/sls-team/json-491",
	url9: "https://jsonbase.com/sls-team/json-281",
	url10: "https://jsonbase.com/sls-team/json-718",
	url11: "https://jsonbase.com/sls-team/json-310",
	url12: "https://jsonbase.com/sls-team/json-806",
	url13: "https://jsonbase.com/sls-team/json-469",
	url14: "https://jsonbase.com/sls-team/json-258",
	url15: "https://jsonbase.com/sls-team/json-516",
	url16: "https://jsonbase.com/sls-team/json-79",
	url17: "https://jsonbase.com/sls-team/json-706",
	url18: "https://jsonbase.com/sls-team/json-521",
	url19: "https://jsonbase.com/sls-team/json-350",
	url20: "https://jsonbase.com/sls-team/json-64",
};

function objectExplorer(obj) {
	for (const [key, value] of Object.entries(obj)) {
		const isObject = typeof value === "object" && !Array.isArray(value);

		if (key === "isDone") {
			return value;
		} else if (isObject) {
			const result = objectExplorer(value);

			if (result !== undefined) return result;
		}
	}
}

async function app(urls) {
	let trueValues = 0;
	let falseValues = 0;

	for (const url of Object.values(urls)) {
		let isAvailable = false;

		for (let attempt = 0; !isAvailable && attempt < 3; attempt++) {
			try {
				const {data} = await axios.get(url);
				isAvailable = true;

				const isDone = objectExplorer(data);

				isDone ? trueValues++ : falseValues++;

				console.log(`[Success] ${url}: isDone - ${isDone}`);
			} catch (e) {
				// attempt failed
			}
		}

		if (!isAvailable) {
			console.log(`[Fail] ${url}: The endpoint is unavailable`);
		}
	}

	return {
		trueValues,
		falseValues
	};
}

app(urls).then(({trueValues, falseValues}) => {
	console.log(`\nFound True values: ${trueValues},`);
	console.log(`Found False values: ${falseValues}`);
});
