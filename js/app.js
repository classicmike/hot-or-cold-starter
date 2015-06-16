


(function($){
    var hotAndCold = {};

    hotAndCold.Utils = {};

    hotAndCold.Utils.isInteger = function(x){
        var y = parseInt(x, 10);
        return !isNaN(y) && x == y && x.toString() == y.toString();
    };

    hotAndCold.Utils.isBetween = function(intToCheck, x, y){
        if(x && y && intToCheck && hotAndCold.Utils.isInteger(x) && hotAndCold.Utils.isInteger(y)
            && hotAndCold.Utils.isInteger(intToCheck)){
            return intToCheck >= x && intToCheck <=y;
        } else {
            return false;
        }
    };


    /***--------- GUESS MODEL ------------ ***/

    hotAndCold.Guess = function(number){
        this.number = hotAndCold.Utils.isInteger(number) ? number : 0;
        this.status = hotAndCold.Answer.INCORRECT;
        hotAndCold.Guess.id++;
    };

    hotAndCold.Guess.prototype.wasCorrect = function(){
      return this.status === hotAndCold.Answer.CORRECT;
    };

    hotAndCold.Guess.id = 0;

    /***--------- GUESS MODEL ------------ ***/

    /***--------- GUESSES LIST ------------ ***/

    hotAndCold.GuessesList = function(){
        this.guesses = [];
    };

    hotAndCold.GuessesList.prototype.addGuess = function(guess){
        if(!guess){
            return;
        }

        this.guesses.push(guess);
    };

    hotAndCold.GuessesList.prototype.getPreviousGuess = function(){
        return this.guesses[this.guesses.length-1];
    };

    /***--------- GUESSES LIST ------------ ***/



    /***--------- ANSWER MODEL ------------ ***/

    hotAndCold.Answer = function(number){
      this.number = hotAndCold.Utils.isInteger(number) ? number: 0;
    };

    hotAndCold.Answer.INCORRECT = false;
    hotAndCold.Answer.CORRECT = true;

    /***--------- ANSWER MODEL ------------ ***/


    /***--------- HOT AND COLD CONTROLLER ------------ ***/

    hotAndCold.Controller = function(){
        this.setUp();
    };


    //reset the game
    hotAndCold.Controller.prototype.setUp = function(){
        this.guessesList = new hotAndCold.GuessesList();
        this.generateCorrectAnswer();
        console.log('Correct Answer: ' + this.correctAnswer.number);
    };

    //check if the number is correct and returns either true or false
    hotAndCold.Controller.prototype.checkIfCorrect = function(number){
        var result = false;

        if(hotAndCold.Utils.isInteger(number)){

            var guess = new hotAndCold.Guess(parseInt(number));

            if(parseInt(this.correctAnswer.number) === guess.number){
                guess.status = hotAndCold.Answer.CORRECT;
                result = true;
            }

            this.guessesList.addGuess(guess);

        }

        return result;

    };

    hotAndCold.Controller.prototype.generateCorrectAnswer = function(){
        this.correctAnswer = new hotAndCold.Answer(parseInt((Math.random() * 100) + 1));
    };

    hotAndCold.Controller.prototype.calculateGuessAnswerDifference = function(){
        var lastGuess = this.guessesList.getPreviousGuess();

        return Math.abs(parseInt(this.correctAnswer.number) - parseInt(lastGuess.number));
    };


    /***--------- HOT AND COLD CONTROLLER ------------ ***/

    /***--------- HOT AND COLD VIEW ------------ ***/
    hotAndCold.View = function(controller){
        if(controller){
            this.controller = controller;
            this.setEvents();
            this.feedbackElement = $('#' + hotAndCold.View.FEEDBACK_ID);
            this.overlayElement = $('.' + hotAndCold.View.OVERLAY_CLASS);
            this.countElement = $('#' + hotAndCold.View.COUNT_ID);
            this.guessListElement = $('#' + hotAndCold.View.GUESS_LIST_ID);
            this.submitElement = $('#' + hotAndCold.View.SUBMIT_BUTTON_ID);
            this.guessInputElement = $('#' + hotAndCold.View.GUESS_INPUT_ID);
        }
    };

    hotAndCold.View.prototype.setEvents = function(){
        $('form').on('submit', this.submit.bind(this));
        $(".what").on('click', this.whatClicked.bind(this));
        $("a.close").on('click', this.closeClicked.bind(this));
        $('a.new').on('click', this.newClicked.bind(this));
    };

    hotAndCold.View.prototype.whatClicked = function(event){
        this.overlayElement.fadeIn(1000);
    };

    hotAndCold.View.prototype.closeClicked = function(){
        this.overlayElement.fadeOut(1000);
    };

    hotAndCold.View.prototype.newClicked = function(){
        this.resetUI();
    };

    hotAndCold.View.prototype.submit = function(event){
        event.preventDefault();


        var guessNumber = this.guessInputElement.val();
        var feedbackFlag = hotAndCold.View.SWITCH_TO_WRONG;

        if(this.submitElement.val() === hotAndCold.View.START_AGAIN_TEXT){
            $('a.new').trigger('click');
            return;
        }

        //process the guess
        if(!hotAndCold.Utils.isInteger(guessNumber)){
            alert('Oops, this number is not an integer. Please try again');
            return;
        }

        if(!hotAndCold.Utils.isBetween(guessNumber, 1, 100)){
            alert('Oops, you need to enter a number between 1 and 100');
            return;
        }


        if(this.controller.checkIfCorrect(guessNumber)){
            feedbackFlag = hotAndCold.View.SWITCH_TO_CORRECT;
            this.updateSubmitElement(true);
        }

        this.renderFeedbackElement(feedbackFlag);
        this.renderCountElement(this.controller.guessesList.guesses.length);
        this.renderGuestListElement(this.controller.guessesList.guesses);

    };

    hotAndCold.View.prototype.renderCountElement = function(number){
        if(!hotAndCold.Utils.isInteger(number)){
            return;
        }

        this.countElement.text(number);
    };

    hotAndCold.View.prototype.renderFeedbackElement = function(switchTo){

        if(!switchTo){
            return;
        }

        switch(switchTo){
            case hotAndCold.View.SWITCH_TO_CORRECT:
                this.feedbackElement.addClass('correct');
                this.feedbackElement.text(hotAndCold.View.CORRECT_ANSWER_TEXT);
            break;

            case hotAndCold.View.SWITCH_TO_WRONG:
                this.feedbackElement.removeClass('correct');
                //need to check to see if what text to update
                this.feedbackElement.text(this.getHotColdMessage() + hotAndCold.View.WRONG_ANSWER_TEXT);
            break;

            default:
                this.feedbackElement.removeClass('correct');
                this.feedbackElement.text(hotAndCold.View.DEFAULT_TEXT);
            break;
        }

    };

    hotAndCold.View.prototype.updateSubmitElement = function(changeToStartOver){
        if(changeToStartOver){
            this.submitElement.val(hotAndCold.View.START_AGAIN_TEXT);
        } else {
            this.submitElement.val(hotAndCold.View.SUBMIT_TEXT);
        }
    };


    hotAndCold.View.prototype.resetUI = function(){
        this.controller.setUp();

        this.guessInputElement.val('');
        this.updateSubmitElement();
        this.renderFeedbackElement(hotAndCold.View.SWITCH_TO_DEFAULT);
        this.renderCountElement(this.controller.guessesList.guesses.length);
        this.renderGuestListElement(this.controller.guessesList.guesses);
    };

    hotAndCold.View.prototype.getHotColdMessage = function(){
        //need to get the last guess, get the correct answer and check the range
        var difference = this.controller.calculateGuessAnswerDifference();
        var message = hotAndCold.View.HOT_COLD_MESSAGE_STARTER;

        if(difference > 50){
            message += hotAndCold.View.ICE_COLD_TEXT;
        } else if(difference > 30 && difference <= 50){
            message += hotAndCold.View.COLD_TEXT;
        } else if(difference > 20 && difference <= 30){
            message += hotAndCold.View.WARM_TEXT;
        } else if(difference > 10 && difference <= 20){
            message += hotAndCold.View.HOT_TEXT;
        } else if(difference >= 1 && difference <= 10){
            message += hotAndCold.View.VERY_HOT_TEXT;
        }

        message += '! ';

        return message;
    };



    hotAndCold.View.prototype.renderGuestListElement = function(list){
        if(!list){
            return;
        }

        this.guessListElement.empty();

        for(var i = 0; i < list.length; i++){
            var guess = list[i];

            this.guessListElement.append('<li>' + guess.number + '</li>');
        }


    };

    //other elements in the view.
    hotAndCold.View.COUNT_ID = 'count';
    hotAndCold.View.GUESS_LIST_ID = 'guessList';
    hotAndCold.View.OVERLAY_CLASS = 'overlay';

    //guess submit button
    hotAndCold.View.SUBMIT_TEXT = 'Guess';
    hotAndCold.View.SUBMIT_BUTTON_ID = 'guessButton';

    hotAndCold.View.START_AGAIN_TEXT = 'Start Again';

    //guess input
    hotAndCold.View.GUESS_INPUT_ID = 'userGuess';

    //feedback element based static variables
    hotAndCold.View.FEEDBACK_ID = 'feedback';
    hotAndCold.View.FEEDBACK_CORRECT_CLASSNAME = 'correct';

    //feedback based text responses.
    hotAndCold.View.CORRECT_ANSWER_TEXT = 'Yay! You have guessed the number!';
    hotAndCold.View.DEFAULT_TEXT = 'Make your Guess!';

    hotAndCold.View.HOT_COLD_MESSAGE_STARTER = 'Your\'e Getting ';
    hotAndCold.View.WRONG_ANSWER_TEXT = 'Try Again!';

    hotAndCold.View.ICE_COLD_TEXT = 'Ice Cold';
    hotAndCold.View.COLD_TEXT = 'Cold';
    hotAndCold.View.WARM_TEXT = 'Warm';
    hotAndCold.View.HOT_TEXT = 'Hot';
    hotAndCold.View.VERY_HOT_TEXT = 'Very Hot';

    //integers used to switch between the feedback states
    hotAndCold.View.SWITCH_TO_WRONG = 1;
    hotAndCold.View.SWITCH_TO_DEFAULT = 2;
    hotAndCold.View.SWITCH_TO_CORRECT = 3;






    /***--------- HOT AND COLD VIEW ------------ ***/



    $(document).ready(function(){

        /*--- Display information modal box ---*/
        var hotAndColdController = new hotAndCold.Controller();
        var hotAndColdView = new hotAndCold.View(hotAndColdController);



    });



})(jQuery);




