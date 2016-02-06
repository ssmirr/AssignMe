var request = require('request');
var fs = require("fs");

// reading the token from file - Synchronous read
var token = fs.readFileSync('token');

//**************************************************************
//**************************************************************
//************* Creation / Assignment functions ****************
//**************************************************************
//**************************************************************

/**
 * Creates repository under the given org and given name
 */
function createRepo(name, org) {
	var options = {
		// url: ' https://api.github.com/user/repos',
		url: 'https://api.github.com/orgs/' + org + '/repos',
		method: 'POST',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		},
		json: {
			"name": name,
			"auto_init": true,
			"public": true,
			"gitignore_template": "nanoc"
		}
	};

	request(options, function (error, response, body) {
		console.log("Created repository: " + name);
	});
}

/**
 * Deletes a repository under the given org
 * Notice: if using OAuth, the `delete_repo` scope is required
 * 
 * @param repoName repository name
 * @param org Organization name
 */
function deleteRepo(repoName, org) {
	var options = {
		url: 'https://api.github.com/repos/' + org + '/' + repoName,
		method: 'DELETE',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Deleted repository: " + repoName);
	});
}

/**
 * Created a team under the given org
 * @param teamName Team name
 * @param org Organization name
 */
function createTeam(teamName, org) {
	var options = {
		url: 'https://api.github.com/orgs/' + org + '/teams',
		method: 'POST',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		},
		json: {
			"name": teamName,
			"auto_init": true,
			"public": true,
			"gitignore_template": "nanoc"
		}
	};

	request(options, function (error, response, body) {
		var ID = body.id;
		return ID;
	});
}


/**
 * Adds the given repository to the given team
 * 
 * @param repoName Repository name
 * @param teamName Team name
 * @param org Organization name 
 */
function addRepoToTeam(repoName, teamName, org) {
	var options = {
		url: 'https://api.github.com/teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
		method: 'PUT',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Added repository: " + repoName + " to Team: " + teamName + " in " + org + "organization");
	});
}

/**
 * Deletes a team, given it's id
 * 
 * @param id Team id
 */
function deleteTeam(id) {
	var options = {
		url: 'https://api.github.com/teams/' + id.toString(),
		method: 'DELETE',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Deleted team: " + id.toString());
	});
}






/**
 * Gets team data for all teams under the given organization
 * 
 * @param org Organization name
 */
function getTeamData(org) {
	var options = {
		url: 'https://api.github.com/orgs/' + org + '/teams',
		method: 'GET',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		fs.writeFile("team.json", body, function (err) { });
	});
}

/**
 * Parses the team data to get team id for the given team name 
 *
 * @param teamName Team name
 * @param org Organization name
 */
function getTeamId(teamName, org) {
	var obj = JSON.parse(fs.readFileSync('./team.json', 'utf8'));
	for (var i = 0; i < obj.length; i++) {
		if (obj[i].name == teamName)
			return obj[i].id;
	}
}


/**
 * Removes a repository from a team inside the given org
 * 
 * @param repoName Repository name
 * @param teamName Team name
 * @param org Organization name
 */
function removeTeamRepository(repoName, teamName, org) {
	var options = {
		url: 'https://api.github.com/teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
		method: 'DELETE',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Deleted team repository: " + teamName);
	});
}


/**
 * Adds a user to the given team
 * 
 * @param username username of the user
 * @param teamName Team name
 * @param org Organization name
 */
function addUserToTeam(username, teamName, org) {
	var options = {
		url: 'https://api.github.com/teams/' + getTeamId(teamName, org) + '/memberships/' + username,
		method: 'PUT',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Added " + username + " to team: " + teamName);
	});
}


/**
 * Removes a user from the given team.
 * 
 * @param username The user's username
 * @param teamName Team name
 * @param org Organization name
 */
function removeUserFromTeam(username, teamName, org) {
	var options = {
		url: 'https://api.github.com/teams/' + getTeamId(teamName, org) + '/memberships/' + username,
		method: 'DELETE',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log("Removed " + username + " from team: " + teamName);
	});
}

/**
 * Updates team repository permissions
 * 
 * @param repoName repository name
 * @param teamName team name
 * @org orgnaization name
 * @permission new permission level : "pull", "push", "admin"
 */
function updateTeamRepositoryPermissions(repoName, teamName, org, permission) {
	var options = {
		url: 'https://api.github.com/teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
		method: 'PUT',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		},
		json: {
			"permission": permission
		}
	};

	request(options, function (error, response, body) {
		console.log("Updated permission on repository: " + repoName + " to " + permission);
	});
}


//**************************************************************
//**************************************************************
//************************** Testing****************************
//**************************************************************
//**************************************************************




var usernames = ["theferrit32", "shorsher", "chbrown13", "sheckman", "jctetter", "ssmirr"];
// create team and repos 1-6
// for (var i = 0; i < 6; i++) {
// 	createTeam(i.toString(), "assignme");
// 	createRepo(i.toString(), "assignme");
// }

//get team data
// getTeamData("assignme");

//Assign repository to teams:
// for (var i = 0; i < 6; i++) {
// 	addRepoToTeam(i, i, "assignme");
// }

//Adding users to teams:
// for (var i = 0; i < 6; i++) {
// 	addUserToTeam(usernames[i], i, "assignme");
// }

//Update repo permissions:
// for (var i = 0; i < 6; i++) {
// 	updateTeamRepositoryPermissions(i, i, "assignme", "pull");	
// }

//removing users from teams:
// for (var i = 0; i < 6; i++) {
// 	removeUserFromTeam(usernames[i], i, "assignme");
// }

//remove repository 1-6 from teams 1-6
// for (var i = 0; i < 6; i++) {
// 	removeTeamRepository(i, i, "assignme");
// }

//delete team 1-6
// for (var i = 0; i < 6; i++) {
// 		deleteTeam(getTeamId(i.toString(), "assignme"));
// }

//delete repo 1-6
// for (var i = 0; i < 20; i++) {
// 	deleteRepo(i.toString(), "assignme");
// }

