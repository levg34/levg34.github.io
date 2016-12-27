var projectsArea = document.getElementById('projects')

var baseUrl = 'https://api.github.com'
var requestUrl = baseUrl+'/users/levg34/repos'

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest()
	xmlHttp.open( "GET", theUrl, false ) // false for synchronous request
	xmlHttp.send( null )
	return xmlHttp.responseText
}

var repos = JSON.parse(httpGet(requestUrl))

var res = ''

repos.forEach(function(repo) {
	if (repo.name!='levg34.github.io') {
		var repoUrl = 'https://levg34.github.io/'+repo.name
		res += '<a href="'+repoUrl+'">'+repo.name+'</a> - '+repo.description+'<br>'
	}
})

projectsArea.innerHTML = res
