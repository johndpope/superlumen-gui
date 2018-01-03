import Comm from '../../util/comm.js'
import Security from '../../util/security.js';
import ViewModel from '../view-model.js';
import Model from './model.js';

const MinQuestions = 5;
const MaxQuestions = 20;

export default class RecoveryQuestionsViewModel extends ViewModel {
    constructor() {
        super();

        this.model = new Model();
    }

    static init() {
        return new RecoveryQuestionsViewModel();
    }

    render() {
        let self = this;
        //add a q/a
        Comm.send('RecoveryQuestionsWindow.readRecovery', null, function(e, arg) {
            if (arg && arg.questions && arg.questions.length) {
                for (let x = 0; x < arg.questions.length; x++) {
                    let q = arg.questions[x];
                    let a = arg.answers[x];
                    let tr = self.addQARow(false, false);
                    tr.find('.question').val(q);
                    tr.find('.answer').val(a);
                }
                self.updateModel();
                self.updateMetrics();
            } else {
                for (let x = 0; x < MinQuestions; x++) {
                    self.addQARow(false, false);
                }
            }
        });
        //focus first input
        $('input:visible:first').focus().select();
        //help
        $('#link-help-guidelines').click(this, this.onHelpGuidelinesClick);
        //handle questions
        $('.button-add-qa').click(this, this.onAddQAClick);
        //footer buttons
        $('.button-cancel').click(this, this.onCancelClick);
        $('.button-save').click(this, this.onSaveClick);
    }

    onHelpGuidelinesClick(e) {
        $('#help-guidelines').fadeToggle();
    }

    onDeleteQAClick(e) {
        let self = e.data;
        $(this).closest('tr').remove();
        let qaCount = $('table.list tbody tr').length;
        $('.button-add-qa').prop('disabled', (qaCount >= MaxQuestions));
        self.updateMetrics();
    }

    onAddQAClick(e) {
        let self = e.data;
        self.addQARow(true, true);
    }

    onQAKeypress(e) {
        let self = e.data;
        self.updateMetrics();
    }

    onCancelClick(e) {
        window.close();
    }

    onRemoveClick(e) {
        let self = e.data;
        //clear q & a
        self.model.questions = [];
        self.model.answers = [];
        //TODO
        window.close();
    }

    onSaveClick(e) {
        let self = e.data;
        let str = self.updateMetrics();
        self.updateModel();
        if (self.model.answers.length < MinQuestions) {
            alert(`At least ${MinQuestions} questions must be configured.`);
            return;
        } else if (str.rank <= 0.4) {
            alert(`Your total answer strength is too weak. Recovery records must have at least medium strength protection.`);
            return;
        }
        Comm.send('RecoveryQuestionsWindow.setRecovery', self.model, function (e, arg) {
            if (arg) {
                window.close();
            } else {
                alert('Unable to save recovery record settings due to the wallet being locked or unavailable.');
            }
        });
    }

    /**
     * Updates the user interface with the current strength and Q&A metrics.
     * @returns {Security.StrengthRank}
     */
    updateMetrics() {
        let count = 0;
        let concatpw = '';
        //get count
        $('table.list tr').each(function () {
            let q = $(this).find('.question').val();
            let a = $(this).find('.answer').val();
            if (q && a) {
                count++;
                concatpw += a;
            }
        });
        //get strength
        let str = Security.strength(concatpw);
        //update UI
        $('#span-answer-count').text(count);
        $('#span-answer-strength').text(str.label);
        $('.button-save').prop('disabled', (count < 5));
        return str;
    }

    /**
     * Updates the model object with values from the DOM.
     */
    updateModel() {
        let self = this;
        self.model.questions = [];
        self.model.answers = [];
        $('table.list tr').each(function () {
            let q = $(this).find('.question').val();
            let a = $(this).find('.answer').val();
            if (q && a) {
                self.model.questions.push(q);
                self.model.answers.push(a);
            }
        });
    }

    /**
     * Adds a new Q & A row to the table.
     * @param {Boolean} focus - If true, the new question input will be focused.
     * @param {Boolean} scroll - If true, the document will scroll to the newly inserted row
     */
    addQARow(focus, scroll) {
        let qaCount = $('table.list tbody tr').length;
        if (qaCount < MaxQuestions) {
            let html = `<tr>
                <td><input type="text" class="question" placeholder="Enter: Question" maxlength="128" /></td>
                <td><input type="text" class="answer" placeholder="Enter: Answer" maxlength="896" /></td>
                <td class="text-right"><button class="button"><i class="fa fa-trash"></i></button></td>
            </tr>`;
            let tr = $(html);
            tr.find('.question, .answer').keyup(this, this.onQAKeypress);
            tr.find('button').click(this, this.onDeleteQAClick);
            $('table.list tbody').append(tr);
            if (scroll) {
                console.log('shouldnt happen');
                window.scrollTo(0, document.body.scrollHeight);
            }
            if (focus) {
                tr.find('input:first').focus();
            }
            qaCount++;
            return tr;
        }
        $('.button-add-qa').prop('disabled', (qaCount >= MaxQuestions));
        return null;
    }

}