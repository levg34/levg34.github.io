var app = angular.module('app', [])

var baseUrl = 'https://api.github.com'
var travisAPI = 'https://api.travis-ci.org/'
var checkUrl = 'https://remy-vps.guilhemdross.fr/upstate/up'
var user = 'levg34'
var pass = localStorage.token
var remainingRequests = 60
var requestLimitReset = 0
var requestUrl = baseUrl+'/users/'+user+'/repos?sort='+'pushed'+'&per_page=100'
var errorCodes = [404,500]
var dangerErrors = ['ENOTFOUND','EAI_AGAIN']

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
				repo.favicon = 'img/GitHub-Mark.png'
				if (!repo.homepage) {
					repo.homepage='#'
					repo.host = 'Code only'
					repo.disabled = 'disabled'
				} else {
					if (repo.homepage=='https://levg34.github.io') {
						repo.active = 'active'
						repo.favicon = $('link[rel=icon]')[0].href
					}
					if (repo.homepage.indexOf('github.io')!=-1) {
						repo.host = 'GitHub'
					} else if (repo.homepage.indexOf('rhcloud.com')!=-1) {
						repo.host = 'OpenShift'
					} else if (repo.homepage.indexOf('herokuapp.com')!=-1) {
						repo.host = 'Heroku'
					} else if (repo.homepage.indexOf('firebaseapp.com')!=-1||repo.homepage.indexOf('cloudfunctions.net')!=-1) {
						repo.host = 'Firebase'
						repo.travis_url = travisAPI+user+'/'+repo.name+'.svg?branch=master'
					} else {
						repo.host = 'Other'
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
							$http({
								method: 'GET',
								url: checkUrl+'?url='+repo.homepage
							}).then(function(response) {
								var code = response.data.code
								if (!code||code<0) {
									var reserror = response.data.error
									if (dangerErrors.indexOf(reserror.code)!=-1) {
										repo.check = 'danger'
										repo.check_icon = 'times'
									}
								} else if (code==200) {
									repo.check = 'success'
									repo.check_icon = 'check'
								} else if (errorCodes.indexOf(code)!=-1) {
									repo.check = 'danger'
									repo.check_icon = 'times'
								} else {
									repo.check = 'warning'
									repo.check_icon = 'exclamation'
								}
							}).catch(function(error) {
								//console.log(error)
							})
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

app.controller('waitCheckCtrl', function($scope,$http) {
	$scope.loading = true
	$scope.error = {}
	$scope.check = function() {
		$http({
			method: 'GET',
			url: checkUrl
		}).then(function(response) {
			$scope.loading = false
		}).catch(function(error) {
			$scope.loading = false
			$scope.error = error
			$scope.error.show = true
		})
	}
	$scope.check()
})
