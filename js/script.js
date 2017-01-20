var projectsArea = document.getElementById('projects')

var baseUrl = 'https://api.github.com'
var user = 'levg34'
var pass = localStorage.token
var remainingRequests = 60
var requestLimitReset = 0

var specialRepos = [{name:'levg34.github.io',url:'.',message:' (this page)'},{name:'nodejs-chat',url:'http://nodechat-levg34.rhcloud.com/'}]

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest()
	xmlHttp.open('GET',theUrl,false) // false for synchronous request
	if (pass) {
		xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass))
	}
	try {
		xmlHttp.send(null)
		remainingRequests = xmlHttp.getResponseHeader('X-RateLimit-Remaining')
		requestLimitReset = xmlHttp.getResponseHeader('X-RateLimit-Reset')
		return xmlHttp.responseText
	} catch (e) {
		return JSON.stringify({error:e})
	}
}

var requestUrl = baseUrl+'/users/'+user+'/repos?sort='+'pushed'
var repos = {}
if (sessionStorage.repos) {
	repos = JSON.parse(sessionStorage.repos)
} else {
	repos = JSON.parse(httpGet(requestUrl))
	if (!repos.error) sessionStorage.repos = JSON.stringify(repos)
}

console.log(repos)

var res = '<ol>'

if ('forEach' in repos) repos.forEach(function(repo) {
	var branches = {}
	if (sessionStorage[repo.name+'_branches']) {
		branches = JSON.parse(sessionStorage[repo.name+'_branches'])
	} else {
		branches = JSON.parse(httpGet(repo.branches_url.split('{')[0]))
		if (!branches.error) sessionStorage[repo.name+'_branches'] = JSON.stringify(branches)
	}
	var haslink = false
	if ('forEach' in branches) branches.forEach(function(branch){
		var name = branch.name
		if (name == 'gh-pages') {
			haslink=true
		}
	})

	if (haslink) {
		var repoUrl = 'https://levg34.github.io/'+repo.name
		res += '<li><a href="'+repoUrl+'">'+repo.name+'</a> - '+repo.description+'</li>'
	} else {
		var tab = specialRepos.map(function (srepo) {
			return srepo.name
		})
		var index = tab.indexOf(repo.name)
		if (index>-1) {
			var repoUrlS = specialRepos[index].url
			res += '<li><a href="'+repoUrlS+'">'+repo.name+'</a> - '+repo.description
			if (specialRepos[index].message) {
				res += specialRepos[index].message
			}
			res += '</li>'
		} else {
			res += '<li>'+repo.name+' - '+repo.description+'</li>'
		}
	}
})

res += '</ol>'

if (res=='<ol></ol>') {
	if (remainingRequests!=null && remainingRequests < 1) {
		res = '<h2 class="error">Maximum number of requests to server exceeded!</h2>' +
			'<h3 class="error">Try again in ' + Math.floor((requestLimitReset - new Date().getTime() / 1000) / 60) + ' minutes.</h3>'
	} else if (repos.error) {
		res = '<h2 class="error">Error contacting GitHub API server.</h2>'
	} else {
		res = '<h2 class="error">An unknown problem occured.</h2>'
	}
}

projectsArea.innerHTML = res
