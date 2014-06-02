angular.module('justChatting', [])

angular.module('justChatting').factory('socket', function($rootScope) {
    var socket = io.connect('/')
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments
                $rootScope.$apply(function() {
                    callback.apply(socket, args)
                })
            })
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args)
                    }
                })
            })
        }
    }
})

angular.module('justChatting').directive('ctrlEnterBreakLine', function() {
    return function(scope, element, attrs) {
        var ctrlDown = false
        element.bind("keydown", function(evt) {
            if (evt.which === 17) {
                ctrlDown = true
                setTimeout(function() {
                    ctrlDown = false
                }, 1000)
            }
            if (evt.which === 13) {
                if (ctrlDown) {
                    element.val(element.val() + '\n')
                } else {
                    scope.$apply(function() {
                        scope.$eval(attrs.ctrlEnterBreakLine);
                    });
                    evt.preventDefault()
                }
            }
        });
    };
});

angular.module('justChatting').controller('MessageCreatorCtrl', function($scope, socket) {
    $scope.createMessage = function () {
        socket.emit('messages.create', $scope.newMessage)
        $scope.newMessage = ''
    }
})

angular.module('justChatting').directive('autoScrollToBottom', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(
                function() {
                    return element.children().length;
                },
                function() {
                    element.animate({
                        scrollTop: element.prop('scrollHeight')
                    }, 1000);
                }
            );
        }
    };
});

angular.module('justChatting').controller('RoomCtrl', function($scope, socket) {
    $scope.messages = []
    socket.on('messages.read', function (messages) {
        $scope.messages = messages
    })
    socket.on('messages.add', function (message) {
        $scope.messages.push(message)
    })
    socket.emit('messages.read')
})