const {readFile} = require("fs").promises;

async function transformJson() {
	const fileData = await readFile("./vacations.json", {encoding: "utf-8"});
	const vacations = JSON.parse(fileData);

	const transformedData = {};

	for (const vacation of vacations) {
		const {_id: userId, name: userName} = vacation.user;
		const {startDate, endDate} = vacation;

		const newVacation = {
			startDate,
			endDate
		};

		const userVacations = transformedData[userId];

		if (userVacations) {
			userVacations.vacations.push(newVacation);
		} else {
			transformedData[userId] = {
				userId,
				userName,
				vacations: [newVacation]
			};
		}
	}

	return Object.values(transformedData);
}

transformJson().then(response => {
	console.log(JSON.stringify(response, null, 2));
});
