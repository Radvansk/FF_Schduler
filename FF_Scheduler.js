//setTeamsForRml();
$('#createSchedule').on('click', generateSchedule);
$('#createSchedule').click();
//var _leagueMemberData = [];
function generateSchedule() {
	var teams = getTeams();
	if (teams.length !== 12) return;
	setTeamInfo(teams);
	setLeagueSchedule();
	renderSchedule();
}
function getTeams() {
	var teams = [];
	$('.division-inputs input[name^="team"]').each(function() {
		var $this = $(this);
		var name = $this.val().trim();
		var isValid = true;
		if (name === '') {
			alert('Please enter a name for all 12 teams');
			isValid = false;
		}
		for (var i = 0; i < teams.length; i++) {
			if (teams[i].toLowerCase() === name.toLowerCase()) {
				alert(name + ' has already been entered.  Names must be unique.');
				isValid = false;
				break;
			}
		}
		if (!isValid) return false;
		teams.push(name);
	});
	return teams;
}
function setTeamInfo(teams) {
	var teamData = [];
	for (var i = 0; i < teams.length; i++) {
		var obj = {};
		obj.id = i;
		obj.name = teams[i];
		obj.divisionId = (i <=3) ? 1 : (i <= 7) ? 2 : 3;
		obj.schedule = [];
		for (var j = 1; j <= 14; j++) obj.schedule.push(null);
		teamData.push(obj);
	}
	console.log('teamdata', teamData);
	_leagueMemberData = teamData;
}
function setTeamsForRml() {
	var members = ['Scott', 'Aborub', 'Henley', 'Steve', 'Bruno','Jeff', 'Seth', 'Bob', 'James', 'Chuck', 'John', 'Tony'];
	for (var i = 0; i < members.length; i++) $('.division-inputs input[name="team' + (i+1) + '"]').val(members[i]);
}
function setLeagueSchedule() {
	setDivisionWeeks();
	setNonDivisionWeeks();
}
function setDivisionWeeks() {
	for (var i = 0; i < _leagueMemberData.length; i++) {
		var team = _leagueMemberData[i];
		for (var j = 1; j <= 3; j++) setDivisionOpponent(team, j);
		for (var k = 12; k <= 14; k++) setDivisionOpponent(team, k);
	}
}
function setDivisionOpponent(currentTeam, weekNumber) {
	var weekIndex = weekNumber - 1;	
	var opponentForWeek = currentTeam.schedule[weekIndex];
	var hasOpponentSet = opponentForWeek != null;
	if (hasOpponentSet) return;
	var teamId = currentTeam.id;
	var divisionId = currentTeam.divisionId;
	var divisionOpponents = getOpponents(teamId, divisionId, true);
	var opponent = {};
	for (var i = 0; i < divisionOpponents.length; i++) {
		var divOpponent = divisionOpponents[i];
		var lastWeekScheduled = divOpponent.schedule.lastIndexOf(teamId);
		if (divOpponent.schedule[weekIndex] == null && ((weekNumber <= 3 && lastWeekScheduled < 0) || (weekNumber >= 12 && lastWeekScheduled < 11))) {
			// no game for opponent scheduled and has not played division opponent within first 3 or last 3 weeks yet
			opponent = divOpponent;
			break;
		}
	}
	addGameToSchedule(teamId, opponent.id, weekNumber);
}
function addGameToSchedule(teamId, opponentId, weekNumber) {
	if (isNaN(teamId) || isNaN(opponentId)) {	
		console.log('addGameToSchedule', 'id column invalid', teamId, opponentId, weekNumber);
		return;
	}
	var weekIndex = weekNumber - 1;
	var currentTeam = getTeamById(teamId);
	currentTeam.schedule[weekIndex] = opponentId;
	var opposingTeam = getTeamById(opponentId);
	opposingTeam.schedule[weekIndex] = teamId;
	console.log('GAME ADDED', currentTeam.name, 'vs', opponentId);
	console.log('GAME ADDED', opposingTeam.name, 'vs', teamId);
}
function getOpponents(teamId, divisionId, isDivisionOpponent) {
	var opponents = [];
	for (var i = 0 ; i < _leagueMemberData.length; i++) {
		var member = _leagueMemberData[i];
		if (member.id === teamId) continue;
		if ((isDivisionOpponent && member.divisionId === divisionId) || (!isDivisionOpponent && member.divisionId !== divisionId)) opponents.push(member);	
	}
	return opponents;
}
function getTeamById(teamId) {
	for (var i = 0; i < _leagueMemberData.length; i++) {
		if (teamId === _leagueMemberData[i].id) return _leagueMemberData[i];
	}
	console.log('getTeamById', 'No Team Found with id of' + teamId);
	return null;
}
function setNonDivisionWeeks(weekNumber) {
	var teamData = [];
	for (var i = 0; i <= 11; i++) {
		var obj = {};
		obj.id = i;
		obj.teamsInSchedule = [];
		obj.excludedTeams = i < 4 ? [0, 1, 2, 3] : i > 7 ? [8, 9, 10, 11] : [4, 5, 6, 7];
		teamData.push(obj);
	}
	console.log(teamData);
	var gameCombinations = [];
	for (var j = 0; j < teamData.length; j++) {
		var team = teamData[j];
		var id = team.id;
		var exclusions = team.excludedTeams;
		for (var k = 0; k < teamData.length; k++) {
			var opponent = teamData[k];
			if (exclusions.indexOf(opponent.id) >= 0) continue;
			var isComboInserted = false;
			for (var l = 0; l < gameCombinations.length; l++) {
				var x = gameCombinations[l];
				if (x.indexOf(id) >= 0 && x.indexOf(opponent.id) >= 0) {
					isComboInserted = true;
					break;
				}
			}
			if (!isComboInserted) gameCombinations.push([id, opponent.id, true]);
		}
	}
	var weekLogs = {
		week4: [
			[0, 4], 
			[1, 5],
			[6, 10],
			[7, 11],	
			[2, 8],
			[3, 9]
		],
		week5: [
			[0, 5], 
			[1, 6],
			[7, 8],
			[2, 9],
			[3, 10],
			[4, 11]
		],
		week6: [
			[0, 11], 
			[1, 10],
			[2, 7],
			[5, 9],
			[3, 6],
			[4, 8]
		],
		week7: [
			[0, 10], 
			[1, 4],
			[2, 5],
			[3, 11],
			[7, 9],
			[6, 8]
		],
		week8: [
			[0, 6], 
			[1, 11],
			[2, 10],
			[3, 7],
			[4, 9],
			[5, 8]
		],
		week9: [
			[0, 8], 
			[1, 9],
			[6, 11],
			[7, 10],
			[2, 4],
			[3, 5]
		],
		week10: [
			[0, 7],
			[6, 9],
			[2, 11],
			[1, 8],
			[5, 10],
			[3, 4]
		],
		week11: [
			[0, 9],
			[1, 7],
			[3, 8],
			[4, 10],
			[2, 6],
			[5, 11]
		]		
	}
	console.log('weekLogs', weekLogs);
	/**
	// used this to help build weekLogs manually.  i tried programatically and had serious issues getting 6 unique games that don't repeat per week 
	for (var l = 0; l < gameCombinations.length; l++) {
		var matchup = gameCombinations[l];
		var team1 = matchup[0];
		var team2 = matchup[1];
		var isAvailable = matchup[2];
		if (isAvailable == false) alert('schedule error');
		for (var prop in weekLogs) {
			if (Object.prototype.hasOwnProperty.call(weekLogs, prop)) {
				var schedule = weekLogs[prop];
				var teamsInSchedule = [];
				for (var m = 0; m < schedule.length; m++) {
					var game = schedule[m];
					//console.log('game', game);
					if (teamsInSchedule.indexOf(game[0]) >= 0) console.log(prop + 'schedule error\ndouble-booked' + game[0]);
					if (teamsInSchedule.indexOf(game[1]) >= 0) console.log(prop + 'schedule error\ndouble-booked' + game[1]);
					teamsInSchedule.push(game[0]);
					teamsInSchedule.push(game[1]);
					if (game.indexOf(team1) >= 0 && game.indexOf(team2) >= 0) {
						if (gameCombinations[l][2] == false) alert(prop + ' schedule error\n' + team1 + ' v ' + team2);	
						gameCombinations[l][2] = false;
					}
				}
			}
		}
	}
	// console.log('gameCombinations', gameCombinations); 
	**/
	var weekIndex = 4;
	for (var prop in weekLogs) {
		if (Object.prototype.hasOwnProperty.call(weekLogs, prop)) {
			var schedule = weekLogs[prop];
			console.log('schedule', schedule);
			for (var m = 0; m < schedule.length; m++) {
				var game = schedule[m];
				addGameToSchedule(game[0], game[1], weekIndex);			
			}
		}
		weekIndex++;
	}
	/**
	// verify unique non-divisional games
	for (var n = 0; n < _leagueMemberData.length; n++) {
		var team = _leagueMemberData[n];
		var sched = team.schedule;
		var nonDivisionalGames = [];
		for (var o = 4; o <= 11; o++) {
			var schedIndex = o-1;
			var opponent = sched[schedIndex];
			if (nonDivisionalGames.indexOf(opponent) >= 0) alert('double book!');
			nonDivisionalGames.push(opponent);
		}
	}
	**/
}
function renderSchedule() {
	console.log('hey');
	var html = '<ul class="flex">';
	for (var i = 1; i <= 14; i++) {
		html += '<li><h2>Week ' + i + '</h2><table id="week' + i + '" cellspacing="0" cellpadding="0">';
		html += '<thead><tr><th>Home</th><th>Away</th></thead><tbody>';
		var teamsInWeek = [];
		for (var j = 0; j < _leagueMemberData.length; j++) {
			var team = _leagueMemberData[j];
			var schedule = team.schedule;
			var opponentId = schedule[i-1]
			if (teamsInWeek.indexOf(team.id) >= 0 || teamsInWeek.indexOf(opponentId) >= 0) continue;
			var opponentName = getTeamById(opponentId).name;
			var isHome = i%2 == 0;
			html += '<tr>';
			if (isHome) 
				html += '<td>' + team.name + '</td><td>' + opponentName + '</td>';
			else
				html += '<td>' + opponentName + '</td><td>' + team.name + '</td>';
			html += '</tr>';
			teamsInWeek.push(team.id);
			teamsInWeek.push(opponentId);
		}
		html += '</tbody></table></li>';
	}
	html += '</ul>';
	$('#leagueSchedules').html(html);
}