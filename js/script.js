var app = angular.module('app', [])

var baseUrl = 'https://api.github.com'
var user = 'levg34'
var pass = localStorage.token
var remainingRequests = 60
var requestLimitReset = 0
var requestUrl = baseUrl+'/users/'+user+'/repos?sort='+'pushed'
var errorCodes = [404,500]

app.controller('projectListCtrl', function($scope,$http) {
	$scope.projects = []
	$scope.refreshProjectList = function() {
		$http({
			method: 'GET',
			url: requestUrl
		}).then(function(projects) {
			$scope.projects = projects.data
			$scope.projects.forEach(function(repo) {
				repo.check = 'info'
				repo.check_icon = 'question'
				repo.favicon = 'https://pbs.twimg.com/profile_images/616309728688238592/pBeeJQDQ.png'
				if (!repo.homepage) {
					repo.homepage='#'
					repo.host = 'Code only'
					repo.disabled = 'disabled'
				} else {
					if (repo.homepage=='https://levg34.github.io') {
						repo.active = 'active'
						repo.favicon = $('link[rel="icon"]')[0].href
					}
					if (repo.name=='nodejs-chat') {
						repo.favicon = 'http://nodechat-levg34.rhcloud.com/img/favicon.ico'
					} else if (repo.name=='image-uploader') {
						repo.favicon = 'http://uploader-levg34.rhcloud.com/icon.png'
					} else if (repo.name=='openshift-sync') {
						repo.favicon = 'http://sync-levg34.rhcloud.com/ping'
					}
					if (repo.homepage.indexOf('github.io')!=-1) {
						repo.host = 'GitHub'
					} else if (repo.homepage.indexOf('rhcloud.com')!=-1) {
						repo.host = 'OpenShift'
					} else {
						repo.host = 'Unknown'
					}
					$http({
						method: 'GET',
						url: repo.homepage
					}).then(function(response) {
						var htmlDoc = $(response.data)
						for (var i=0;i<htmlDoc.length;++i) {
							if($(htmlDoc[i]).is('link[rel=icon]')){
								var favicon = $(htmlDoc[i]).attr('href')
								if (favicon[0]=='.') {
									favicon = favicon.substring(1)
								}
								if (favicon[0]=='/'&&repo.homepage[repo.homepage.length-1]=='/') {
									favicon = favicon.substring(1)
								}
								if (favicon[0]!='/'&&repo.homepage[repo.homepage.length-1]!='/') {
									favicon = '/'+favicon
								}
								repo.favicon = repo.homepage+favicon
							}
						}
						repo.check = 'success'
						repo.check_icon = 'check'
					}).catch(function(error) {
						if (!error.status||error.status<0) {
							//repo.check = 'danger'
							//repo.check_icon = 'times'
						} else if (errorCodes.indexOf(error.status)!=-1) {
							repo.check = 'danger'
							repo.check_icon = 'times'
						} else {
							repo.check = 'warning'
							repo.check_icon = 'exclamation'
						}
						//console.log(error)
					})
				}
			})
		}).catch(function(error) {
			console.log(error)
		})
	}
	$scope.refreshProjectList()
})
