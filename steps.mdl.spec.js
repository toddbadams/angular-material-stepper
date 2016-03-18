(function () {

    var
        parent = {
            getAttribute: sinon.stub()
        },
        next = {
            length: chance.integer()
        },
        $elementStub = {
            addClass: sinon.stub(),
            next: sinon.stub().returns(next),
            parent: sinon.stub().returns([parent])
        },
        stepNumber = chance.integer(),
        ipgStepsServiceStub = {
            setActiveStep: sinon.stub(),
            isActiveStep: sinon.stub(),
            getActiveStep: sinon.stub(),
            getStepNumber: sinon.stub().returns(stepNumber),
            registerSteps: sinon.stub()
        },
        stepsComponentId = chance.word(),
        stepComponentId = chance.word(),
        stepsCallback = sinon.stub();

    _T.createModuleTest('ipg.steps')
        .injectModule('ngMaterial')
        .injectService({ name: '$element', value: $elementStub })
        .describe(function () {
            var moduleTest = this;

            moduleTest.createServiceTest('ipgStepsService')
                .describe(function () {
                    var serviceTest = this;

                    describe('setActiveStep', function () {
                        it('should set the step', function () {
                            serviceTest.angularService.setActiveStep(stepsComponentId, stepComponentId);
                            var result = serviceTest.angularService.getActiveStep(stepsComponentId);
                            result.should.be.equal(stepComponentId);
                        });
                    });

                    describe('registerSteps', function () {
                        it('should run the callback when setting the step value', function () {
                            serviceTest.angularService.registerSteps(stepsComponentId, stepsCallback);
                            serviceTest.angularService.setActiveStep(stepsComponentId, stepComponentId);
                            stepsCallback.should.have.been.called;
                        });
                    });
                });

            moduleTest.createControllerTest('ipgSteps')
                .injectService({ name: 'ipgStepsService', value: ipgStepsServiceStub })
                .describe(function () {
                    it('should add "ipg-steps" class to the element', function () {
                        $elementStub.addClass.should.have.been.calledWith('ipg-steps');
                    });
                });

            moduleTest.createControllerTest('ipgStep')
                .injectService({ name: 'ipgStepsService', value: ipgStepsServiceStub })
                .describe(function () {
                    var controllerTest = this;

                    it('should get the parent steps element', function () {
                        $elementStub.parent.should.have.been.called;
                    });

                    it('should determine if is the last step', function () {
                        controllerTest.angularController.last.should.be.false;
                    });

                    it('should calculate the step number', function () {
                        controllerTest.angularController.number.should.be.equal(stepNumber);
                    });

                    describe('on step select', function () {
                        beforeEach(function () {
                            controllerTest.angularController.select();
                        });

                        it('should set the step number', function () {
                            ipgStepsServiceStub.setActiveStep.should.be.called;
                        });
                    });
                });

        });
})();