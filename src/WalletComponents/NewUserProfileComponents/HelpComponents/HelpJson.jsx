import Log from "../../../Services/Log";

export default class HelpJson {
    constructor(jsonList) {
        var newJsonList = []
        newJsonList = jsonList.sort((a, b) => parseInt(a.themeId) - parseInt(b.themeId))
        newJsonList.map((obj, index) => {
            newJsonList[index].subthemes = obj.subthemes.sort((a, b) => parseInt(a.subThemeId.replace(/\./g, "")) - parseInt(b.subThemeId.replace(/\./g, "")));
            obj.subthemes.map((subObj, subIndex) => {
                newJsonList[index].subthemes[subIndex].questions = subObj.questions.sort((a, b) => parseInt(a.questionId.replace(/\./g, "")) - parseInt(b.questionId.replace(/\./g, "")))
            })

        })
        this.helpJson = newJsonList;
        Log.sDebug("The help json is " + this.helpJson, "HelpJSON" );
    }

    getJson = () => {
        return this.helpJson;
    }

    getFirstOrderIndexTopicMapping = () => {
        let topicList = [];
        this.helpJson.map((jsonObj) => {
            topicList.push(jsonObj.theme);
        })
        return topicList;
    }

    getSubThemes = (themeIdx) => {
        let subThemes = [];
        this.helpJson[themeIdx].subthemes.map((jsonObj) => {
            subThemes.push(jsonObj.subTheme);
        })
        return subThemes;
    }

    getQuestions = (themeIdx, subThemeIdx) => {
        let questions = [];
        this.helpJson[themeIdx].subthemes[subThemeIdx].questions.map((jsonObj) => {
            questions.push(jsonObj.question);
        })
        return questions
    }

    getQuestionId = (themeIdx, subThemeIdx, questionIdx) => {
        return this.helpJson[themeIdx].subthemes[subThemeIdx].questions[questionIdx].questionId
    }

    getQuestion = (themeIdx, subThemeIdx, questionIdx) => {
        return this.helpJson[themeIdx].subthemes[subThemeIdx].questions[questionIdx].question
    }
}
