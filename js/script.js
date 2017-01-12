var projectsArea = document.getElementById('projects')

var baseUrl = 'https://api.github.com'
var user = 'levg34'
var pass = localStorage.token

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest()
	xmlHttp.open('GET',theUrl,false) // false for synchronous request
	if (pass) {
		xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass))
	}
	xmlHttp.send(null)
	return xmlHttp.responseText
}

var requestUrl = baseUrl+'/users/'+user+'/repos?sort=pushed'
var repos = JSON.parse(httpGet(requestUrl))

console.log(repos)

var res = ''

repos.forEach(function(repo) {
	var branches = JSON.parse(httpGet(repo.branches_url.split('{')[0]))
	var haslink = false
	branches.forEach(function(branch){
		var name = branch.name
		if (name == 'gh-pages') {
			haslink=true
		}
	})
	if (haslink) {
		var repoUrl = 'https://levg34.github.io/'+repo.name
		res += '<a href="'+repoUrl+'">'+repo.name+'</a> - '+repo.description+'<br>'
	} else {
		res += repo.name+' - '+repo.description+'<br>'
	}
})

projectsArea.innerHTML = res
