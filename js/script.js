var projectsArea = document.getElementById('projects')

var baseUrl = 'https://api.github.com'
var user = 'levg34'
var pass = localStorage.token
var remainingRequests = 60
var requestLimitReset = 0

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest()
	xmlHttp.open('GET',theUrl,false) // false for synchronous request
	if (pass) {
		xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass))
	}
	xmlHttp.send(null)
	remainingRequests = xmlHttp.getResponseHeader('X-RateLimit-Remaining')
	requestLimitReset = xmlHttp.getResponseHeader('X-RateLimit-Reset')
	return xmlHttp.responseText
}

var requestUrl = baseUrl+'/users/'+user+'/repos?sort='+'pushed'
var repos
if (sessionStorage.repos) {
	repos = JSON.parse(sessionStorage.repos)
} else {
	repos = JSON.parse(httpGet(requestUrl))
	sessionStorage.repos = JSON.stringify(repos)
}

console.log(repos)

var res = '<ol>'

repos.forEach(function(repo) {
	var branches
	if (sessionStorage[repo.name+'_branches']) {
		branches = JSON.parse(sessionStorage[repo.name+'_branches'])
	} else {
		branches = JSON.parse(httpGet(repo.branches_url.split('{')[0]))
		sessionStorage[repo.name+'_branches'] = JSON.stringify(branches)
	}
	var haslink = false
	branches.forEach(function(branch){
		var name = branch.name
		if (name == 'gh-pages') {
			haslink=true
		}
	})
	if (haslink) {
		var repoUrl = 'https://levg34.github.io/'+repo.name
		res += '<li><a href="'+repoUrl+'">'+repo.name+'</a> - '+repo.description+'</li>'
	} else {
		res += '<li>'+repo.name+' - '+repo.description+'</li>'
	}
})

res += '</ol>'

if (res=='<ol></ol>') {
	if (remainingRequests<1) {
		res = '<h2 class="error">Maximum number of requests to server exceeded!</h2>' +
			'<h3 class="error">Try again in ' + Math.floor((requestLimitReset-new Date().getTime()/1000) / 60) + ' minutes</h3>'
	} else {
		res = '<h2 class="error">An unknown problem occured</h2>'
	}
}

projectsArea.innerHTML = res
sessionStorage.clear()