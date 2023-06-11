const {readFile, readdir} = require("fs").promises;

async function countUniqueNames() {
	const startTime = performance.now();

	const uniqueNames = new Set();

	const fileNames = await readdir("./data", {encoding: "utf-8"});
	const filePromises = fileNames.map(fileName => readFile(`./data/${fileName}`, {encoding: "utf-8"}));
	const filesData = await Promise.all(filePromises);

	for (const fileData of filesData) {
		const names = fileData.trim().split("\n");

		for (const name of names) {
			uniqueNames.add(name);
		}
	}

	const endTime = performance.now();
	const time = Math.round(endTime - startTime);

	return {
		count: uniqueNames.size,
		time
	};
}

async function existInSomeFiles(filesCount) {
	const startTime = performance.now();

	const fileNames = await readdir("./data", {encoding: "utf-8"});

	const totalFiles = fileNames.length;
	if (!filesCount) {
		filesCount = totalFiles;
	}

	const filePromises = fileNames.map(file => readFile(`./data/${file}`, {encoding: "utf-8"}));
	const filesData = await Promise.all(filePromises);

	const nameCounts = {};

	for (const fileData of filesData) {
		const names = fileData.trim().split("\n");
		const uniqueNames = new Set(names);

		for (const uniqueName of uniqueNames) {
			const count = nameCounts[uniqueName] || 0;
			nameCounts[uniqueName] = count + 1;
		}
	}

	let countInSomeFiles = 0;

	for (const count of Object.values(nameCounts)) {
		if (filesCount === totalFiles && count === totalFiles) {
			countInSomeFiles++;
		} else if (count >= filesCount) {
			countInSomeFiles++;
		}
	}

	const endTime = performance.now();
	const time = Math.round(endTime - startTime);

	return {
		count: countInSomeFiles,
		time,
	};
}

countUniqueNames().then(({count, time}) => {
	let totalTime = time;

	console.log("\nCount of unique usernames:", count);
	console.log(`Finished after: ${time} milliseconds\n`);

	existInSomeFiles().then(({count, time}) => {
		totalTime += time;

		console.log("Usernames occur in all 20 files:", count);
		console.log(`Finished after: ${time} milliseconds\n`);

		existInSomeFiles(10).then(({count, time}) => {
			totalTime += time;

			console.log("Usernames occur in at least 10 files:", count);
			console.log(`Finished after: ${time} milliseconds\n`);

			console.log(`Total time: ${totalTime} milliseconds (${totalTime / 1000} seconds)\n`);
		});
	});
});
