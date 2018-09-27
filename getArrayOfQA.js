const fs = require('fs');
let questionAndAnswers = [];

var Question = function(question, answer) {
	this.question = question;
	this.answer = answer;
};

let getArrayOfQA = function(filename)
{
	fs.readFile(filename,'utf-8', (err, content) =>
	{
		if (err)
		{
			throw err;
		}
		JSON.parse(content, (question, answer) =>
		{
			questionAndAnswers.push(new Question(question, answer));
		});
		questionAndAnswers.pop();
		questionAndAnswers.sort();
	});
	return questionAndAnswers;
};

module.exports = getArrayOfQA;