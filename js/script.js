var app = angular.module('app', [])

var baseUrl = 'https://api.github.com'
var user = 'levg34'
var pass = localStorage.token
var remainingRequests = 60
var requestLimitReset = 0
var requestUrl = baseUrl+'/users/'+user+'/repos?sort='+'pushed'

app.controller('projectListCtrl', function($scope,$http) {
	$scope.projects = []
	$scope.refreshProjectList = function() {
		$http({
			method: 'GET',
			url: requestUrl
		}).then(function(projects) {
			$scope.projects = projects.data
		}).catch(function(error) {
			console.log(error)
		})
	}
	$scope.refreshProjectList()
})
