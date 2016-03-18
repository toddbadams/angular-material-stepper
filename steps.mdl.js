(function () {
    'use strict';
    var
        TEMPLATE_PATH = '/';

    angular.module('steps', ['ngMaterial'])
        .config(config)
        .service('stepsService', StepsService)
        .directive('steps', function () {
            return {
                bindingToController: {
                    model: '=',
                    componentId: '@'
                },
                scope: true,
                transclude: true,
                compile: StepsCompile,
                controller: 'steps'
            }
        })
        .component('step', {
            bindings: {
                componentId: '@',
                completed: '=',
                disabled: '='
            },
            scope: true,
            transclude: true,
            controller: 'step',
            templateUrl: TEMPLATE_PATH + 'step.html'
        })
        .controller('steps', Steps)
        .controller('step', Step);

    config.$inject = ['$mdIconProvider'];
    function config($mdIconProvider) {
        $mdIconProvider.icon('complete', TEMPLATE_PATH + 'complete.svg');
    }

    StepsService.$inject = [];
    function StepsService() {
        var publicApi = {
            setActiveStep: setActiveStep,
            isActiveStep: isActiveStep,
            getActiveStep: getActiveStep,
            getStepNumber: getStepNumber,
            registerSteps: registerSteps
        },
            steps = {},
            stepsCallback = {},
            stepNumber = {};

        function setActiveStep(stepsComponentId, stepComponentId) {
            if (angular.isDefined(stepsComponentId) && angular.isDefined(stepComponentId)) {
                steps[stepsComponentId] = stepComponentId;
                if (angular.isFunction(stepsCallback[stepsComponentId])) {
                    stepsCallback[stepsComponentId](steps[stepsComponentId]);
                }
            }
        }

        function isActiveStep(stepsComponentId, stepComponentId) {
            return angular.isDefined(stepsComponentId) &&
                angular.isDefined(stepComponentId) &&
                (getActiveStep(stepsComponentId) === stepComponentId);
        }

        function registerSteps(stepsComponentId, callback) {
            if (angular.isDefined(stepsComponentId) &&
                angular.isFunction(callback)) {
                stepsCallback[stepsComponentId] = callback;
            }
        }

        function getActiveStep(stepsComponentId) {
            return angular.isDefined(stepsComponentId) ? steps[stepsComponentId] : undefined;
        }

        function getStepNumber(stepsComponentId, stepComponentId) {
            if (angular.isDefined(stepsComponentId) && angular.isDefined(stepComponentId)) {
                if (!angular.isDefined(stepNumber[stepsComponentId])) {
                    stepNumber[stepsComponentId] = {
                        next: 1
                    }
                }
                stepNumber[stepsComponentId][stepComponentId] = stepNumber[stepsComponentId].next;
                stepNumber[stepsComponentId].next += 1;
                return stepNumber[stepsComponentId][stepComponentId];
            }
            return -1;
        }

        return publicApi;
    }

    // tranclude without the <ng-transclude>
    function StepsCompile(tElement, attrs, transclude) {
        return function ($scope) {
            transclude($scope, function (clone) {
                tElement.append(clone);
            });
        };
    }

    Steps.$inject = ['$element', 'stepsService'];
    function Steps($element, StepsService) {
        var $ctrl = this,
            stepsComponentId;

        function select(step) {
            $ctrl.model = step;
        }

        // controller activation
        (function () {
            $element.addClass('steps');
            stepsComponentId = $ctrl.componentId;
            StepsService.registerSteps(stepsComponentId, select);
            StepsService.setActiveStep(stepsComponentId, $ctrl.model);
        })();
    }

    Step.$inject = ['$element', 'stepsService'];
    function Step($element, StepsService) {
        var $ctrl = this,
            stepsComponentId,
            stepComponentId;

        function select() {
            if ($ctrl.disabled) return;
            StepsService.setActiveStep(stepsComponentId, stepComponentId);
        }

        function isActive() {
            return StepsService.isActiveStep(stepsComponentId, stepComponentId);
        }

        // controller activation
        (function () {
            var parent = $element.parent()[0];
            stepComponentId = $ctrl.componentId;
            stepsComponentId = parent.getAttribute('component-id');
            $ctrl.last = $element.next().length === 0;
            $ctrl.number = StepsService.getStepNumber(stepsComponentId, stepComponentId);
            $ctrl.select = select;
            $ctrl.isActive = isActive;
        })();
    }
})();