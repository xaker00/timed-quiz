// this is where the content goes
var mainEl = $("main");
var timeEl = $('#time');

var quiz;
var instructions;
var activeQuestion = 0;
var remainingTime = 0;
var quizActive = false;

var highScores;

// show the intro and the "start quiz" button
function renderIntro() {
  mainEl.html(`
    <h3>Coding Quiz Challenge</h3>
    <p>${instructions}</p>
    <p>Keep in mind that incorrect answers will penalize your score/time by ten seconds</p>
    <button type="button" class="btn btn-primary" id="start-button">Start Quiz</button>
    `);

  var buttonEl = $("#start-button");
  buttonEl.on("click", startQuiz);
}

function startQuiz() {
  console.log("Starting Quiz");
  quizActive = true;
  activeQuestion = 0;
  remainingTime = 75;
  renderQuestion(quiz[activeQuestion]);
}

function renderQuestion(question) {
  mainEl.empty().append($("<h3>").text(question.question).addClass('question-text text-justify'));

  var olEl = $("<ol>").addClass('list-group');
  for (var i = 0; i < question.choices.length; i++) {
    olEl.append($("<li>").addClass('answer-btn list-group-item list-group-item-action').text(question.choices[i]));
  }
  mainEl.append(olEl);
}


function handleAnswer(event){
    console.log($(event.target).text());
    var answer = $(event.target).text();
    if(answer === quiz[activeQuestion].answer){
        correctAnswer();
    }else{
        incorrectAnswer();
    }
}

function correctAnswer(){
    nextQuestion();
    renderResult('correct');
}

function incorrectAnswer(){
    remainingTime -= 10;
    checkTimeOut();
    nextQuestion();
    renderResult('wrong');
}

// show the result and clear it after 1.5 seconds
function renderResult(r){
    var alertEl = $('<div>').text(r).addClass('result-text text-center p-2 m-2');
    if(r === 'correct'){
        alertEl.addClass('alert-success');
    }else{
        alertEl.addClass('alert-danger');
    }

    mainEl.append(alertEl);
    clearInterval(t);
    var t = setInterval(function(){
        $('.result-text').remove();
        clearInterval(t);
    }, 1500);
}

function nextQuestion(){
    if(activeQuestion+1 < quiz.length){
        activeQuestion++;
        renderQuestion(quiz[activeQuestion]);
    }else{
        //end the quiz

        endQuiz();
    }  
}

// out of time
function checkTimeOut(){
    if(remainingTime <= 0){
        //end the quiz
        
        endQuiz();
        
    }
}

function endQuiz(){
    var score = remainingTime;
    mainEl.empty().append($("<h3>").text('All done!'));
    mainEl.append($('<p>').text(`Your final score is: ${score}.`));
    remainingTime = 0;
    quizActive = false;
    renderTime();

    console.log('highScores.score.length', highScores.score.length);
    // check if high score
    if(highScores.score.length < 5 || score > highScores.score[highScores.score.length-1].score)
    {
        mainEl.append('<p>Enter your initials: <input id="initial"></input><button id="high-score-btn" class="btn btn-primary">Submit</button></p>');
        $('#high-score-btn').on('click', function(){
            // save the high score
            highScores.score.push({score: score, initial: $('#initial').val()});
            highScores.score.sort(function(a,b){
                return b.score - a.score;
            });
            highScores.score = highScores.score.slice(0, 5);
            saveScoreToLocal();
            renderScores();
        });
    }else{
        var buttonEl = $('<button>').text('Ok').addClass('btn btn-primary');
        buttonEl.on('click', renderIntro);
        mainEl.append(buttonEl);
    }
}

function renderScores(){
    mainEl.empty().append($('<h3>').text("High Scores"));
    var listEl = $('<ol>');
    for(var i = 0; i < highScores.score.length; i++){
        listEl.append($('<li>').text(`${highScores.score[i].initial}\t${highScores.score[i].score}`));
    }
    mainEl.append(listEl);
    var buttonEl = $('<button>').text('Close').addClass('btn btn-primary');
    buttonEl.on('click', renderIntro);
    mainEl.append(buttonEl);
}

function renderTime(){
    if(remainingTime > 0){
        timeEl.text(`Time: ${remainingTime}`);
    }else{
        timeEl.text('');
    }
}

function saveScoreToLocal(){
    localStorage.setItem('highScores', JSON.stringify(highScores));
}


mainEl.on('click', '.answer-btn', handleAnswer);
$('#view-scores').on('click', renderScores);

var quizTimer = setInterval(function(){
    if(quizActive){
        remainingTime--;
        checkTimeOut();
        renderTime();
    }
}, 1000);


// get questions and launch the quiz
fetch("./quiz.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // transfer the data to a global variable
    quiz = data.quiz;
    instructions = data.instructions;
    console.log(quiz);

    highScores = JSON.parse(localStorage.getItem('highScores'));
    if(highScores === null){
        highScores = {score: []}
        saveScoreToLocal();
    }
    console.log('highScores:', highScores);
    // start with the intro once the data is loaded
    renderIntro();
  });
